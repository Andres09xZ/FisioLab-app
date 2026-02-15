"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, FileText, Activity, Target, Plus, Eye } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  tipo_documento: string
  documento: string
  celular: string
  email: string
  direccion: string
  fecha_nacimiento: string
  sexo: string
  edad: number
  emergencia_nombre: string
  emergencia_telefono: string
  activo: boolean
}

interface HistoriaClinica {
  id: string
  fecha_creacion: string
  motivo_consulta: string
  enfermedad_actual: string
}

interface Evaluacion {
  id: string
  fecha_creacion: string
  motivo_consulta: string
  diagnostico_fisio: string
  eva_score: number
  version_numero: number
  es_activa: boolean
  planes?: Plan[]
}

interface Plan {
  id: string
  fecha_inicio: string
  objetivos: string
  objetivo_general?: string
  total_sesiones: number
  numero_sesiones?: number
  sesiones_completadas: number
  estado: string
}

export default function PacienteDetallePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
  const [historias, setHistorias] = useState<HistoriaClinica[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchData(token)
    }
  }, [params.id, router])

  const fetchData = async (token: string) => {
    setLoading(true)
    try {
      const pacienteRes = await fetch(`http://localhost:3001/api/pacientes/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (pacienteRes.ok) {
        const data = await pacienteRes.json()
        if (data.success && data.data) {
          setPaciente(data.data)
        }
      }

      const historiasRes = await fetch(`http://localhost:3001/api/pacientes/${params.id}/historias`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (historiasRes.ok) {
        const data = await historiasRes.json()
        if (data.success && data.data) {
          setHistorias(data.data)
        }
      }

      const evaluacionesRes = await fetch(`http://localhost:3001/api/v2/evaluaciones/pacientes/${params.id}/evaluaciones`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      let evaluacionesConPlanes: Evaluacion[] = []
      
      if (evaluacionesRes.ok) {
        const data = await evaluacionesRes.json()
        if (data.success && data.data) {
          // Cargar planes para cada evaluación
          evaluacionesConPlanes = await Promise.all(
            data.data.map(async (evaluacion: Evaluacion) => {
              try {
                const planesRes = await fetch(
                  `http://localhost:3001/api/v2/planes?evaluacion_id=${evaluacion.id}`,
                  { headers: { Authorization: `Bearer ${token}` } }
                )
                if (planesRes.ok) {
                  const planesData = await planesRes.json()
                  return {
                    ...evaluacion,
                    planes: planesData.success && planesData.data ? planesData.data : [],
                  }
                }
              } catch (error) {
                console.error(`Error cargando planes para evaluación ${evaluacion.id}:`, error)
              }
              return { ...evaluacion, planes: [] }
            })
          )
          setEvaluaciones(evaluacionesConPlanes)
        }
      }

      const planesRes = await fetch(`http://localhost:3001/api/v2/planes?paciente_id=${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (planesRes.ok) {
        const data = await planesRes.json()
        if (data.success && data.data) {
          // Consolidar planes únicos desde evaluaciones y la consulta general
          const planesDeEvaluaciones = evaluacionesConPlanes.flatMap((e: Evaluacion) => e.planes || [])
          const todosLosPlanes = [...data.data, ...planesDeEvaluaciones]
          
          // Eliminar duplicados basándose en ID
          const planesUnicos = Array.from(
            new Map(todosLosPlanes.map((plan: Plan) => [plan.id, plan])).values()
          )
          
          setPlanes(planesUnicos)
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la informacion del paciente",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getEvaScoreBadge = (score: number) => {
    if (score <= 3) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Leve ({score})</Badge>
    } else if (score <= 6) {
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Moderado ({score})</Badge>
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200">Severo ({score})</Badge>
    }
  }

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { bg: string; text: string; border: string; label: string }> = {
      planificado: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-300", label: "Planificado" },
      en_progreso: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", label: "En Progreso" },
      completado: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Completado" },
      suspendido: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Suspendido" },
      cancelado: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Cancelado" },
    }
    const config = badges[estado] || badges.planificado
    return (
      <Badge className={`${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </Badge>
    )
  }

  if (!user || loading) return null

  if (!paciente) {
    return <div className="p-8">Paciente no encontrado</div>
  }

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => router.push("/pacientes")}
                className="mb-4 h-10 border-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Pacientes
              </Button>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    {paciente.nombres} {paciente.apellidos}
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {paciente.tipo_documento} {paciente.documento} - {paciente.edad} años
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {paciente.activo ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Activo
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-600 border-slate-300">
                      Inactivo
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Card className="mb-6 border border-slate-300 rounded">
              <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-600" />
                  Informacion Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Celular</p>
                    <p className="text-sm text-slate-900">{paciente.celular || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Email</p>
                    <p className="text-sm text-slate-900">{paciente.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Sexo</p>
                    <p className="text-sm text-slate-900">{paciente.sexo === "M" ? "Masculino" : "Femenino"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Fecha de Nacimiento</p>
                    <p className="text-sm text-slate-900">
                      {paciente.fecha_nacimiento 
                        ? format(new Date(paciente.fecha_nacimiento), "dd/MM/yyyy", { locale: es })
                        : "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs font-medium text-slate-500 mb-1">Direccion</p>
                    <p className="text-sm text-slate-900">{paciente.direccion || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Contacto de Emergencia</p>
                    <p className="text-sm text-slate-900">{paciente.emergencia_nombre || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Telefono de Emergencia</p>
                    <p className="text-sm text-slate-900">{paciente.emergencia_telefono || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="evaluaciones" className="space-y-6">
              <TabsList className="bg-white border border-slate-300">
                <TabsTrigger value="historias" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
                  <FileText className="h-4 w-4 mr-2" />
                  Historias Clinicas ({historias.length})
                </TabsTrigger>
                <TabsTrigger value="evaluaciones" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
                  <Activity className="h-4 w-4 mr-2" />
                  Evaluaciones ({evaluaciones.length})
                </TabsTrigger>
                <TabsTrigger value="planes" className="data-[state=active]:bg-cyan-50 data-[state=active]:text-cyan-700">
                  <Target className="h-4 w-4 mr-2" />
                  Planes de Tratamiento ({planes.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="historias" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Historias Clinicas</h3>
                  <Button
                    onClick={() => router.push(`/historias-clinicas?paciente_id=${paciente.id}`)}
                    className="h-9 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Historia
                  </Button>
                </div>
                {historias.length > 0 ? (
                  <div className="grid gap-4">
                    {historias.map((historia) => (
                      <Card key={historia.id} className="border border-slate-300 rounded hover:border-cyan-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900 mb-2">
                                {historia.motivo_consulta}
                              </p>
                              <p className="text-xs text-slate-600 line-clamp-2">
                                {historia.enfermedad_actual}
                              </p>
                              <p className="text-xs text-slate-500 mt-2">
                                {format(new Date(historia.fecha_creacion), "dd/MM/yyyy HH:mm", { locale: es })}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/historias-clinicas/${historia.id}`)}
                              className="ml-4 h-8 hover:bg-cyan-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border border-slate-300 rounded">
                    <CardContent className="p-12 text-center">
                      <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No hay historias clinicas registradas</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="evaluaciones" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Evaluaciones Fisioterapeuticas</h3>
                  <Button
                    onClick={() => router.push(`/evaluaciones/nueva?paciente_id=${paciente.id}`)}
                    className="h-9 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Evaluacion
                  </Button>
                </div>
                {evaluaciones.length > 0 ? (
                  <div className="grid gap-4">
                    {evaluaciones.map((evaluacion) => (
                      <Card key={evaluacion.id} className="border border-slate-300 rounded hover:border-cyan-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm font-medium text-slate-900">
                                  {evaluacion.diagnostico_fisio}
                                </p>
                                <Badge variant="outline" className="text-xs">v{evaluacion.version_numero}</Badge>
                                {evaluacion.es_activa && (
                                  <Badge className="bg-cyan-50 text-cyan-700 border-cyan-200 text-xs">Activa</Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mb-2">{evaluacion.motivo_consulta}</p>
                              <div className="flex items-center gap-4 mt-2">
                                {getEvaScoreBadge(evaluacion.eva_score)}
                                <p className="text-xs text-slate-500">
                                  {format(new Date(evaluacion.fecha_creacion), "dd/MM/yyyy", { locale: es })}
                                </p>
                              </div>
                              
                              {/* Plan de tratamiento de esta evaluación */}
                              {evaluacion.planes && evaluacion.planes.length > 0 ? (
                                <div className="mt-4 pt-4 border-t border-slate-200">
                                  <p className="text-xs font-medium text-slate-500 mb-3">Plan de Tratamiento</p>
                                  {evaluacion.planes.map((plan) => {
                                    const porcentaje = plan.porcentaje_completado || 
                                      Math.round(((plan.sesiones_completadas || 0) / (plan.total_sesiones || 1)) * 100)
                                    
                                    return (
                                      <div key={plan.id} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-slate-900">
                                              Progreso del Plan
                                            </p>
                                            {getEstadoBadge(plan.estado)}
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => router.push(`/planes/${plan.id}`)}
                                            className="h-8 hover:bg-cyan-50 hover:border-cyan-300"
                                          >
                                            <Eye className="h-3 w-3 mr-1" />
                                            Ver Plan
                                          </Button>
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-600">
                                              {plan.sesiones_completadas || 0} de {plan.total_sesiones} sesiones completadas
                                            </span>
                                            <span className="font-semibold text-cyan-700">{porcentaje}%</span>
                                          </div>
                                          <div className="w-full bg-slate-200 rounded-full h-2">
                                            <div
                                              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
                                              style={{ width: `${porcentaje}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : null}
                            </div>
                            <div className="ml-4 flex flex-col gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/evaluaciones/${evaluacion.id}`)}
                                className="h-8 hover:bg-cyan-50"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                              {(!evaluacion.planes || evaluacion.planes.length === 0) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/planes/crear?evaluacion_id=${evaluacion.id}`)}
                                  className="h-8 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Crear Plan
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border border-slate-300 rounded">
                    <CardContent className="p-12 text-center">
                      <Activity className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No hay evaluaciones registradas</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="planes" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-slate-900">Planes de Tratamiento</h3>
                  <Button
                    onClick={() => router.push("/planes/nuevo")}
                    className="h-9 bg-cyan-600 hover:bg-cyan-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Plan
                  </Button>
                </div>
                {planes.length > 0 ? (
                  <div className="grid gap-4">
                    {planes.map((plan) => (
                      <Card key={plan.id} className="border border-slate-300 rounded hover:border-cyan-300 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="text-sm font-medium text-slate-900">{plan.objetivos}</p>
                                {getEstadoBadge(plan.estado)}
                              </div>
                              <div className="flex items-center gap-6 mt-2">
                                <div>
                                  <p className="text-xs text-slate-500">Sesiones</p>
                                  <p className="text-sm font-medium text-slate-900">
                                    {plan.sesiones_completadas} / {plan.total_sesiones}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Inicio</p>
                                  <p className="text-sm text-slate-900">
                                    {format(new Date(plan.fecha_inicio), "dd/MM/yyyy", { locale: es })}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3">
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-cyan-600 transition-all"
                                    style={{
                                      width: `${(plan.sesiones_completadas / plan.total_sesiones) * 100}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/planes/${plan.id}`)}
                              className="ml-4 h-8 hover:bg-cyan-50"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border border-slate-300 rounded">
                    <CardContent className="p-12 text-center">
                      <Target className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-600">No hay planes de tratamiento registrados</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}


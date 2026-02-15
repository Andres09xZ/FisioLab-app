"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Target, Activity, User, FileText, Paperclip } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Plan {
  id: string
  evaluacion_id: string
  objetivos: string
  total_sesiones: number
  frecuencia_semanal: number
  fecha_inicio: string
  fecha_fin_estimada?: string
  fecha_fin_real?: string
  estado: string
  notas?: string
  creado_por?: string
  fecha_creacion: string
  fecha_actualizacion: string
  nombre_paciente?: string
  diagnostico_fisio?: string
  sesiones_completadas?: number
  sesiones_pendientes?: number
  porcentaje_completado?: number
  celular_paciente?: string
  motivo_consulta?: string
}

interface Evaluacion {
  id: string
  paciente_id: string
  fecha_creacion: string
  motivo_consulta: string
  diagnostico_fisio: string
  eva_score: number
  version_numero: number
}

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  edad: number
  documento: string
}

export default function PlanDetallePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<Plan | null>(null)
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null)
  const [paciente, setPaciente] = useState<Paciente | null>(null)
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
      // Obtener plan
      const planRes = await fetch(`http://localhost:3001/api/v2/planes/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!planRes.ok) throw new Error("Error al cargar plan")
      const planData = await planRes.json()
      if (planData.success && planData.data) {
        setPlan(planData.data)

        // Obtener evaluación si existe
        if (planData.data.evaluacion_id) {
          const evalRes = await fetch(`http://localhost:3001/api/v2/evaluaciones/${planData.data.evaluacion_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (evalRes.ok) {
            const evalData = await evalRes.json()
            if (evalData.success && evalData.data) {
              setEvaluacion(evalData.data)
              
              // Obtener paciente desde la evaluación
              if (evalData.data.paciente_id) {
                const pacRes = await fetch(`http://localhost:3001/api/pacientes/${evalData.data.paciente_id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                })
                if (pacRes.ok) {
                  const pacData = await pacRes.json()
                  if (pacData.success && pacData.data) {
                    setPaciente(pacData.data)
                  }
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la información del plan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleTerminarPlan = async () => {
    const token = localStorage.getItem("fisiolab_token")
    if (!token || !plan) return

    if (!confirm("¿Estás seguro de que deseas terminar este plan de tratamiento? Esta acción marcará el plan como completado.")) {
      return
    }

    try {
      const response = await fetch(`http://localhost:3001/api/v2/planes/${plan.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          estado: 'COMPLETADO',
          fecha_fin_real: new Date().toISOString().split('T')[0]
        }),
      })

      if (!response.ok) throw new Error("Error al terminar plan")

      const data = await response.json()
      if (data.success) {
        toast({
          title: "Plan terminado",
          description: "El plan de tratamiento ha sido marcado como completado",
        })
        setPlan({ ...plan, estado: 'COMPLETADO', fecha_fin_real: new Date().toISOString() })
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo terminar el plan de tratamiento",
        variant: "destructive",
      })
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { bg: string; text: string; border: string; label: string }> = {
      ACTIVO: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200", label: "Activo" },
      PAUSADO: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pausado" },
      PENDIENTE_CIERRE: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: "Pendiente Cierre" },
      COMPLETADO: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Completado" },
      CANCELADO: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", label: "Cancelado" },
    }
    const config = estados[estado] || estados.ACTIVO
    return (
      <Badge className={`${config.bg} ${config.text} ${config.border}`}>
        {config.label}
      </Badge>
    )
  }

  if (!user || loading) return null

  if (!plan) {
    return <div className="p-8">Plan no encontrado</div>
  }

  const sesionesCompletadas = plan.sesiones_completadas || 0
  const progresoPorcentaje = plan.porcentaje_completado || 0
  const duracionEstimada = Math.ceil(plan.total_sesiones / plan.frecuencia_semanal)
  
  // Parsear objetivos (viene como texto con formato)
  const objetivosTexto = plan.objetivos || ""
  const objetivoGeneral = objetivosTexto.split("Objetivo General:")[1]?.split("\n\nObjetivos Específicos:")[0]?.trim() || objetivosTexto
  const objetivosEspecificos = objetivosTexto.includes("Objetivos Específicos:") 
    ? objetivosTexto.split("Objetivos Específicos:")[1]
        ?.split("\n")
        .filter(line => line.trim())
        .map(obj => obj.replace(/^\d+\.\s*/, "").trim())
    : []

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Header con navegación contextual */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => paciente ? router.push(`/pacientes/${paciente.id}`) : router.push("/planes")}
                className="mb-4 h-10 border-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {paciente ? `Volver a ${paciente.nombres}` : "Volver a Planes"}
              </Button>

              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Plan de Tratamiento
                  </h1>
                  {paciente && (
                    <p className="text-sm text-slate-600 mt-1">
                      {paciente.nombres} {paciente.apellidos} - {paciente.edad} años
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getEstadoBadge(plan.estado)}
                  {(plan.estado === 'ACTIVO' || plan.estado === 'PAUSADO') && (
                    <Button
                      onClick={handleTerminarPlan}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      Terminar Plan
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Contexto de Evaluación */}
            {evaluacion && (
              <Card className="mb-6 border border-cyan-300 bg-cyan-50/50 rounded">
                <CardHeader className="border-b border-cyan-200 py-3 px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-4 w-4 text-cyan-600" />
                      <CardTitle className="text-base font-semibold text-cyan-900">
                        Evaluación
                      </CardTitle>
                    </div>
                    <span className="text-xs text-cyan-700">
                      {format(new Date(evaluacion.fecha_creacion), "EEEE d 'de' MMMM 'de' yyyy", { locale: es }).charAt(0).toUpperCase() + format(new Date(evaluacion.fecha_creacion), "EEEE d 'de' MMMM 'de' yyyy", { locale: es }).slice(1)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div>
                      <p className="text-sm font-semibold text-cyan-700 mb-2">Diagnóstico Fisioterapéutico</p>
                      <p className="text-lg font-medium text-cyan-900">{evaluacion.diagnostico_fisio}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <p className="text-xs font-medium text-cyan-700 mb-1">Motivo de Consulta</p>
                        <p className="text-sm text-cyan-900">{evaluacion.motivo_consulta}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-cyan-700 mb-1">Escala EVA</p>
                        <p className="text-sm text-cyan-900">{evaluacion.eva_score}/10</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/evaluaciones/${evaluacion.id}`)}
                      className="h-8 border-cyan-300 text-cyan-700 hover:bg-cyan-100"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Ver Evaluación Completa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Objetivos */}
            <Card className="mb-6 border border-slate-300 rounded">
              <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-cyan-600" />
                  Objetivos Terapéuticos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Objetivo General</p>
                    <p className="text-sm text-slate-900">{objetivoGeneral}</p>
                  </div>
                  {objetivosEspecificos && objetivosEspecificos.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Objetivos Específicos</p>
                      <ul className="space-y-1">
                        {objetivosEspecificos.map((objetivo, index) => (
                          <li key={index} className="text-sm text-slate-900 flex items-start gap-2">
                            <span className="text-cyan-600 mt-1">•</span>
                            <span>{objetivo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Progreso */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-600" />
                    Progreso
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-slate-900">{Math.round(progresoPorcentaje)}%</span>
                      <span className="text-sm text-slate-600">
                        {sesionesCompletadas} / {plan.total_sesiones} sesiones
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-600 rounded-full transition-all"
                        style={{ width: `${progresoPorcentaje}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-600" />
                    Configuración
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Frecuencia</p>
                      <p className="text-sm text-slate-900">{plan.frecuencia_semanal}x semana</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Total Sesiones</p>
                      <p className="text-sm text-slate-900">{plan.total_sesiones} sesiones</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Duración Estimada</p>
                      <p className="text-sm text-slate-900">{duracionEstimada} semanas</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Fecha Inicio</p>
                      <p className="text-sm text-slate-900">
                        {format(new Date(plan.fecha_inicio), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generación de Sesiones */}
            {sesionesCompletadas === 0 && plan.estado === "ACTIVO" && (
              <Card className="border border-emerald-300 bg-emerald-50/50 rounded">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-emerald-900 mb-1">
                        📅 Generar Sesiones
                      </h3>
                      <p className="text-sm text-emerald-700">
                        Este plan no tiene sesiones agendadas. Genera automáticamente las {plan.total_sesiones} sesiones.
                      </p>
                    </div>
                    <Button
                      onClick={() => router.push(`/planes/${plan.id}/generar-sesiones`)}
                      className="bg-emerald-600 hover:bg-emerald-700 border border-emerald-600"
                    >
                      🚀 Generar Sesiones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Información Adicional */}
            <Card className="mt-6 border border-slate-300 rounded">
              <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Fecha de Creación</p>
                    <p className="text-slate-900">
                      {format(new Date(plan.fecha_creacion), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">Última Actualización</p>
                    <p className="text-slate-900">
                      {format(new Date(plan.fecha_actualizacion), "dd/MM/yyyy HH:mm", { locale: es })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-1">ID del Plan</p>
                    <p className="text-slate-600 text-xs font-mono">{plan.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

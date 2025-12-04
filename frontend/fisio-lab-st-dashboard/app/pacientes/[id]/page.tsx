"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { useToast } from "@/components/ui/use-toast"
import {
  ArrowLeft,
  User,
  Calendar,
  ClipboardList,
  Target,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  Zap
} from "lucide-react"

const API_BASE = "http://localhost:3001/api"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  tipo_documento: string
  documento: string
  edad: number
  sexo: string
  celular: string
  email: string
  activo: boolean
}

interface Evaluacion {
  id: string
  fecha_evaluacion: string
  motivo_consulta: string
  diagnostico?: string
  desde_cuando?: string
  tratamientos_anteriores?: string
}

interface Plan {
  id: string
  objetivo: string
  sesiones_plan: number
  sesiones_completadas: number
  estado: string
  fecha_creacion: string
  evaluacion_id: string
}

export default function PacienteDetallePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const pacienteId = params.id as string

  const [user, setUser] = useState<any>(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showSesionesModal, setShowSesionesModal] = useState(false)
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false)
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [planForm, setPlanForm] = useState({
    objetivo: "",
    sesiones_plan: 10,
    notas: ""
  })
  const [sesionesForm, setSesionesForm] = useState({
    fecha_inicio: "",
    hora: "10:00",
    dias_semana: [1, 3, 5],
    profesional_id: 1
  })
  const [evaluacionForm, setEvaluacionForm] = useState({
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    profesion: "",
    tipo_trabajo: "",
    sedestacion_prolongada: "",
    esfuerzo_fisico: "",
    motivo_consulta: "",
    desde_cuando: "",
    asimetria: "",
    atrofias_musculares: "",
    inflamacion: "",
    equimosis: "",
    edema: "",
    otros_hallazgos: "",
    observaciones_inspeccion: "",
    contracturas: "",
    irradiacion: false,
    hacia_donde: "",
    intensidad: "",
    sensacion: "",
    limitacion_izquierdo: "",
    limitacion_derecho: "",
    crujidos: "",
    amplitud_movimientos: "",
    diagnostico: "",
    tratamientos_anteriores: ""
  })

  // Cargar usuario desde localStorage
  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  // Queries
  const { data: paciente, isLoading: loadingPaciente, error: errorPaciente } = useQuery({
    queryKey: ['paciente', pacienteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pacientes/${pacienteId}`)
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al cargar paciente")
      return result.data as Paciente
    },
    enabled: !!pacienteId,
    retry: 1,
    retryDelay: 1000
  })

  const { data: evaluaciones = [], isLoading: loadingEvaluaciones } = useQuery({
    queryKey: ['evaluaciones', pacienteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pacientes/${pacienteId}/evaluaciones`)
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al cargar evaluaciones")
      // Filtrar evaluaciones con datos válidos
      const evaluacionesData = (result.data as Evaluacion[]) || []
      return evaluacionesData.filter(ev => ev && ev.id)
    },
    enabled: !!pacienteId,
    retry: 1,
    retryDelay: 1000
  })

  const { data: planes = [], isLoading: loadingPlanes } = useQuery({
    queryKey: ['planes', pacienteId],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/pacientes/${pacienteId}/planes`)
      if (!res.ok) throw new Error(`Error HTTP: ${res.status}`)
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al cargar planes")
      // Filtrar planes con datos válidos
      const planesData = (result.data as Plan[]) || []
      return planesData.filter(plan => plan && plan.id)
    },
    enabled: !!pacienteId,
    retry: 1,
    retryDelay: 1000
  })

  // Mutations
  const createEvaluacionMutation = useMutation({
    mutationFn: async (data: typeof evaluacionForm) => {
      if (!pacienteId) {
        throw new Error("No se ha identificado el paciente")
      }
      const res = await fetch(`${API_BASE}/evaluaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          paciente_id: pacienteId
        })
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Error HTTP: ${res.status}`)
      }
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al crear la evaluación")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', pacienteId] })
      setShowEvaluacionModal(false)
      setEvaluacionForm({
        fecha_evaluacion: new Date().toISOString().split('T')[0],
        profesion: "",
        tipo_trabajo: "",
        sedestacion_prolongada: "",
        esfuerzo_fisico: "",
        motivo_consulta: "",
        desde_cuando: "",
        asimetria: "",
        atrofias_musculares: "",
        inflamacion: "",
        equimosis: "",
        edema: "",
        otros_hallazgos: "",
        observaciones_inspeccion: "",
        contracturas: "",
        irradiacion: false,
        hacia_donde: "",
        intensidad: "",
        sensacion: "",
        limitacion_izquierdo: "",
        limitacion_derecho: "",
        crujidos: "",
        amplitud_movimientos: "",
        diagnostico: "",
        tratamientos_anteriores: ""
      })
      toast({
        title: "¡Evaluación creada!",
        description: "La evaluación fisioterapéutica se ha registrado exitosamente",
      })
    },
    onError: (error: Error) => {
      console.error("Error al crear evaluación:", error)
      toast({
        title: "Error al crear evaluación",
        description: error.message || "Ocurrió un error desconocido",
        variant: "destructive",
      })
    }
  })

  const createPlanMutation = useMutation({
    mutationFn: async (data: typeof planForm) => {
      if (!selectedEvaluacion) {
        throw new Error("No se ha seleccionado una evaluación")
      }
      const res = await fetch(`${API_BASE}/evaluaciones/${selectedEvaluacion}/planes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Error HTTP: ${res.status}`)
      }
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al crear el plan")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planes', pacienteId] })
      queryClient.invalidateQueries({ queryKey: ['evaluaciones', pacienteId] })
      setShowPlanModal(false)
      setSelectedEvaluacion(null)
      setPlanForm({ objetivo: "", sesiones_plan: 10, notas: "" })
      toast({
        title: "¡Plan creado!",
        description: "El plan de tratamiento se ha creado exitosamente",
      })
    },
    onError: (error: Error) => {
      console.error("Error al crear plan:", error)
      toast({
        title: "Error al crear plan",
        description: error.message || "Ocurrió un error desconocido",
        variant: "destructive",
      })
    }
  })

  const generarSesionesMutation = useMutation({
    mutationFn: async (data: typeof sesionesForm) => {
      if (!selectedPlan) {
        throw new Error("No se ha seleccionado un plan")
      }
      const res = await fetch(`${API_BASE}/planes/${selectedPlan}/generar-sesiones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Error HTTP: ${res.status}`)
      }
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al generar sesiones")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planes', pacienteId] })
      setShowSesionesModal(false)
      setSelectedPlan(null)
      toast({
        title: "¡Sesiones generadas!",
        description: "Las sesiones se han programado exitosamente",
      })
    },
    onError: (error: Error) => {
      console.error("Error al generar sesiones:", error)
      toast({
        title: "Error al generar sesiones",
        description: error.message || "Ocurrió un error desconocido",
        variant: "destructive",
      })
    }
  })

  const handleCrearPlan = (evaluacionId: string) => {
    setSelectedEvaluacion(evaluacionId)
    setShowPlanModal(true)
  }

  const handleGenerarSesiones = (planId: string) => {
    setSelectedPlan(planId)
    setShowSesionesModal(true)
  }

  const handleSubmitPlan = () => {
    if (!planForm.objetivo.trim()) {
      toast({
        title: "Error",
        description: "El objetivo es requerido",
        variant: "destructive",
      })
      return
    }
    createPlanMutation.mutate(planForm)
  }

  const handleSubmitSesiones = () => {
    if (!sesionesForm.fecha_inicio) {
      toast({
        title: "Error",
        description: "La fecha de inicio es requerida",
        variant: "destructive",
      })
      return
    }
    generarSesionesMutation.mutate(sesionesForm)
  }

  const handleSubmitEvaluacion = () => {
    if (!evaluacionForm.motivo_consulta.trim()) {
      toast({
        title: "Error",
        description: "El motivo de consulta es requerido",
        variant: "destructive",
      })
      return
    }
    createEvaluacionMutation.mutate(evaluacionForm)
  }

  const toggleDia = (dia: number) => {
    setSesionesForm(prev => ({
      ...prev,
      dias_semana: prev.dias_semana.includes(dia)
        ? prev.dias_semana.filter(d => d !== dia)
        : [...prev.dias_semana, dia].sort()
    }))
  }

  const getInitials = (nombres: string, apellidos: string) => {
    return `${nombres.charAt(0)}${apellidos.charAt(0)}`.toUpperCase()
  }

  if (loadingPaciente) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopbar user={user} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </main>
        </div>
      </div>
    )
  }

  if (errorPaciente || !paciente) {
    return (
      <div className="flex h-screen bg-gray-50">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopbar user={user} />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-600 mb-2">
                    {errorPaciente ? "Error al cargar los datos del paciente" : "Paciente no encontrado"}
                  </p>
                  {errorPaciente && (
                    <p className="text-sm text-red-600 mb-4">
                      {(errorPaciente as Error).message}
                    </p>
                  )}
                  <Button onClick={() => router.push('/pacientes')} className="mt-4">
                    Volver a pacientes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    )
  }

  const planesActivos = planes.filter((p: Plan) => p.estado === 'activo')
  const progreso = planesActivos.length > 0
    ? (planesActivos[0].sesiones_completadas / planesActivos[0].sesiones_plan) * 100
    : 0

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Botón Volver */}
            <Button
              variant="outline"
              onClick={() => router.push('/pacientes')}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a pacientes
            </Button>

            {/* Header - Información del Paciente */}
            <Card className="border-t-4 border-t-emerald-500">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  {/* Avatar Grande */}
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-3xl">
                        {getInitials(paciente.nombres, paciente.apellidos)}
                      </span>
                    </div>
                    {paciente.activo && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1.5">
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {paciente.nombres} {paciente.apellidos}
                        </h1>
                        <div className="flex items-center gap-4 text-gray-600 mb-3">
                          <span className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            {paciente.tipo_documento}: {paciente.documento}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {paciente.edad} años
                          </span>
                          <Badge className={paciente.activo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            {paciente.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Celular</p>
                        <p className="font-medium text-gray-900">{paciente.celular}</p>
                      </div>
                      {paciente.email && (
                        <div>
                          <p className="text-gray-600 mb-1">Email</p>
                          <p className="font-medium text-gray-900">{paciente.email}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600 mb-1">Sexo</p>
                        <p className="font-medium text-gray-900">
                          {paciente.sexo === "M" ? "Masculino" : paciente.sexo === "F" ? "Femenino" : "Otro"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-center">
                          <ClipboardList className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-blue-900">{evaluaciones.length}</p>
                          <p className="text-xs text-blue-700">Evaluaciones</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-emerald-50 border-emerald-200">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-center">
                          <Target className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                          <p className="text-2xl font-bold text-emerald-900">{planesActivos.length}</p>
                          <p className="text-xs text-emerald-700">Planes Activos</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evaluaciones Fisioterapéuticas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-blue-600" />
                  Evaluaciones Fisioterapéuticas
                </CardTitle>
                <Button
                  onClick={() => setShowEvaluacionModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva Evaluación
                </Button>
              </CardHeader>
              <CardContent>
                {loadingEvaluaciones ? (
                  <div className="space-y-3">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                  </div>
                ) : evaluaciones.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No hay evaluaciones registradas</p>
                    <Button 
                      onClick={() => setShowEvaluacionModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nueva evaluación
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {evaluaciones.map((evaluacion: Evaluacion) => {
                      const tienePlan = planes.some((p: Plan) => p.evaluacion_id === evaluacion.id)
                      const fechaValida = evaluacion.fecha_evaluacion && !isNaN(new Date(evaluacion.fecha_evaluacion).getTime())
                      return (
                        <Card key={evaluacion.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                          <CardContent className="pt-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <Badge variant="outline" className="text-xs">
                                    {fechaValida 
                                      ? format(new Date(evaluacion.fecha_evaluacion), "d 'de' MMMM, yyyy", { locale: es })
                                      : "Fecha no disponible"
                                    }
                                  </Badge>
                                  {tienePlan && (
                                    <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Plan creado
                                    </Badge>
                                  )}
                                </div>
                                <h4 className="font-semibold text-gray-900 mb-1">{evaluacion.motivo_consulta}</h4>
                                {evaluacion.diagnostico && (
                                  <p className="text-sm text-gray-700 mb-1">
                                    <span className="font-medium">Diagnóstico:</span> {evaluacion.diagnostico}
                                  </p>
                                )}
                                {evaluacion.desde_cuando && (
                                  <p className="text-xs text-gray-600">Desde hace: {evaluacion.desde_cuando}</p>
                                )}
                              </div>
                              {!tienePlan && (
                                <Button
                                  onClick={() => handleCrearPlan(evaluacion.id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Crear Plan
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Planes de Tratamiento */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-600" />
                  Planes de Tratamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingPlanes ? (
                  <div className="space-y-3">
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : planes.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No hay planes de tratamiento</p>
                    <p className="text-sm text-gray-500 mb-4">Crea una evaluación primero para poder generar un plan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {planes.map((plan: Plan) => {
                      const sesionesTotal = plan.sesiones_plan || 1
                      const sesionesCompletadas = plan.sesiones_completadas || 0
                      const progresoPlan = (sesionesCompletadas / sesionesTotal) * 100
                      const sesionesRestantes = sesionesTotal - sesionesCompletadas
                      const fechaCreacionValida = plan.fecha_creacion && !isNaN(new Date(plan.fecha_creacion).getTime())
                      
                      return (
                        <Card key={plan.id} className={`border-l-4 ${plan.estado === 'activo' ? 'border-l-emerald-500' : 'border-l-gray-400'}`}>
                          <CardContent className="pt-5">
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900">{plan.objetivo}</h4>
                                    <Badge className={plan.estado === 'activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}>
                                      {plan.estado === 'activo' ? 'Activo' : 'Finalizado'}
                                    </Badge>
                                  </div>
                                  {fechaCreacionValida && (
                                    <p className="text-xs text-gray-600">
                                      Creado el {format(new Date(plan.fecha_creacion), "d 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Progreso: {sesionesCompletadas} de {sesionesTotal} sesiones
                                  </span>
                                  <span className="font-semibold text-emerald-600">
                                    {Math.round(progresoPlan)}%
                                  </span>
                                </div>
                                <Progress value={progresoPlan} className="h-3" />
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                    {sesionesCompletadas} completadas
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-amber-600" />
                                    {sesionesRestantes} pendientes
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              {plan.estado === 'activo' && sesionesRestantes > 0 && (
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    onClick={() => handleGenerarSesiones(plan.id)}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                    size="lg"
                                  >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Generar Sesiones Pendientes
                                  </Button>
                                </div>
                              )}

                              {progresoPlan === 100 && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                                  <p className="text-sm font-medium text-emerald-900">¡Plan completado!</p>
                                  <p className="text-xs text-emerald-700">Todas las sesiones han sido finalizadas</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal Crear Plan */}
      <Dialog open={showPlanModal} onOpenChange={setShowPlanModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Crear Plan de Tratamiento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="objetivo">Objetivo del Plan *</Label>
              <Textarea
                id="objetivo"
                placeholder="Ej: Recuperación completa de rodilla derecha - Esguince LCM grado II"
                value={planForm.objetivo}
                onChange={(e) => setPlanForm({ ...planForm, objetivo: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="sesiones">Número de Sesiones *</Label>
              <Input
                id="sesiones"
                type="number"
                min="1"
                max="50"
                value={planForm.sesiones_plan}
                onChange={(e) => setPlanForm({ ...planForm, sesiones_plan: parseInt(e.target.value) || 10 })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="notas">Notas (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Información adicional sobre el plan..."
                value={planForm.notas}
                onChange={(e) => setPlanForm({ ...planForm, notas: e.target.value })}
                className="mt-1.5"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPlanModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitPlan}
              disabled={createPlanMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createPlanMutation.isPending ? "Creando..." : "Crear Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Generar Sesiones */}
      <Dialog open={showSesionesModal} onOpenChange={setShowSesionesModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Generar Sesiones Automáticamente</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={sesionesForm.fecha_inicio}
                  onChange={(e) => setSesionesForm({ ...sesionesForm, fecha_inicio: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="hora">Hora *</Label>
                <Input
                  id="hora"
                  type="time"
                  value={sesionesForm.hora}
                  onChange={(e) => setSesionesForm({ ...sesionesForm, hora: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            <div>
              <Label className="mb-3 block">Días de la Semana *</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 1, label: "Lun" },
                  { value: 2, label: "Mar" },
                  { value: 3, label: "Mié" },
                  { value: 4, label: "Jue" },
                  { value: 5, label: "Vie" },
                  { value: 6, label: "Sáb" },
                  { value: 0, label: "Dom" }
                ].map((dia) => (
                  <div
                    key={dia.value}
                    onClick={() => toggleDia(dia.value)}
                    className={`
                      cursor-pointer rounded-lg border-2 p-3 text-center text-sm font-medium transition-colors
                      ${sesionesForm.dias_semana.includes(dia.value)
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {dia.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                <strong>Nota:</strong> Las sesiones se crearán automáticamente en los días seleccionados hasta completar el plan.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSesionesModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitSesiones}
              disabled={generarSesionesMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {generarSesionesMutation.isPending ? "Generando..." : "Generar Sesiones"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nueva Evaluación */}
      <Dialog open={showEvaluacionModal} onOpenChange={setShowEvaluacionModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Evaluación Fisioterapéutica</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Información Laboral */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Información Laboral</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fecha_evaluacion">Fecha de Evaluación *</Label>
                  <Input
                    id="fecha_evaluacion"
                    type="date"
                    value={evaluacionForm.fecha_evaluacion}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, fecha_evaluacion: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="profesion">Profesión</Label>
                  <Input
                    id="profesion"
                    value={evaluacionForm.profesion}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, profesion: e.target.value })}
                    placeholder="Ej: Enfermera"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="tipo_trabajo">Tipo de Trabajo</Label>
                  <Input
                    id="tipo_trabajo"
                    value={evaluacionForm.tipo_trabajo}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, tipo_trabajo: e.target.value })}
                    placeholder="Ej: Turnos rotativos"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="sedestacion_prolongada">Sedestación Prolongada</Label>
                  <Input
                    id="sedestacion_prolongada"
                    value={evaluacionForm.sedestacion_prolongada}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, sedestacion_prolongada: e.target.value })}
                    placeholder="Ej: Sí, 8 horas"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="esfuerzo_fisico">Esfuerzo Físico</Label>
                  <Select
                    value={evaluacionForm.esfuerzo_fisico || ""}
                    onValueChange={(value) => setEvaluacionForm({ ...evaluacionForm, esfuerzo_fisico: value })}
                  >
                    <SelectTrigger className="mt-1.5 w-full">
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bajo">Bajo</SelectItem>
                      <SelectItem value="Medio">Medio</SelectItem>
                      <SelectItem value="Alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Motivo de Consulta */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Motivo de Consulta</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="motivo_consulta">Motivo de Consulta *</Label>
                  <Textarea
                    id="motivo_consulta"
                    value={evaluacionForm.motivo_consulta}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, motivo_consulta: e.target.value })}
                    placeholder="Ej: Dolor lumbar crónico"
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="desde_cuando">¿Desde cuándo?</Label>
                  <Input
                    id="desde_cuando"
                    value={evaluacionForm.desde_cuando}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, desde_cuando: e.target.value })}
                    placeholder="Ej: 3 meses"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="intensidad">Intensidad</Label>
                  <Input
                    id="intensidad"
                    value={evaluacionForm.intensidad}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, intensidad: e.target.value })}
                    placeholder="Ej: 7/10"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Inspección */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Inspección</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="asimetria">Asimetría</Label>
                  <Input
                    id="asimetria"
                    value={evaluacionForm.asimetria}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, asimetria: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="atrofias_musculares">Atrofias Musculares</Label>
                  <Input
                    id="atrofias_musculares"
                    value={evaluacionForm.atrofias_musculares}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, atrofias_musculares: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="inflamacion">Inflamación</Label>
                  <Input
                    id="inflamacion"
                    value={evaluacionForm.inflamacion}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, inflamacion: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="edema">Edema</Label>
                  <Input
                    id="edema"
                    value={evaluacionForm.edema}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, edema: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="observaciones_inspeccion">Observaciones</Label>
                  <Textarea
                    id="observaciones_inspeccion"
                    value={evaluacionForm.observaciones_inspeccion}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, observaciones_inspeccion: e.target.value })}
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Palpación */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Palpación y Dolor</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contracturas">Contracturas</Label>
                  <Input
                    id="contracturas"
                    value={evaluacionForm.contracturas}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, contracturas: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox
                    id="irradiacion"
                    checked={evaluacionForm.irradiacion}
                    onCheckedChange={(checked) => setEvaluacionForm({ ...evaluacionForm, irradiacion: checked as boolean })}
                  />
                  <Label htmlFor="irradiacion">¿Presenta irradiación?</Label>
                </div>
                {evaluacionForm.irradiacion && (
                  <div className="col-span-2">
                    <Label htmlFor="hacia_donde">¿Hacia dónde?</Label>
                    <Input
                      id="hacia_donde"
                      value={evaluacionForm.hacia_donde}
                      onChange={(e) => setEvaluacionForm({ ...evaluacionForm, hacia_donde: e.target.value })}
                      placeholder="Ej: Glúteo derecho"
                      className="mt-1.5"
                    />
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Movilidad */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Movilidad</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="limitacion_izquierdo">Limitación Lado Izquierdo</Label>
                  <Input
                    id="limitacion_izquierdo"
                    value={evaluacionForm.limitacion_izquierdo}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, limitacion_izquierdo: e.target.value })}
                    placeholder="Ej: Flexión 0-100°"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="limitacion_derecho">Limitación Lado Derecho</Label>
                  <Input
                    id="limitacion_derecho"
                    value={evaluacionForm.limitacion_derecho}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, limitacion_derecho: e.target.value })}
                    placeholder="Ej: Flexión 0-110°"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="crujidos">Crujidos</Label>
                  <Input
                    id="crujidos"
                    value={evaluacionForm.crujidos}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, crujidos: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="amplitud_movimientos">Amplitud de Movimientos</Label>
                  <Input
                    id="amplitud_movimientos"
                    value={evaluacionForm.amplitud_movimientos}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, amplitud_movimientos: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Diagnóstico y Tratamiento */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Diagnóstico y Tratamiento</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="diagnostico">Diagnóstico</Label>
                  <Textarea
                    id="diagnostico"
                    value={evaluacionForm.diagnostico}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, diagnostico: e.target.value })}
                    placeholder="Ej: Esguince de ligamento colateral medial grado II"
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="tratamientos_anteriores">Tratamientos Anteriores</Label>
                  <Textarea
                    id="tratamientos_anteriores"
                    value={evaluacionForm.tratamientos_anteriores}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, tratamientos_anteriores: e.target.value })}
                    placeholder="Ej: Hielo y reposo"
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEvaluacionModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitEvaluacion}
              disabled={createEvaluacionMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createEvaluacionMutation.isPending ? "Creando..." : "Crear Evaluación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

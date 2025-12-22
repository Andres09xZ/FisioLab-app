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
import { generarSesiones, obtenerSesionesPlan } from "@/lib/api/citas"
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
  Zap,
  ChevronDown,
  ChevronUp,
  Edit,
  CalendarDays,
  AlertCircle
} from "lucide-react"

const API_BASE = "http://localhost:3001/api"

// Componente para la sección de sesiones
function SesionesSection({ 
  sesiones = [],
  expanded, 
  onToggle, 
  onEditSesion, 
  onCompletarSesion,
  isCompletingMutation 
}: { 
  sesiones: Sesion[]
  expanded: boolean
  onToggle: () => void
  onEditSesion: (sesion: Sesion) => void
  onCompletarSesion: (sesionId: string) => void
  isCompletingMutation: boolean
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Sesiones de Tratamiento ({sesiones.length})
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <div className="mt-4 space-y-3">
          {sesiones.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">No hay sesiones programadas</p>
              <p className="text-xs text-gray-500">
                Usa el botón <span className="font-semibold">"Generar Sesiones"</span> arriba para crear sesiones automáticamente
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {sesiones.map((sesion: Sesion) => {
                // El backend puede usar fecha_sesion o fecha_programada
                const fechaStr = sesion.fecha_sesion || sesion.fecha_programada || sesion.cita_inicio
                const fechaValida = fechaStr && !isNaN(new Date(fechaStr).getTime())
                
                // Extraer hora de cita_inicio si no hay hora directa
                let horaDisplay = sesion.hora
                if (!horaDisplay && sesion.cita_inicio) {
                  const citaDate = new Date(sesion.cita_inicio)
                  horaDisplay = format(citaDate, 'HH:mm')
                }
                
                const estadoColor = {
                  pendiente: 'bg-amber-100 text-amber-800 border-amber-200',
                  programada: 'bg-blue-100 text-blue-800 border-blue-200',
                  completada: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                  cancelada: 'bg-gray-100 text-gray-800 border-gray-200'
                }[sesion.estado] || 'bg-gray-100 text-gray-800'

                return (
                  <div
                    key={sesion.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {fechaValida
                            ? format(new Date(fechaStr), "EEEE d 'de' MMMM", { locale: es })
                            : "Fecha no disponible"
                          }
                        </span>
                        <Badge className={`text-xs ${estadoColor}`}>
                          {sesion.estado}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        {horaDisplay && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {horaDisplay}
                          </span>
                        )}
                        {sesion.profesional_nombre && (
                          <span className="text-gray-500">• {sesion.profesional_nombre}</span>
                        )}
                        {sesion.notas && (
                          <span className="text-gray-500">• {sesion.notas}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(sesion.estado === 'pendiente' || sesion.estado === 'programada') && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditSesion(sesion)}
                            className="h-8"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onCompletarSesion(sesion.id)}
                            disabled={isCompletingMutation}
                            className="h-8 bg-emerald-600 hover:bg-emerald-700"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Completar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

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

interface Sesion {
  id: string
  plan_id?: string
  fecha_programada?: string
  fecha_sesion?: string // El backend usa fecha_sesion
  hora?: string
  estado: 'pendiente' | 'completada' | 'cancelada' | 'programada'
  notas?: string
  profesional_id?: string
  profesional_nombre?: string
  cita_id?: string
  cita_inicio?: string
  cita_fin?: string
}

interface Plan {
  id: string
  objetivo: string
  sesiones_plan: number
  sesiones_completadas: number
  estado: string
  fecha_creacion?: string
  evaluacion_id?: string
  notas?: string
  sesiones?: Sesion[] // Las sesiones vienen incluidas en el plan
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
    duracion_minutos: 60,
    profesional_id: "" // Se seleccionará del dropdown
  })
  const [evaluacionForm, setEvaluacionForm] = useState({
    fecha_evaluacion: new Date().toISOString().split('T')[0],
    motivo_consulta: "",
    desde_cuando: "",
    escala_eva: 0,
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
  const [expandedPlans, setExpandedPlans] = useState<Record<string, boolean>>({})
  const [showEditSesionModal, setShowEditSesionModal] = useState(false)
  const [selectedSesion, setSelectedSesion] = useState<Sesion | null>(null)
  const [editSesionForm, setEditSesionForm] = useState({
    fecha_programada: "",
    hora: ""
  })
  const [showEditPlanModal, setShowEditPlanModal] = useState(false)
  const [editPlanForm, setEditPlanForm] = useState({
    id: "",
    objetivo: "",
    sesiones_plan: 10,
    notas: ""
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

  // Query para profesionales (para el modal de generar sesiones)
  const { data: profesionales = [] } = useQuery({
    queryKey: ['profesionales'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/profesionales`)
      if (!res.ok) return []
      const result = await res.json()
      return result.data || result || []
    }
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
        motivo_consulta: "",
        desde_cuando: "",
        escala_eva: 0,
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
      
      console.log("📤 Datos que se van a enviar:", {
        fecha_inicio: data.fecha_inicio,
        hora: data.hora,
        dias_semana: data.dias_semana,
        duracion_minutos: data.duracion_minutos,
        profesional_id: data.profesional_id,
        selectedPlan
      })
      
      // Usar el helper de API
      const result = await generarSesiones(selectedPlan, {
        fecha_inicio: data.fecha_inicio,
        hora: data.hora,
        dias_semana: data.dias_semana,
        duracion_minutos: data.duracion_minutos,
        profesional_id: data.profesional_id
      })

      if (!result.success) {
        throw new Error(result.error || "Error al generar sesiones")
      }

      return result.data
    },
    onSuccess: (data) => {
      // Guardar el plan antes de resetearlo
      const planIdToInvalidate = selectedPlan
      
      // Invalidar queries con el plan correcto
      queryClient.invalidateQueries({ queryKey: ['planes', pacienteId] })
      if (planIdToInvalidate) {
        queryClient.invalidateQueries({ queryKey: ['sesiones', planIdToInvalidate] })
      }
      // También invalidar todas las sesiones por si acaso
      queryClient.invalidateQueries({ queryKey: ['sesiones'] })
      
      setShowSesionesModal(false)
      setSelectedPlan(null)

      // Mostrar resumen de sesiones generadas
      const { sesiones_creadas = 0, conflictos = [] } = data || {}
      
      if (conflictos.length > 0) {
        toast({
          title: `${sesiones_creadas} sesiones generadas`,
          description: `⚠️ ${conflictos.length} conflictos detectados. Algunas sesiones pueden requerir ajuste manual.`,
        })
      } else {
        toast({
          title: "¡Sesiones generadas!",
          description: `Se han programado ${sesiones_creadas} sesiones exitosamente`,
        })
      }
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

  const editSesionMutation = useMutation({
    mutationFn: async (data: { id: string; fecha_programada: string; hora: string }) => {
      // Primero verificar overlap
      const checkRes = await fetch(`${API_BASE}/agenda/check-overlap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha: data.fecha_programada,
          hora: data.hora
        })
      })
      const checkResult = await checkRes.json()
      if (checkResult.data?.hasOverlap) {
        throw new Error("Ya existe una cita en ese horario")
      }

      // Si no hay overlap, actualizar la sesión
      const res = await fetch(`${API_BASE}/sesiones/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha_programada: data.fecha_programada,
          hora: data.hora
        })
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Error HTTP: ${res.status}`)
      }
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al actualizar sesión")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] })
      setShowEditSesionModal(false)
      setSelectedSesion(null)
      setEditSesionForm({ fecha_programada: "", hora: "" })
      toast({
        title: "¡Sesión actualizada!",
        description: "La fecha de la sesión se ha actualizado correctamente",
      })
    },
    onError: (error: Error) => {
      console.error("Error al editar sesión:", error)
      toast({
        title: "Error al actualizar sesión",
        description: error.message || "Ocurrió un error desconocido",
        variant: "destructive",
      })
    }
  })

  const editPlanMutation = useMutation({
    mutationFn: async (data: { id: string; objetivo: string; sesiones_plan: number; notas?: string }) => {
      const res = await fetch(`${API_BASE}/planes/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objetivo: data.objetivo,
          sesiones_plan: data.sesiones_plan,
          notas: data.notas || ""
        })
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Error HTTP: ${res.status}`)
      }
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al actualizar plan")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planes', pacienteId] })
      setShowEditPlanModal(false)
      setEditPlanForm({ id: "", objetivo: "", sesiones_plan: 10, notas: "" })
      toast({
        title: "¡Plan actualizado!",
        description: "El plan de tratamiento se ha actualizado correctamente",
      })
    },
    onError: (error: Error) => {
      console.error("Error al editar plan:", error)
      toast({
        title: "Error al actualizar plan",
        description: error.message || "Ocurrió un error desconocido",
        variant: "destructive",
      })
    }
  })

  const completarSesionMutation = useMutation({
    mutationFn: async (sesionId: string) => {
      const res = await fetch(`${API_BASE}/sesiones/${sesionId}/completar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || `Error HTTP: ${res.status}`)
      }
      const result = await res.json()
      if (!result.success) throw new Error(result.message || "Error al completar sesión")
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sesiones'] })
      queryClient.invalidateQueries({ queryKey: ['planes', pacienteId] })
      toast({
        title: "¡Sesión completada!",
        description: "La sesión se ha marcado como completada",
      })
    },
    onError: (error: Error) => {
      console.error("Error al completar sesión:", error)
      toast({
        title: "Error al completar sesión",
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

  const handleEditPlan = (plan: Plan) => {
    setEditPlanForm({
      id: plan.id,
      objetivo: plan.objetivo,
      sesiones_plan: plan.sesiones_plan,
      notas: ""
    })
    setShowEditPlanModal(true)
  }

  const handleSubmitEditPlan = () => {
    if (!editPlanForm.objetivo.trim()) {
      toast({
        title: "Error",
        description: "El objetivo es requerido",
        variant: "destructive",
      })
      return
    }
    if (editPlanForm.sesiones_plan < 1) {
      toast({
        title: "Error",
        description: "El número de sesiones debe ser al menos 1",
        variant: "destructive",
      })
      return
    }
    editPlanMutation.mutate(editPlanForm)
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
    if (!sesionesForm.profesional_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un profesional",
        variant: "destructive",
      })
      return
    }
    if (sesionesForm.dias_semana.length === 0) {
      toast({
        title: "Error",
        description: "Debes seleccionar al menos un día de la semana",
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

  const togglePlanExpanded = (planId: string) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }))
  }

  const handleEditSesion = (sesion: Sesion) => {
    setSelectedSesion(sesion)
    // El backend puede usar fecha_sesion o fecha_programada
    const fechaStr = sesion.fecha_sesion || sesion.fecha_programada || sesion.cita_inicio
    let horaStr = sesion.hora
    if (!horaStr && sesion.cita_inicio) {
      horaStr = format(new Date(sesion.cita_inicio), 'HH:mm')
    }
    setEditSesionForm({
      fecha_programada: fechaStr ? fechaStr.split('T')[0] : "",
      hora: horaStr || ""
    })
    setShowEditSesionModal(true)
  }

  const handleSubmitEditSesion = () => {
    if (!selectedSesion) return
    if (!editSesionForm.fecha_programada || !editSesionForm.hora) {
      toast({
        title: "Error",
        description: "La fecha y hora son requeridas",
        variant: "destructive",
      })
      return
    }
    editSesionMutation.mutate({
      id: selectedSesion.id,
      fecha_programada: editSesionForm.fecha_programada,
      hora: editSesionForm.hora
    })
  }

  const handleCompletarSesion = (sesionId: string) => {
    completarSesionMutation.mutate(sesionId)
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
            <Card className="border-t-4 border-t-[#04D9D9]">
              <CardContent className="pt-6">
                <div className="flex items-start gap-6">
                  {/* Avatar Grande */}
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-linear-to-br from-[#D466F2] to-[#056CF2] flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-3xl">
                        {getInitials(paciente.nombres, paciente.apellidos)}
                      </span>
                    </div>
                    {paciente.activo && (
                      <div className="absolute -bottom-1 -right-1 bg-[#0AA640] rounded-full p-1.5">
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
                          <Badge className={paciente.activo ? "bg-[#E6FFF5] text-[#0AA640] border-[#0AA640]" : "bg-gray-100 text-gray-800"}>
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
                    <Card className="bg-[#EBF5FF] border-[#4BA4F2]">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-center">
                          <ClipboardList className="h-6 w-6 text-[#056CF2] mx-auto mb-1" />
                          <p className="text-2xl font-bold text-[#056CF2]">{evaluaciones.length}</p>
                          <p className="text-xs text-[#4BA4F2]">Evaluaciones</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-[#E6FFF5] border-[#0AA640]">
                      <CardContent className="pt-4 pb-3">
                        <div className="text-center">
                          <Target className="h-6 w-6 text-[#0AA640] mx-auto mb-1" />
                          <p className="text-2xl font-bold text-[#0AA640]">{planesActivos.length}</p>
                          <p className="text-xs text-[#0AA640]/70">Planes Activos</p>
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
                  <ClipboardList className="h-5 w-5 text-[#056CF2]" />
                  Evaluaciones Fisioterapéuticas
                </CardTitle>
                <Button
                  onClick={() => setShowEvaluacionModal(true)}
                  className="bg-[#056CF2] hover:bg-[#0558C9]"
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
                    <p className="text-gray-600">No hay evaluaciones registradas</p>
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
                                    <Badge className="bg-[#E6FFF5] text-[#0AA640] border-[#0AA640]/30 text-xs">
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
                                  className="bg-[#056CF2] hover:bg-[#0558C9]"
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
                  <Target className="h-5 w-5 text-[#04D9D9]" />
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
                        <Card key={plan.id} className={`border-l-4 ${plan.estado === 'activo' ? 'border-l-[#0AA640]' : 'border-l-gray-400'}`}>
                          <CardContent className="pt-5">
                            <div className="space-y-4">
                              {/* Header */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h4 className="font-semibold text-gray-900">{plan.objetivo}</h4>
                                    <Badge className={plan.estado === 'activo' ? 'bg-[#E6FFF5] text-[#0AA640]' : 'bg-gray-100 text-gray-800'}>
                                      {plan.estado === 'activo' ? 'Activo' : 'Finalizado'}
                                    </Badge>
                                  </div>
                                  {fechaCreacionValida && plan.fecha_creacion && (
                                    <p className="text-xs text-gray-600">
                                      Creado el {format(new Date(plan.fecha_creacion), "d 'de' MMMM, yyyy", { locale: es })}
                                    </p>
                                  )}
                                </div>
                                {/* Botón Editar Plan */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditPlan(plan)}
                                  className="text-[#056CF2] border-[#056CF2] hover:bg-[#056CF2]/10"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Editar
                                </Button>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-600">
                                    Progreso: {sesionesCompletadas} de {sesionesTotal} sesiones
                                  </span>
                                  <span className="font-semibold text-[#0AA640]">
                                    {Math.round(progresoPlan)}%
                                  </span>
                                </div>
                                <Progress value={progresoPlan} className="h-3" />
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span className="flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3 text-[#0AA640]" />
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
                                    className="flex-1 bg-[#0AA640] hover:bg-[#089536]"
                                    size="lg"
                                  >
                                    <Zap className="h-4 w-4 mr-2" />
                                    Generar Sesiones Pendientes
                                  </Button>
                                </div>
                              )}

                              {progresoPlan === 100 && (
                                <div className="bg-[#E6FFF5] border border-[#0AA640]/30 rounded-lg p-3 text-center">
                                  <CheckCircle2 className="h-8 w-8 text-[#0AA640] mx-auto mb-2" />
                                  <p className="text-sm font-medium text-[#0AA640]">¡Plan completado!</p>
                                  <p className="text-xs text-[#0AA640]/70">Todas las sesiones han sido finalizadas</p>
                                </div>
                              )}

                              {/* Sección de Sesiones Collapsible */}
                              <Separator className="my-4" />
                              <SesionesSection 
                                sesiones={plan.sesiones || []}
                                expanded={expandedPlans[plan.id] || false}
                                onToggle={() => togglePlanExpanded(plan.id)}
                                onEditSesion={handleEditSesion}
                                onCompletarSesion={handleCompletarSesion}
                                isCompletingMutation={completarSesionMutation.isPending}
                              />
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
              className="bg-[#056CF2] hover:bg-[#0558C9]"
            >
              {createPlanMutation.isPending ? "Creando..." : "Crear Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Plan */}
      <Dialog open={showEditPlanModal} onOpenChange={setShowEditPlanModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Plan de Tratamiento</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit_objetivo">Objetivo del Plan *</Label>
              <Textarea
                id="edit_objetivo"
                placeholder="Ej: Recuperación completa de rodilla derecha - Esguince LCM grado II"
                value={editPlanForm.objetivo}
                onChange={(e) => setEditPlanForm({ ...editPlanForm, objetivo: e.target.value })}
                className="mt-1.5"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="edit_sesiones">Número de Sesiones *</Label>
              <Input
                id="edit_sesiones"
                type="number"
                min="1"
                max="100"
                value={editPlanForm.sesiones_plan}
                onChange={(e) => setEditPlanForm({ ...editPlanForm, sesiones_plan: parseInt(e.target.value) || 1 })}
                className="mt-1.5"
              />
              <p className="text-xs text-gray-500 mt-1">
                Puedes aumentar o reducir el número de sesiones del plan
              </p>
            </div>

            <div>
              <Label htmlFor="edit_notas">Notas (opcional)</Label>
              <Textarea
                id="edit_notas"
                placeholder="Información adicional sobre el plan..."
                value={editPlanForm.notas}
                onChange={(e) => setEditPlanForm({ ...editPlanForm, notas: e.target.value })}
                className="mt-1.5"
                rows={2}
              />
            </div>

            <div className="bg-[#FFF7E6] border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-800">
                <strong>Nota:</strong> Si reduces el número de sesiones, las sesiones no generadas serán eliminadas automáticamente. Las sesiones ya completadas no se verán afectadas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPlanModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitEditPlan}
              disabled={editPlanMutation.isPending}
              className="bg-[#056CF2] hover:bg-[#0558C9]"
            >
              {editPlanMutation.isPending ? "Guardando..." : "Guardar Cambios"}
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
              <Label htmlFor="duracion_minutos">Duración (minutos) *</Label>
              <Input
                id="duracion_minutos"
                type="number"
                min="15"
                max="240"
                step="15"
                value={sesionesForm.duracion_minutos}
                onChange={(e) => setSesionesForm({ ...sesionesForm, duracion_minutos: parseInt(e.target.value) || 60 })}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="profesional">Profesional *</Label>
              <Select
                value={sesionesForm.profesional_id}
                onValueChange={(value) => setSesionesForm({ ...sesionesForm, profesional_id: value })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Selecciona un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {profesionales.map((prof: any) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.nombre} {prof.apellido || ''} {prof.especialidad ? `- ${prof.especialidad}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                        ? 'border-[#0AA640] bg-[#E6FFF5] text-[#0AA640]'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    {dia.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#E6F3FF] border border-[#056CF2]/30 rounded-lg p-3">
              <p className="text-xs text-[#056CF2]">
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
              className="bg-[#0AA640] hover:bg-[#089536]"
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
            {/* Motivo de Consulta */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Motivo de Consulta</h3>
              <div className="grid grid-cols-1 gap-4">
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
              </div>
              
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

            {/* Escala EVA (Escala Visual Analógica) */}
            <div className="space-y-4 p-6 bg-linear-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
              <div className="text-center">
                <h3 className="font-bold text-xl text-blue-900 mb-1">ESCALA VISUAL ANALÓGICA</h3>
                <p className="text-sm text-gray-600">Seleccione el nivel de dolor del paciente</p>
              </div>
              
              <div className="space-y-4">
                {/* Caras indicadoras */}
                <div className="flex justify-between items-center px-2">
                  {[
                    { range: [0, 0], emoji: "😊", label: "Sin\nDolor", color: "text-green-600" },
                    { range: [1, 2], emoji: "🙂", label: "Poco\nDolor", color: "text-green-500" },
                    { range: [3, 4], emoji: "😐", label: "Dolor\nModerado", color: "text-yellow-500" },
                    { range: [5, 6], emoji: "😟", label: "Dolor\nFuerte", color: "text-orange-500" },
                    { range: [7, 8], emoji: "😨", label: "Dolor\nMuy Fuerte", color: "text-orange-600" },
                    { range: [9, 10], emoji: "😱", label: "Dolor\nExtremo", color: "text-red-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <span className={`text-3xl ${item.color}`}>{item.emoji}</span>
                      <span className={`text-xs font-medium text-center whitespace-pre-line mt-1 ${item.color}`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Barra de colores */}
                <div className="relative h-12 rounded-lg overflow-hidden shadow-inner">
                  <div className="absolute inset-0 flex">
                    <div className="flex-1 bg-green-500"></div>
                    <div className="flex-1 bg-green-400"></div>
                    <div className="flex-1 bg-yellow-300"></div>
                    <div className="flex-1 bg-yellow-400"></div>
                    <div className="flex-1 bg-yellow-500"></div>
                    <div className="flex-1 bg-orange-400"></div>
                    <div className="flex-1 bg-orange-500"></div>
                    <div className="flex-1 bg-orange-600"></div>
                    <div className="flex-1 bg-red-500"></div>
                    <div className="flex-1 bg-red-600"></div>
                    <div className="flex-1 bg-red-700"></div>
                  </div>
                  {/* Indicador de posición */}
                  <div 
                    className="absolute top-0 bottom-0 w-1 bg-black transition-all duration-200"
                    style={{ left: `${(evaluacionForm.escala_eva / 10) * 100}%` }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-black"></div>
                  </div>
                </div>

                {/* Números */}
                <div className="flex justify-between px-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setEvaluacionForm({ ...evaluacionForm, escala_eva: num })}
                      className={`w-8 h-8 rounded-full font-bold text-sm transition-all ${
                        evaluacionForm.escala_eva === num
                          ? "bg-blue-600 text-white scale-125 shadow-lg"
                          : "bg-white text-gray-700 hover:bg-blue-100 border border-gray-300"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={evaluacionForm.escala_eva}
                    onChange={(e) => setEvaluacionForm({ ...evaluacionForm, escala_eva: Number(e.target.value) })}
                    className="w-full h-3 rounded-lg eva-slider cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, 
                        rgb(34, 197, 94) 0%, 
                        rgb(74, 222, 128) 18%, 
                        rgb(253, 224, 71) 36%, 
                        rgb(250, 204, 21) 45%, 
                        rgb(251, 191, 36) 54%, 
                        rgb(251, 146, 60) 63%, 
                        rgb(249, 115, 22) 72%, 
                        rgb(234, 88, 12) 81%, 
                        rgb(239, 68, 68) 90%, 
                        rgb(220, 38, 38) 100%)`,
                    }}
                  />
                  <div className="text-center">
                    <span className={`inline-block px-6 py-2 rounded-full text-white font-bold text-lg ${
                      evaluacionForm.escala_eva === 0 ? "bg-green-500" :
                      evaluacionForm.escala_eva <= 2 ? "bg-green-400" :
                      evaluacionForm.escala_eva <= 4 ? "bg-yellow-300 text-gray-800" :
                      evaluacionForm.escala_eva <= 6 ? "bg-yellow-500" :
                      evaluacionForm.escala_eva <= 8 ? "bg-orange-500" :
                      "bg-red-500"
                    }`}>
                      {evaluacionForm.escala_eva} - {
                        evaluacionForm.escala_eva === 0 ? "Sin Dolor" :
                        evaluacionForm.escala_eva <= 2 ? "Poco Dolor" :
                        evaluacionForm.escala_eva <= 4 ? "Dolor Moderado" :
                        evaluacionForm.escala_eva <= 6 ? "Dolor Fuerte" :
                        evaluacionForm.escala_eva <= 8 ? "Dolor Muy Fuerte" :
                        "Dolor Extremo"
                      }
                    </span>
                  </div>
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

      {/* Modal Editar Sesión */}
      <Dialog open={showEditSesionModal} onOpenChange={setShowEditSesionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Fecha de Sesión</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium mb-1">Validación automática</p>
                  <p className="text-xs text-blue-700">
                    Se verificará que no haya otra cita en el horario seleccionado
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_fecha">Nueva Fecha *</Label>
                <Input
                  id="edit_fecha"
                  type="date"
                  value={editSesionForm.fecha_programada}
                  onChange={(e) => setEditSesionForm({ ...editSesionForm, fecha_programada: e.target.value })}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="edit_hora">Nueva Hora *</Label>
                <Input
                  id="edit_hora"
                  type="time"
                  value={editSesionForm.hora}
                  onChange={(e) => setEditSesionForm({ ...editSesionForm, hora: e.target.value })}
                  className="mt-1.5"
                />
              </div>
            </div>

            {selectedSesion && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="text-gray-600 mb-1">Fecha actual:</p>
                <p className="font-medium text-gray-900">
                  {selectedSesion.fecha_programada && !isNaN(new Date(selectedSesion.fecha_programada).getTime())
                    ? format(new Date(selectedSesion.fecha_programada), "EEEE d 'de' MMMM, yyyy", { locale: es })
                    : "Fecha no disponible"
                  } a las {selectedSesion.hora}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowEditSesionModal(false)
                setSelectedSesion(null)
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmitEditSesion}
              disabled={editSesionMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {editSesionMutation.isPending ? "Actualizando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

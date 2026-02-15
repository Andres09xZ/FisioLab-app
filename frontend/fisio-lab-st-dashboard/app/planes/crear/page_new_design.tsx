"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  Loader2, 
  Plus, 
  X, 
  User, 
  Activity,
  Calendar,
  AlertCircle,
  FileText,
  Target,
  Clock,
  Sparkles
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  documento: string
  edad: number
}

interface Evaluacion {
  id: string
  diagnostico_fisio: string
  motivo_consulta: string
  eva_score: number
  version_numero: number
  fecha_creacion: string
  hallazgos_clinicos?: any
  historia_enfermedad_actual?: string
}

interface PlantillaTratamiento {
  nombre: string
  objetivo_general: string
  objetivos_especificos: string[]
  sesiones_recomendadas: number
  frecuencia: number
  duracion: number
}

const PLANTILLAS: PlantillaTratamiento[] = [
  {
    nombre: "Post-Operatorio LCA",
    objetivo_general: "Recuperar la funcionalidad completa de la rodilla post-reconstrucción de LCA, enfocándose en estabilidad, fuerza y rango de movimiento.",
    objetivos_especificos: [
      "Reducir inflamación y dolor en las primeras 4 semanas",
      "Recuperar rango de movimiento completo (0-140°) en 8 semanas",
      "Fortalecer musculatura del cuádriceps e isquiotibiales progresivamente",
      "Mejorar propiocepción y control neuromuscular de la rodilla"
    ],
    sesiones_recomendadas: 24,
    frecuencia: 3,
    duracion: 60
  },
  {
    nombre: "Lumbalgia Crónica",
    objetivo_general: "Disminuir el dolor lumbar crónico y mejorar la funcionalidad mediante fortalecimiento del core y educación en higiene postural.",
    objetivos_especificos: [
      "Reducir dolor EVA de 7 a 3 en 6 semanas",
      "Fortalecer musculatura estabilizadora del core",
      "Mejorar flexibilidad de cadena posterior",
      "Educar en mecánica corporal y ergonomía laboral"
    ],
    sesiones_recomendadas: 16,
    frecuencia: 2,
    duracion: 45
  },
  {
    nombre: "Hombro Doloroso",
    objetivo_general: "Restaurar la movilidad y función del hombro, eliminando el dolor y previniendo recurrencias mediante fortalecimiento del manguito rotador.",
    objetivos_especificos: [
      "Reducir dolor en actividades de la vida diaria",
      "Recuperar elevación activa sin compensaciones",
      "Fortalecer manguito rotador y estabilizadores escapulares",
      "Normalizar biomecánica escapulohumeral"
    ],
    sesiones_recomendadas: 20,
    frecuencia: 3,
    duracion: 60
  }
]

const DRAFT_KEY = "plan_tratamiento_draft"
const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export default function CrearPlanTratamientoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Flujo progresivo: 0=selector, 1=evaluacion, 2=plan, 3=sesiones, 4=resumen
  const [stepActual, setStepActual] = useState(0)
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [planActivoExistente, setPlanActivoExistente] = useState<any>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [showResumen, setShowResumen] = useState(false)

  // Listas
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [evaluacionSeleccionada, setEvaluacionSeleccionada] = useState<Evaluacion | null>(null)
  const [loading, setLoading] = useState(false)

  // IDs guardados
  const [evaluacionId, setEvaluacionId] = useState<string>("")
  const [planId, setPlanId] = useState<string>("")

  // Form data - Evaluación
  const [modoEvaluacion, setModoEvaluacion] = useState<"nueva" | "existente">("nueva")
  const [evaluacionExistenteId, setEvaluacionExistenteId] = useState("")
  const [formEvaluacion, setFormEvaluacion] = useState({
    motivo_consulta: "",
    historia_enfermedad_actual: "",
    diagnostico_fisio: "",
    hallazgos_clinicos: "",
    eva_score: 5,
  })

  // Form data - Plan
  const [formPlan, setFormPlan] = useState({
    objetivo_general: "",
    objetivos_especificos: [""],
    numero_sesiones: 12,
    frecuencia_semanal: 3,
    duracion_sesion: 60,
  })

  // Form data - Sesiones
  const [formSesiones, setFormSesiones] = useState({
    fecha_inicio: "",
    dias_semana: [] as string[],
    hora_inicio: "09:00",
  })

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Auto-save draft
  useEffect(() => {
    if (pacienteSeleccionado && typeof window !== "undefined") {
      const draftData = {
        timestamp: new Date().toISOString(),
        stepActual,
        pacienteSeleccionado,
        evaluacionId,
        planId,
        modoEvaluacion,
        evaluacionExistenteId,
        evaluacionSeleccionada,
        formEvaluacion,
        formPlan,
        formSesiones,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
    }
  }, [
    stepActual,
    pacienteSeleccionado,
    evaluacionId,
    planId,
    modoEvaluacion,
    evaluacionExistenteId,
    evaluacionSeleccionada,
    formEvaluacion,
    formPlan,
    formSesiones,
  ])

  // Cargar draft automático
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        setTimeout(() => {
          const draft = JSON.parse(savedDraft)
          setStepActual(draft.stepActual)
          setPacienteSeleccionado(draft.pacienteSeleccionado)
          setEvaluacionId(draft.evaluacionId || "")
          setPlanId(draft.planId || "")
          setModoEvaluacion(draft.modoEvaluacion)
          setEvaluacionExistenteId(draft.evaluacionExistenteId || "")
          setEvaluacionSeleccionada(draft.evaluacionSeleccionada)
          setFormEvaluacion(draft.formEvaluacion)
          setFormPlan(draft.formPlan)
          setFormSesiones(draft.formSesiones)

          if (draft.pacienteSeleccionado) {
            const token = localStorage.getItem("fisiolab_token")
            fetch(`http://localhost:3001/api/v2/evaluaciones/pacientes/${draft.pacienteSeleccionado.id}/evaluaciones`, {
              headers: { Authorization: `Bearer ${token}` },
            })
              .then(res => res.json())
              .then(data => {
                if (data.success && data.data) setEvaluaciones(data.data)
              })
              .catch(console.error)
          }

          toast({ title: "Borrador restaurado" })
        }, 100)
      }
    }
  }, [])

  const limpiarBorrador = () => {
    localStorage.removeItem(DRAFT_KEY)
  }

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchPacientes(token)
    }
  }, [router])

  const fetchPacientes = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Error al cargar pacientes")
      const data = await response.json()
      if (data.success && data.data) {
        setPacientes(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const continuarAlFormulario = async (paciente: Paciente) => {
    setPacienteSeleccionado(paciente)
    setShowWarning(false)

    // Cargar evaluaciones del paciente
    const token = localStorage.getItem("fisiolab_token")
    try {
      const response = await fetch(
        `http://localhost:3001/api/v2/evaluaciones/pacientes/${paciente.id}/evaluaciones`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setEvaluaciones(data.data)
        }
      }
    } catch (error) {
      console.error("Error cargando evaluaciones:", error)
    }

    setStepActual(1)
  }

  const handleSeleccionarPaciente = async (pacienteId: string) => {
    if (!pacienteId) return

    const paciente = pacientes.find(p => p.id === pacienteId)
    if (!paciente) return

    setLoading(true)
    try {
      const token = localStorage.getItem("fisiolab_token")

      // Verificar planes activos
      const response = await fetch(
        `http://localhost:3001/api/v2/planes?paciente_id=${pacienteId}&estado=en_progreso,planificado`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data && data.data.length > 0) {
          setPlanActivoExistente(data.data[0])
          setShowWarning(true)
        } else {
          continuarAlFormulario(paciente)
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const aplicarPlantilla = (plantilla: PlantillaTratamiento) => {
    setFormPlan({
      objetivo_general: plantilla.objetivo_general,
      objetivos_especificos: [...plantilla.objetivos_especificos],
      numero_sesiones: plantilla.sesiones_recomendadas,
      frecuencia_semanal: plantilla.frecuencia,
      duracion_sesion: plantilla.duracion,
    })
    toast({ title: "✨ Plantilla aplicada", description: `${plantilla.nombre} - Puedes editar los campos` })
  }

  const guardarEvaluacion = async () => {
    if (modoEvaluacion === "existente") {
      if (!evaluacionExistenteId) {
        toast({ title: "Selecciona una evaluación", variant: "destructive" })
        return
      }
      const evalSeleccionada = evaluaciones.find(e => e.id === evaluacionExistenteId)
      setEvaluacionId(evaluacionExistenteId)
      setEvaluacionSeleccionada(evalSeleccionada || null)
      setStepActual(2)
      toast({ title: "Evaluación seleccionada" })
      return
    }

    // Crear nueva evaluación
    if (!formEvaluacion.motivo_consulta || !formEvaluacion.diagnostico_fisio) {
      toast({ title: "Completa los campos requeridos", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      const response = await fetch("http://localhost:3001/api/v2/evaluaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          paciente_id: pacienteSeleccionado!.id,
          motivo_consulta: formEvaluacion.motivo_consulta,
          historia_enfermedad_actual: formEvaluacion.historia_enfermedad_actual || null,
          diagnostico_fisio: formEvaluacion.diagnostico_fisio,
          hallazgos_clinicos: formEvaluacion.hallazgos_clinicos 
            ? { examen_fisico: formEvaluacion.hallazgos_clinicos }
            : {},
          eva_score: formEvaluacion.eva_score,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Error al crear evaluación")

      setEvaluacionId(data.data.id)
      setEvaluacionSeleccionada({
        id: data.data.id,
        diagnostico_fisio: formEvaluacion.diagnostico_fisio,
        motivo_consulta: formEvaluacion.motivo_consulta,
        eva_score: formEvaluacion.eva_score,
        version_numero: 1,
        fecha_creacion: new Date().toISOString(),
        hallazgos_clinicos: formEvaluacion.hallazgos_clinicos,
        historia_enfermedad_actual: formEvaluacion.historia_enfermedad_actual
      })
      setStepActual(2)
      toast({ title: "✅ Evaluación guardada" })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la evaluación",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const guardarPlan = async () => {
    if (!formPlan.objetivo_general) {
      toast({ title: "Ingresa el objetivo general", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      
      const objetivosEspecificosFiltrados = formPlan.objetivos_especificos.filter(o => o.trim() !== "")
      let objetivosCombinados = `Objetivo General:\n${formPlan.objetivo_general}`
      
      if (objetivosEspecificosFiltrados.length > 0) {
        objetivosCombinados += `\n\nObjetivos Específicos:\n${objetivosEspecificosFiltrados.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}`
      }

      const response = await fetch("http://localhost:3001/api/v2/planes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          evaluacion_id: evaluacionId,
          objetivos: objetivosCombinados,
          total_sesiones: formPlan.numero_sesiones,
          frecuencia_semanal: formPlan.frecuencia_semanal,
          fecha_inicio: new Date().toISOString().split('T')[0],
          notas: `Duración de sesión: ${formPlan.duracion_sesion} minutos`
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Error al crear plan")

      setPlanId(data.data.id)
      setStepActual(3)
      toast({ title: "✅ Plan guardado" })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar el plan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const mostrarResumenFinal = () => {
    if (!formSesiones.fecha_inicio || formSesiones.dias_semana.length === 0) {
      toast({ title: "Completa la configuración de sesiones", variant: "destructive" })
      return
    }
    setShowResumen(true)
  }

  const generarSesiones = async () => {
    toast({
      title: "🚀 Generando sesiones...",
      description: "Esta funcionalidad se implementará en la siguiente fase",
    })

    setTimeout(() => {
      limpiarBorrador()
      router.push("/planes")
    }, 1500)
  }

  const addObjetivo = () => {
    setFormPlan({
      ...formPlan,
      objetivos_especificos: [...formPlan.objetivos_especificos, ""],
    })
  }

  const removeObjetivo = (index: number) => {
    const newObjetivos = formPlan.objetivos_especificos.filter((_, i) => i !== index)
    setFormPlan({
      ...formPlan,
      objetivos_especificos: newObjetivos.length > 0 ? newObjetivos : [""],
    })
  }

  const updateObjetivo = (index: number, value: string) => {
    const newObjetivos = [...formPlan.objetivos_especificos]
    newObjetivos[index] = value
    setFormPlan({
      ...formPlan,
      objetivos_especificos: newObjetivos,
    })
  }

  const toggleDiaSemana = (dia: string) => {
    if (formSesiones.dias_semana.includes(dia)) {
      setFormSesiones({
        ...formSesiones,
        dias_semana: formSesiones.dias_semana.filter(d => d !== dia),
      })
    } else {
      setFormSesiones({
        ...formSesiones,
        dias_semana: [...formSesiones.dias_semana, dia],
      })
    }
  }

  // Calcular progreso
  const calcularProgreso = () => {
    if (stepActual === 0) return 0
    if (stepActual === 1) return 25
    if (stepActual === 2) return 50
    if (stepActual === 3) return 75
    return 100
  }

  const getEvaScoreBadge = (score: number) => {
    if (score <= 3) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Leve ({score})</Badge>
    } else if (score <= 6) {
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Moderado ({score})</Badge>
    } else {
      return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Severo ({score})</Badge>
    }
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#f8fafc]">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Header con  progreso */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => {
                  if (stepActual === 0) {
                    limpiarBorrador()
                    router.push("/planes")
                  } else {
                    setStepActual(Math.max(0, stepActual - 1))
                  }
                }}
                className="mb-4 text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {stepActual === 0 ? "Volver a Planes" : "Paso Anterior"}
              </Button>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <h1 className="text-2xl font-semibold text-[#0f172a]">
                    Asistente Clínico Inteligente
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {stepActual === 0 && "Selecciona un paciente para comenzar"}
                    {stepActual === 1 && "Registra o selecciona la evaluación fisioterapéutica"}
                    {stepActual === 2 && "Diseña el plan de tratamiento"}
                    {stepActual === 3 && "Configura el calendario de sesiones"}
                  </p>
                </div>
                {stepActual > 0 && pacienteSeleccionado && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#0f172a]">
                      {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                    </p>
                    <p className="text-xs text-slate-500">
                      {pacienteSeleccionado.documento} • {pacienteSeleccionado.edad} años
                    </p>
                  </div>
                )}
              </div>

              {/* Barra de progreso */}
              {stepActual > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Progreso del plan</span>
                    <span className="font-medium text-[#0f172a]">{calcularProgreso()}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#06b6d4] to-[#10b981] transition-all duration-500 ease-out"
                      style={{ width: `${calcularProgreso()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span className={stepActual >= 1 ? "text-[#06b6d4]" : ""}>Evaluación</span>
                    <span className={stepActual >= 2 ? "text-[#06b6d4]" : ""}>Plan</span>
                    <span className={stepActual >= 3 ? "text-[#06b6d4]" : ""}>Sesiones</span>
                    <span className={stepActual >= 4 ? "text-[#10b981]" : ""}>Completado</span>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 0: Selector de Paciente */}
            {stepActual === 0 && (
              <div className="max-w-2xl mx-auto">
                <Card className="border border-slate-200 rounded-xl shadow-sm">
                  <div className="p-6">
                    {showWarning && planActivoExistente ? (
                      <Alert className="border-amber-200 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-900">
                          <strong>Este paciente ya tiene un plan activo</strong>
                          <p className="text-sm mt-1">
                            Estado: <Badge className="ml-1">{planActivoExistente.estado}</Badge>
                          </p>
                          <div className="flex gap-2 mt-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setShowWarning(false)
                                setPlanActivoExistente(null)
                              }}
                            >
                              Cancelar
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => continuarAlFormulario(pacientes.find(p => p.id === pacienteSeleccionado?.id)!)}
                              className="bg-amber-600 hover:bg-amber-700"
                            >
                              Continuar de todos modos
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-6">
                        <div className="text-center pb-4 border-b border-slate-200">
                          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#06b6d4] to-[#0891b2] rounded-2xl mb-4">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <h2 className="text-xl font-semibold text-[#0f172a] mb-1">Seleccionar Paciente</h2>
                          <p className="text-sm text-slate-600">Elige el paciente para crear su plan de tratamiento</p>
                        </div>

                        <div>
                          <Label className="text-base font-medium text-slate-700 mb-3 block">
                            Buscar paciente
                          </Label>
                          <Select onValueChange={handleSeleccionarPaciente} disabled={loading}>
                            <SelectTrigger className="h-14 border-slate-300 rounded-xl focus:ring-2 focus:ring-[#06b6d4] focus:border-transparent">
                              <SelectValue placeholder="Escribe el nombre o documento..." />
                            </SelectTrigger>
                            <SelectContent>
                              {pacientes.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                  <div className="flex items-center justify-between w-full py-1">
                                    <span className="font-medium text-slate-900">{p.nombres} {p.apellidos}</span>
                                    <span className="text-xs text-slate-500 ml-4">{p.documento} • {p.edad} años</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {loading && (
                            <p className="text-sm text-slate-500 flex items-center gap-2 mt-3">
                              <Loader2 className="h-4 w-4 animate-spin text-[#06b6d4]" />
                              Verificando planes existentes...
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* STEPS 1-3: Split View con panel lateral */}
            {stepActual > 0 && stepActual <= 3 && (
              <div className="flex gap-6 max-w-7xl mx-auto">
                {/* Panel Principal (70%) */}
                <div className="flex-1">
                  {/* STEP 1: Evaluación */}
                  {stepActual === 1 && (
                    <Card className="border border-slate-200 rounded-xl shadow-sm">
                      <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                          <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
                            <Activity className="h-5 w-5 text-[#06b6d4]" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#0f172a]">Evaluación Fisioterapéutica</h2>
                            <p className="text-sm text-slate-600">Registra la evaluación inicial del paciente</p>
                          </div>
                        </div>

                        {/* Selector: Nueva o Existente */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setModoEvaluacion("nueva")}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              modoEvaluacion === "nueva"
                                ? "border-[#06b6d4] bg-[#06b6d4]/5"
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                          >
                            <FileText className={`h-5 w-5 mb-2 ${modoEvaluacion === "nueva" ? "text-[#06b6d4]" : "text-slate-400"}`} />
                            <p className={`font-medium ${modoEvaluacion === "nueva" ? "text-[#0f172a]" : "text-slate-600"}`}>
                              Nueva Evaluación
                            </p>
                            <p className="text-xs text-slate-500 mt-1">Registrar evaluación completa</p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setModoEvaluacion("existente")}
                            disabled={evaluaciones.length === 0}
                            className={`p-4 rounded-xl border-2 transition-all ${
                              modoEvaluacion === "existente"
                                ? "border-[#06b6d4] bg-[#06b6d4]/5"
                                : "border-slate-200 hover:border-slate-300"
                            } ${evaluaciones.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <FileText className={`h-5 w-5 mb-2 ${modoEvaluacion === "existente" ? "text-[#06b6d4]" : "text-slate-400"}`} />
                            <p className={`font-medium ${modoEvaluacion === "existente" ? "text-[#0f172a]" : "text-slate-600"}`}>
                              Usar Existente
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{evaluaciones.length} disponibles</p>
                          </button>
                        </div>

                        {modoEvaluacion === "existente" ? (
                          <div className="space-y-4">
                            <Label className="text-base font-medium text-slate-700">Evaluaciones del paciente</Label>
                            <Select value={evaluacionExistenteId} onValueChange={setEvaluacionExistenteId}>
                              <SelectTrigger className="h-14 rounded-xl">
                                <SelectValue placeholder="Selecciona una evaluación..." />
                              </SelectTrigger>
                              <SelectContent>
                                {evaluaciones.map((ev) => (
                                  <SelectItem key={ev.id} value={ev.id}>
                                    <div className="py-1">
                                      <p className="font-medium text-slate-900">{ev.diagnostico_fisio}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-500">
                                          v{ev.version_numero} • {format(new Date(ev.fecha_creacion), "dd MMM yyyy", { locale: es })}
                                        </span>
                                        {getEvaScoreBadge(ev.eva_score)}
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Motivo de Consulta <span className="text-rose-500">*</span>
                              </Label>
                              <Textarea
                                value={formEvaluacion.motivo_consulta}
                                onChange={(e) => setFormEvaluacion({ ...formEvaluacion, motivo_consulta: e.target.value })}
                                placeholder="¿Por qué consulta el paciente?"
                                rows={3}
                                className="rounded-xl resize-none"
                              />
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Diagnóstico Fisioterapéutico <span className="text-rose-500">*</span>
                              </Label>
                              <Textarea
                                value={formEvaluacion.diagnostico_fisio}
                                onChange={(e) => setFormEvaluacion({ ...formEvaluacion, diagnostico_fisio: e.target.value })}
                                placeholder="Diagnóstico principal..."
                                rows={2}
                                className="rounded-xl resize-none"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-slate-700 mb-2 block">Historia de Enfermedad</Label>
                                <Textarea
                                  value={formEvaluacion.historia_enfermedad_actual}
                                  onChange={(e) => setFormEvaluacion({ ...formEvaluacion, historia_enfermedad_actual: e.target.value })}
                                  placeholder="Evolución del cuadro clínico..."
                                  rows={3}
                                  className="rounded-xl resize-none"
                                />
                              </div>
                              <div>
                                <Label className="text-sm font-medium text-slate-700 mb-2 block">Hallazgos Clínicos</Label>
                                <Textarea
                                  value={formEvaluacion.hallazgos_clinicos}
                                  onChange={(e) => setFormEvaluacion({ ...formEvaluacion, hallazgos_clinicos: e.target.value })}
                                  placeholder="Examen físico, pruebas especiales..."
                                  rows={3}
                                  className="rounded-xl resize-none"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Escala Visual Análoga (EVA)
                              </Label>
                              <div className="flex items-center gap-4">
                                <Input
                                  type="range"
                                  min="0"
                                  max="10"
                                  value={formEvaluacion.eva_score}
                                  onChange={(e) => setFormEvaluacion({ ...formEvaluacion, eva_score: parseInt(e.target.value) })}
                                  className="flex-1"
                                />
                                <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200">
                                  <span className="text-2xl font-bold text-[#0f172a]">{formEvaluacion.eva_score}</span>
                                </div>
                              </div>
                              <div className="flex justify-between text-xs text-slate-500 mt-2">
                                <span>Sin dolor</span>
                                <span>Dolor máximo</span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-slate-200">
                          <Button
                            onClick={guardarEvaluacion}
                            disabled={loading}
                            className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#0e7490] text-white px-8 h-12 rounded-xl shadow-lg shadow-[#06b6d4]/20 transition-all"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              <>
                                Continuar al Plan
                                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* STEP 2: Plan */}
                  {stepActual === 2 && (
                    <div className="space-y-6">
                      {/* Plantillas Inteligentes */}
                      <Card className="border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl shadow-sm">
                        <div className="p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="h-5 w-5 text-amber-600" />
                            <h3 className="font-semibold text-amber-900">Plantillas Inteligentes</h3>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {PLANTILLAS.map((plantilla) => (
                              <button
                                key={plantilla.nombre}
                                onClick={() => aplicarPlantilla(plantilla)}
                                className="p-4 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left group"
                              >
                                <p className="font-medium text-sm text-slate-900 group-hover:text-amber-900 mb-1">
                                  {plantilla.nombre}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {plantilla.sesiones_recomendadas} sesiones • {plantilla.frecuencia}x/sem
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      </Card>

                      <Card className="border border-slate-200 rounded-xl shadow-sm">
                        <div className="p-6 space-y-6">
                          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                            <div className="p-2 bg-[#06b6d4]/10 rounded-lg">
                              <Target className="h-5 w-5 text-[#06b6d4]" />
                            </div>
                            <div>
                              <h2 className="text-lg font-semibold text-[#0f172a]">Plan de Tratamiento</h2>
                              <p className="text-sm text-slate-600">Define objetivos y parámetros del tratamiento</p>
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              Objetivo General <span className="text-rose-500">*</span>
                            </Label>
                            <Textarea
                              value={formPlan.objetivo_general}
                              onChange={(e) => setFormPlan({ ...formPlan, objetivo_general: e.target.value })}
                              placeholder="Ej: Recuperar movilidad completa del hombro derecho y eliminar dolor..."
                              rows={3}
                              className="rounded-xl resize-none"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-sm font-medium text-slate-700">Objetivos Específicos</Label>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addObjetivo}
                                className="h-8 rounded-lg"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Agregar
                              </Button>
                            </div>
                            <div className="space-y-3">
                              {formPlan.objetivos_especificos.map((objetivo, index) => (
                                <div key={index} className="flex gap-2">
                                  <div className="flex items-center justify-center w-8 h-10 rounded-lg bg-slate-100 text-slate-600 font-medium text-sm">
                                    {index + 1}
                                  </div>
                                  <Input
                                    value={objetivo}
                                    onChange={(e) => updateObjetivo(index, e.target.value)}
                                    placeholder={`Objetivo específico ${index + 1}`}
                                    className="flex-1 rounded-xl"
                                  />
                                  {formPlan.objetivos_especificos.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeObjetivo(index)}
                                      className="h-10 w-10 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Número de Sesiones <span className="text-rose-500">*</span>
                              </Label>
                              <Input
                                type="number"
                                min="1"
                                max="100"
                                value={formPlan.numero_sesiones}
                                onChange={(e) => setFormPlan({ ...formPlan, numero_sesiones: parseInt(e.target.value) || 1 })}
                                className="rounded-xl h-12 text-center text-lg font-semibold"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Frecuencia Semanal <span className="text-rose-500">*</span>
                              </Label>
                              <Select
                                value={formPlan.frecuencia_semanal.toString()}
                                onValueChange={(value) => setFormPlan({ ...formPlan, frecuencia_semanal: parseInt(value) })}
                              >
                                <SelectTrigger className="rounded-xl h-12">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5, 6, 7].map(n => (
                                    <SelectItem key={n} value={n.toString()}>{n} vez{n > 1 ? "es" : ""}/semana</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Duración (min) <span className="text-rose-500">*</span>
                              </Label>
                              <Select
                                value={formPlan.duracion_sesion.toString()}
                                onValueChange={(value) => setFormPlan({ ...formPlan, duracion_sesion: parseInt(value) })}
                              >
                                <SelectTrigger className="rounded-xl h-12">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[30, 45, 60, 75, 90, 120].map(n => (
                                    <SelectItem key={n} value={n.toString()}>{n} min</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-slate-200">
                            <Button
                              onClick={guardarPlan}
                              disabled={loading}
                              className="bg-gradient-to-r from-[#06b6d4] to-[#0891b2] hover:from-[#0891b2] hover:to-[#0e7490] text-white px-8 h-12 rounded-xl shadow-lg shadow-[#06b6d4]/20 transition-all"
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Guardando...
                                </>
                              ) : (
                                <>
                                  Continuar a Sesiones
                                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}

                  {/* STEP 3: Sesiones */}
                  {stepActual === 3 && (
                    <Card className="border border-slate-200 rounded-xl shadow-sm">
                      <div className="p-6 space-y-6">
                        <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
                          <div className="p-2 bg-[#10b981]/10 rounded-lg">
                            <Calendar className="h-5 w-5 text-[#10b981]" />
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-[#0f172a]">Configuración de Sesiones</h2>
                            <p className="text-sm text-slate-600">Define el calendario de tratamiento</p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Fecha de Inicio <span className="text-rose-500">*</span>
                          </Label>
                          <Input
                            type="date"
                            value={formSesiones.fecha_inicio}
                            onChange={(e) => setFormSesiones({ ...formSesiones, fecha_inicio: e.target.value })}
                            className="rounded-xl h-12"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-3 block">
                            Días de la Semana <span className="text-rose-500">*</span>
                          </Label>
                          <div className="grid grid-cols-7 gap-2">
                            {DIAS_SEMANA.map((dia) => (
                              <button
                                key={dia}
                                type="button"
                                onClick={() => toggleDiaSemana(dia)}
                                className={`h-16 rounded-xl border-2 font-medium text-sm transition-all ${
                                  formSesiones.dias_semana.includes(dia)
                                    ? "border-[#10b981] bg-[#10b981] text-white shadow-lg shadow-[#10b981]/20"
                                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                {dia}
                              </button>
                            ))}
                          </div>
                          <p className="text-sm text-slate-500 mt-3">
                            {formSesiones.dias_semana.length} {formSesiones.dias_semana.length === 1 ? "día seleccionado" : "días seleccionados"}
                            {formSesiones.dias_semana.length > 0 && (
                              <span className="ml-2 text-[#10b981] font-medium">
                                ({formSesiones.dias_semana.join(", ")})
                              </span>
                            )}
                          </p>
                        </div>

                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Hora de Inicio
                          </Label>
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-slate-400" />
                            <Input
                              type="time"
                              value={formSesiones.hora_inicio}
                              onChange={(e) => setFormSesiones({ ...formSesiones, hora_inicio: e.target.value })}
                              className="rounded-xl h-12 flex-1"
                            />
                          </div>
                        </div>

                        {/* Mini visualización de calendario */}
                        {formSesiones.fecha_inicio && formSesiones.dias_semana.length > 0 && (
                          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm font-medium text-slate-700 mb-2">Vista previa del calendario</p>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Inicio: {format(new Date(formSesiones.fecha_inicio), "dd MMMM yyyy", { locale: es })}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>Horario: {formSesiones.hora_inicio} hrs</span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-4 border-t border-slate-200">
                          <Button
                            onClick={mostrarResumenFinal}
                            disabled={loading || !formSesiones.fecha_inicio || formSesiones.dias_semana.length === 0}
                            className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white px-8 h-12 rounded-xl shadow-lg shadow-[#10b981]/20 transition-all"
                          >
                            Ver Resumen Final
                            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                {/* Panel Lateral de Contexto (30%) - Sticky */}
                {stepActual >= 2 && evaluacionSeleccionada && (
                  <div className="w-96">
                    <div className="sticky top-6">
                      <Card className="border border-slate-200 rounded-xl shadow-lg">
                        <div className="p-5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white rounded-t-xl">
                          <h3 className="font-semibold text-sm mb-1">Expediente Clínico</h3>
                          <p className="text-xs text-slate-300">Evaluación de referencia</p>
                        </div>
                        <div className="p-5 space-y-4">
                          <div>
                            <p className="text-xs font-medium text-slate-500 mb-1">PACIENTE</p>
                            <p className="text-sm font-semibold text-slate-900">
                              {pacienteSeleccionado?.nombres} {pacienteSeleccionado?.apellidos}
                            </p>
                            <p className="text-xs text-slate-500">
                              {pacienteSeleccionado?.documento} • {pacienteSeleccionado?.edad} años
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-1">DIAGNÓSTICO</p>
                            <p className="text-sm text-slate-900 leading-relaxed">
                              {evaluacionSeleccionada.diagnostico_fisio}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-1">MOTIVO DE CONSULTA</p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {evaluacionSeleccionada.motivo_consulta}
                            </p>
                          </div>

                          <div className="pt-3 border-t border-slate-200">
                            <p className="text-xs font-medium text-slate-500 mb-2">DOLOR INICIAL (EVA)</p>
                            <div className="flex items-center gap-3">
                              {getEvaScoreBadge(evaluacionSeleccionada.eva_score)}
                              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all ${
                                    evaluacionSeleccionada.eva_score <= 3
                                      ? "bg-emerald-500"
                                      : evaluacionSeleccionada.eva_score <= 6
                                      ? "bg-amber-500"
                                      : "bg-rose-500"
                                  }`}
                                  style={{ width: `${(evaluacionSeleccionada.eva_score / 10) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {evaluacionSeleccionada.historia_enfermedad_actual && (
                            <div className="pt-3 border-t border-slate-200">
                              <p className="text-xs font-medium text-slate-500 mb-1">HISTORIA</p>
                              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                                {evaluacionSeleccionada.historia_enfermedad_actual}
                              </p>
                            </div>
                          )}

                          <div className="pt-3 border-t border-slate-200">
                            <p className="text-xs text-slate-400">
                              Evaluación v{evaluacionSeleccionada.version_numero} • {format(new Date(evaluacionSeleccionada.fecha_creacion), "dd MMM yyyy", { locale: es })}
                            </p>
                          </div>
                        </div>
                      </Card>

                      {/* Resumen del plan en progreso */}
                      {stepActual === 3 && planId && (
                        <Card className="border border-slate-200 rounded-xl shadow-sm mt-4">
                          <div className="p-5 space-y-3">
                            <h3 className="font-semibold text-sm text-slate-900">Plan Configurado</h3>
                            
                            <div>
                              <p className="text-xs font-medium text-slate-500 mb-1">OBJETIVO</p>
                              <p className="text-xs text-slate-700 line-clamp-2">
                                {formPlan.objetivo_general}
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2">
                              <div className="text-center p-2 bg-slate-50 rounded-lg">
                                <p className="text-lg font-bold text-[#0f172a]">{formPlan.numero_sesiones}</p>
                                <p className="text-[10px] text-slate-500">Sesiones</p>
                              </div>
                              <div className="text-center p-2 bg-slate-50 rounded-lg">
                                <p className="text-lg font-bold text-[#0f172a]">{formPlan.frecuencia_semanal}x</p>
                                <p className="text-[10px] text-slate-500">Por semana</p>
                              </div>
                              <div className="text-center p-2 bg-slate-50 rounded-lg">
                                <p className="text-lg font-bold text-[#0f172a]">{formPlan.duracion_sesion}</p>
                                <p className="text-[10px] text-slate-500">Minutos</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de Resumen Final */}
      {showResumen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-[#0f172a]">Resumen del Plan de Tratamiento</h2>
              <p className="text-sm text-slate-600 mt-1">Revisa todos los detalles antes de generar las sesiones</p>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Paciente */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#06b6d4] to-[#0891b2] flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {pacienteSeleccionado?.nombres} {pacienteSeleccionado?.apellidos}
                  </p>
                  <p className="text-sm text-slate-600">
                    {pacienteSeleccionado?.documento} • {pacienteSeleccionado?.edad} años
                  </p>
                </div>
              </div>

              {/* Diagnóstico y EVA */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 mb-2">DIAGNÓSTICO</p>
                  <p className="text-sm font-medium text-slate-900">{evaluacionSeleccionada?.diagnostico_fisio}</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl">
                  <p className="text-xs font-medium text-slate-500 mb-2">DOLOR INICIAL (EVA)</p>
                  {evaluacionSeleccionada && getEvaScoreBadge(evaluacionSeleccionada.eva_score)}
                </div>
              </div>

              {/* Objetivo Principal */}
              <div className="p-4 border-l-4 border-[#10b981] bg-emerald-50 rounded-r-xl">
                <p className="text-xs font-medium text-emerald-700 mb-1">OBJETIVO PRINCIPAL</p>
                <p className="text-sm text-emerald-900">{formPlan.objetivo_general}</p>
              </div>

              {/* Configuración */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#0f172a]">{formPlan.numero_sesiones}</p>
                  <p className="text-sm text-slate-600 mt-1">Sesiones totales</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#0f172a]">{formPlan.frecuencia_semanal}x</p>
                  <p className="text-sm text-slate-600 mt-1">Por semana</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-xl">
                  <p className="text-3xl font-bold text-[#0f172a]">{formPlan.duracion_sesion}</p>
                  <p className="text-sm text-slate-600 mt-1">Minutos/sesión</p>
                </div>
              </div>

              {/* Horario */}
              <div className="p-4 border border-slate-200 rounded-xl">
                <p className="text-xs font-medium text-slate-500 mb-3">HORARIO SELECCIONADO</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900">
                      Inicia: {format(new Date(formSesiones.fecha_inicio), "dd 'de' MMMM, yyyy", { locale: es })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900">Hora: {formSesiones.hora_inicio} hrs</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-slate-600">Días:</span>
                    <div className="flex gap-1">
                      {formSesiones.dias_semana.map(dia => (
                        <Badge key={dia} className="bg-[#10b981] text-white">{dia}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 flex justify-between">
              <Button
                variant="outline"
                onClick={() => setShowResumen(false)}
                className="rounded-xl"
              >
                Volver a Editar
              </Button>
              <Button
                onClick={generarSesiones}
                disabled={loading}
                className="bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white px-8 h-12 rounded-xl shadow-lg shadow-[#10b981]/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    🚀 Generar {formPlan.numero_sesiones} Sesiones
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

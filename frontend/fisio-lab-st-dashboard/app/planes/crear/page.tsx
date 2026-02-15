"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Plus, 
  X, 
  User, 
  UserPlus,
  ClipboardCheck, 
  Settings as SettingsIcon, 
  Calendar,
  ArrowRight,
  AlertCircle,
  Check,
  AlertTriangle,
  CheckCircle2,
  Search
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { generarSesionesV2, fetchProfesionales, type Profesional } from "@/lib/api/citas"

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
}

const DRAFT_KEY = "plan_tratamiento_draft"

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

  // Estados del flujo
  const [currentStep, setCurrentStep] = useState<"selector" | "formulario">("selector")
  const [activeTab, setActiveTab] = useState("evaluacion")
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [planActivoExistente, setPlanActivoExistente] = useState<any>(null)
  const [showWarning, setShowWarning] = useState(false)

  // Listas
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [loading, setLoading] = useState(false)
  const [searchDocumento, setSearchDocumento] = useState("")
  const [showNuevoPacienteModal, setShowNuevoPacienteModal] = useState(false)
  const [creandoPaciente, setCreandoPaciente] = useState(false)
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombres: "",
    apellidos: "",
    tipo_documento: "DNI",
    documento: "",
    fecha_nacimiento: "",
    sexo: "",
    celular: "",
  })

  // Estados de completitud
  const [evaluacionCompletada, setEvaluacionCompletada] = useState(false)
  const [planCompletado, setPlanCompletado] = useState(false)
  const [sesionesCompletadas, setSesionesCompletadas] = useState(false)

  // IDs guardados
  const [evaluacionId, setEvaluacionId] = useState<string>("")
  const [planId, setPlanId] = useState<string>("")

  // Form data - Tab 1: Evaluación
  const [modoEvaluacion, setModoEvaluacion] = useState<"nueva" | "existente">("nueva")
  const [evaluacionExistenteId, setEvaluacionExistenteId] = useState("")
  const [formEvaluacion, setFormEvaluacion] = useState({
    motivo_consulta: "",
    historia_enfermedad_actual: "",
    diagnostico_fisio: "",
    hallazgos_clinicos: "",
    eva_score: 5,
  })

  // Form data - Tab 2: Plan
  const [formPlan, setFormPlan] = useState({
    objetivo_general: "",
    objetivos_especificos: [""],
    numero_sesiones: 12,
    frecuencia_semanal: 3,
    duracion_sesion: 60,
  })

  // Form data - Tab 3: Sesiones
  const [formSesiones, setFormSesiones] = useState({
    fecha_inicio: "",
    dias_semana: [] as number[],
    hora_inicio: "09:00",
    profesional_id: "",
    duracion_minutos: 60,
  })
  const [generacionResultado, setGeneracionResultado] = useState<{
    sesionesGeneradas: number;
    conflictos: Array<{ fecha: string; numeroSesion: number; motivo: string; sugerencia: string }>;
    mensaje: string;
  } | null>(null)

  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  // Función para cargar el borrador
  const cargarBorrador = () => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      const draft = JSON.parse(savedDraft)
      setCurrentStep(draft.currentStep)
      setActiveTab(draft.activeTab)
      setPacienteSeleccionado(draft.pacienteSeleccionado)
      setEvaluacionCompletada(draft.evaluacionCompletada)
      setPlanCompletado(draft.planCompletado)
      setSesionesCompletadas(draft.sesionesCompletadas)
      setEvaluacionId(draft.evaluacionId || "")
      setPlanId(draft.planId || "")
      setModoEvaluacion(draft.modoEvaluacion)
      setEvaluacionExistenteId(draft.evaluacionExistenteId || "")
      setFormEvaluacion(draft.formEvaluacion)
      setFormPlan(draft.formPlan)
      setFormSesiones(draft.formSesiones)

      // Cargar evaluaciones si hay paciente
      if (draft.pacienteSeleccionado) {
        const token = localStorage.getItem("fisiolab_token")
        
        fetch(`http://localhost:3001/api/v2/evaluaciones/pacientes/${draft.pacienteSeleccionado.id}/evaluaciones`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(res => res.json())
          .then(evaluacionesData => {
            if (evaluacionesData.success && evaluacionesData.data) {
              setEvaluaciones(evaluacionesData.data)
            }
          })
          .catch(console.error)
      }

      toast({
        title: "Borrador cargado",
        description: "Se ha restaurado tu progreso anterior",
      })
    }
  }

  // Cargar borrador automáticamente al montar el componente
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        setHasDraft(true)
        // Cargar automáticamente sin preguntar
        setTimeout(() => {
          cargarBorrador()
        }, 100)
      }
    }
  }, [])

  // Guardar estado automáticamente
  useEffect(() => {
    if (pacienteSeleccionado && typeof window !== "undefined") {
      const draftData = {
        timestamp: new Date().toISOString(),
        currentStep,
        activeTab,
        pacienteSeleccionado,
        evaluacionCompletada,
        planCompletado,
        sesionesCompletadas,
        evaluacionId,
        planId,
        modoEvaluacion,
        evaluacionExistenteId,
        formEvaluacion,
        formPlan,
        formSesiones,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
    }
  }, [
    currentStep,
    activeTab,
    pacienteSeleccionado,
    evaluacionCompletada,
    planCompletado,
    sesionesCompletadas,
    evaluacionId,
    planId,
    modoEvaluacion,
    evaluacionExistenteId,
    formEvaluacion,
    formPlan,
    formSesiones,
  ])

  const limpiarBorrador = () => {
    localStorage.removeItem(DRAFT_KEY)
    setHasDraft(false)
  }

  const volverAListaPlanes = () => {
    limpiarBorrador()
    router.push("/planes")
  }

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchPacientes(token)
      loadProfesionales()
    }
  }, [router])

  const loadProfesionales = async () => {
    const result = await fetchProfesionales()
    if (result.success && result.data) {
      setProfesionales(result.data)
    }
  }

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
      const evaluacionesResponse = await fetch(
        `http://localhost:3001/api/v2/evaluaciones/pacientes/${paciente.id}/evaluaciones`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      if (evaluacionesResponse.ok) {
        const evaluacionesData = await evaluacionesResponse.json()
        
        if (evaluacionesData.success && evaluacionesData.data) {
          setEvaluaciones(evaluacionesData.data)
        }
      }
    } catch (error) {
      console.error("Error cargando evaluaciones:", error)
    }

    setCurrentStep("formulario")
  }

  const handleSeleccionarPaciente = async (pacienteId: string) => {
    if (!pacienteId) return

    const paciente = pacientes.find(p => p.id === pacienteId)
    if (!paciente) return

    setLoading(true)
    try {
      const token = localStorage.getItem("fisiolab_token")

      // Verificar si tiene planes activos
      const response = await fetch(
        `http://localhost:3001/api/v2/planes?paciente_id=${pacienteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.ok) {
        const data = await response.json()
        // Filtrar planes que estén ACTIVO o PAUSADO
        const planesActivos = data.data?.filter((p: any) => 
          p.estado === 'ACTIVO' || p.estado === 'PAUSADO'
        ) || []
        
        if (planesActivos.length > 0) {
          // Tiene planes activos
          setPlanActivoExistente(planesActivos[0])
          setShowWarning(true)
        } else {
          // No tiene planes activos, continuar
          continuarAlFormulario(paciente)
        }
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const guardarEvaluacion = async () => {
    if (modoEvaluacion === "existente") {
      if (!evaluacionExistenteId) {
        toast({
          title: "Selecciona una evaluación",
          variant: "destructive",
        })
        return
      }
      setEvaluacionId(evaluacionExistenteId)
      setEvaluacionCompletada(true)
      setActiveTab("plan")
      toast({ title: "Evaluación seleccionada" })
      return
    }

    // Crear nueva evaluación
    if (!formEvaluacion.motivo_consulta || !formEvaluacion.diagnostico_fisio) {
      toast({
        title: "Completa los campos requeridos",
        variant: "destructive",
      })
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
      setEvaluacionCompletada(true)
      setActiveTab("plan")
      toast({ title: "✅ Evaluación guardada", description: "Continúa con la configuración del plan" })
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
      toast({
        title: "Ingresa el objetivo general",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      
      // Combinar objetivo general y específicos en un solo texto
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
          fecha_inicio: new Date().toISOString().split('T')[0], // Fecha actual
          notas: `Duración de sesión: ${formPlan.duracion_sesion} minutos`
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Error al crear plan")

      setPlanId(data.data.id)
      setPlanCompletado(true)
      setActiveTab("sesiones")
      toast({ title: "✅ Plan guardado", description: "Configura las sesiones" })
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

  const generarSesiones = async () => {
    if (!formSesiones.fecha_inicio || formSesiones.dias_semana.length === 0) {
      toast({
        title: "Completa la configuración de sesiones",
        description: "Selecciona fecha de inicio y al menos un día de la semana",
        variant: "destructive",
      })
      return
    }

    if (!formSesiones.profesional_id) {
      toast({
        title: "Selecciona un profesional",
        description: "Es necesario asignar un profesional a las sesiones",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setGeneracionResultado(null)

    const result = await generarSesionesV2(planId, {
      fecha_inicio: formSesiones.fecha_inicio,
      dias_semana: formSesiones.dias_semana,
      hora: formSesiones.hora_inicio,
      profesional_id: formSesiones.profesional_id,
      duracion_minutos: formSesiones.duracion_minutos,
    })

    setLoading(false)

    if (result.success && result.data) {
      setGeneracionResultado({
        sesionesGeneradas: result.data.sesionesGeneradas,
        conflictos: result.data.conflictos || [],
        mensaje: result.data.mensaje,
      })

      if (result.data.conflictos && result.data.conflictos.length > 0) {
        toast({
          title: `⚠️ ${result.data.sesionesGeneradas} sesiones generadas con conflictos`,
          description: `${result.data.conflictos.length} horario(s) tuvieron solapamiento y fueron ajustados o requieren revisión`,
        })
      } else {
        toast({
          title: `✅ ${result.data.sesionesGeneradas} sesiones generadas`,
          description: "Todas las sesiones fueron programadas sin conflictos",
        })
      }

      setSesionesCompletadas(true)
      limpiarBorrador()
    } else {
      toast({
        title: "Error al generar sesiones",
        description: result.error || "No se pudieron generar las sesiones",
        variant: "destructive",
      })
    }
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

  const toggleDiaSemana = (diaNum: number) => {
    if (formSesiones.dias_semana.includes(diaNum)) {
      setFormSesiones({
        ...formSesiones,
        dias_semana: formSesiones.dias_semana.filter(d => d !== diaNum),
      })
    } else {
      setFormSesiones({
        ...formSesiones,
        dias_semana: [...formSesiones.dias_semana, diaNum].sort(),
      })
    }
  }

  const crearNuevoPaciente = async () => {
    const { nombres, apellidos, documento, fecha_nacimiento, sexo, celular } = nuevoPaciente
    if (!nombres.trim() || !apellidos.trim() || !documento.trim() || !fecha_nacimiento || !sexo || !celular.trim()) {
      toast({ title: "Completa todos los campos obligatorios", variant: "destructive" })
      return
    }

    setCreandoPaciente(true)
    try {
      let edad = null
      if (fecha_nacimiento) {
        const fechaNac = new Date(fecha_nacimiento)
        const hoy = new Date()
        edad = hoy.getFullYear() - fechaNac.getFullYear()
        const mes = hoy.getMonth() - fechaNac.getMonth()
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) edad--
      }

      const response = await fetch("http://localhost:3001/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...nuevoPaciente, edad }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Error al crear paciente")

      const pacienteCreado: Paciente = {
        id: data.data.id,
        nombres,
        apellidos,
        documento,
        edad: edad || 0,
      }

      // Agregar a la lista y refrescar
      const token = localStorage.getItem("fisiolab_token")
      if (token) fetchPacientes(token)

      toast({ title: "Paciente creado", description: `${nombres} ${apellidos} registrado exitosamente` })
      setShowNuevoPacienteModal(false)
      setNuevoPaciente({ nombres: "", apellidos: "", tipo_documento: "DNI", documento: "", fecha_nacimiento: "", sexo: "", celular: "" })

      // Auto-seleccionar y avanzar
      continuarAlFormulario(pacienteCreado)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el paciente",
        variant: "destructive",
      })
    } finally {
      setCreandoPaciente(false)
    }
  }

  // Filtrar pacientes por documento (Cédula/DNI)
  const pacientesFiltrados = searchDocumento.trim()
    ? pacientes.filter(p =>
        p.documento.toLowerCase().includes(searchDocumento.toLowerCase()) ||
        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchDocumento.toLowerCase())
      )
    : pacientes

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={() => currentStep === "selector" ? volverAListaPlanes() : setCurrentStep("selector")}
                className="mb-4 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded transition-all"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {currentStep === "selector" ? "Volver a Planes" : "Cambiar Paciente"}
              </Button>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">
                Crear Evaluación y Plan de Tratamiento
              </h1>
              <p className="text-sm text-slate-500">
                {currentStep === "selector" 
                  ? "Selecciona el paciente para iniciar el plan de tratamiento" 
                  : `Paciente: ${pacienteSeleccionado?.nombres} ${pacienteSeleccionado?.apellidos}`}
              </p>
            </div>

            {/* PASO 1: Selector de Paciente */}
            {currentStep === "selector" && (
              <Card className="bg-white border border-slate-200 rounded">
                <CardHeader className="border-b border-slate-200 p-6">
                  <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                    <div className="p-2 bg-cyan-600 rounded">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    Seleccionar Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {showWarning && planActivoExistente && (
                    <Alert className="mb-6 border-amber-300 bg-amber-50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-900">
                        <strong>Este paciente ya tiene un plan de tratamiento activo</strong>
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
                  )}

                  {!showWarning && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium text-slate-700">
                          Buscar paciente por Cédula/DNI
                        </Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowNuevoPacienteModal(true)}
                          className="border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white transition-all h-8"
                        >
                          <UserPlus className="h-4 w-4 mr-1.5" />
                          Nuevo Paciente
                        </Button>
                      </div>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          type="text"
                          placeholder="Ingresa el número de Cédula o DNI del paciente..."
                          value={searchDocumento}
                          onChange={(e) => setSearchDocumento(e.target.value)}
                          className="pl-10 h-11 border-slate-200 bg-white rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
                        />
                      </div>
                      {searchDocumento.trim() && (
                        <div className="border border-slate-200 rounded bg-white max-h-60 overflow-y-auto">
                          {pacientesFiltrados.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">
                              No se encontraron pacientes con ese documento
                            </div>
                          ) : (
                            pacientesFiltrados.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => handleSeleccionarPaciente(p.id)}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors text-left"
                              >
                                <div>
                                  <span className="font-medium text-slate-900">{p.nombres} {p.apellidos}</span>
                                  {p.edad && <span className="text-xs text-slate-500 ml-2">({p.edad} años)</span>}
                                </div>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {p.documento}
                                </Badge>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                      {!searchDocumento.trim() && (
                        <p className="text-xs text-slate-500">
                          Escribe el número de documento para buscar al paciente
                        </p>
                      )}
                      {loading && (
                        <p className="text-sm text-slate-500 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Verificando planes existentes...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Modal Crear Nuevo Paciente */}
            <Dialog open={showNuevoPacienteModal} onOpenChange={setShowNuevoPacienteModal}>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <UserPlus className="h-5 w-5 text-cyan-600" />
                    Registrar Nuevo Paciente
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Nombres <span className="text-rose-500">*</span></Label>
                      <Input
                        value={nuevoPaciente.nombres}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, nombres: e.target.value })}
                        placeholder="Nombres"
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Apellidos <span className="text-rose-500">*</span></Label>
                      <Input
                        value={nuevoPaciente.apellidos}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, apellidos: e.target.value })}
                        placeholder="Apellidos"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Tipo Doc. <span className="text-rose-500">*</span></Label>
                      <Select value={nuevoPaciente.tipo_documento} onValueChange={(v) => setNuevoPaciente({ ...nuevoPaciente, tipo_documento: v })}>
                        <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DNI">DNI</SelectItem>
                          <SelectItem value="CarnetExtranjeria">Carné Extranjería</SelectItem>
                          <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Nº Documento <span className="text-rose-500">*</span></Label>
                      <Input
                        value={nuevoPaciente.documento}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, documento: e.target.value })}
                        placeholder="12345678"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Fecha Nacimiento <span className="text-rose-500">*</span></Label>
                      <Input
                        type="date"
                        value={nuevoPaciente.fecha_nacimiento}
                        onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, fecha_nacimiento: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Sexo <span className="text-rose-500">*</span></Label>
                      <Select value={nuevoPaciente.sexo} onValueChange={(v) => setNuevoPaciente({ ...nuevoPaciente, sexo: v })}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="M">Masculino</SelectItem>
                          <SelectItem value="F">Femenino</SelectItem>
                          <SelectItem value="O">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-1.5 block">Celular <span className="text-rose-500">*</span></Label>
                    <Input
                      type="tel"
                      value={nuevoPaciente.celular}
                      onChange={(e) => setNuevoPaciente({ ...nuevoPaciente, celular: e.target.value })}
                      placeholder="999888777"
                      className="h-10"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                    <Button variant="outline" onClick={() => setShowNuevoPacienteModal(false)} disabled={creandoPaciente}>
                      Cancelar
                    </Button>
                    <Button onClick={crearNuevoPaciente} disabled={creandoPaciente} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                      {creandoPaciente ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creando...</>
                      ) : (
                        <><UserPlus className="mr-2 h-4 w-4" />Crear y Seleccionar</>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* PASO 2: Formulario con Tabs */}
            {currentStep === "formulario" && pacienteSeleccionado && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 bg-white border border-slate-200 p-1.5 rounded">
                  <TabsTrigger 
                    value="evaluacion" 
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white relative rounded-md transition-all py-2.5"
                    disabled={false}
                  >
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">1. Evaluación</span>
                    {evaluacionCompletada && (
                      <Check className="h-3.5 w-3.5 ml-1 absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="plan" 
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white relative rounded-md transition-all py-2.5"
                    disabled={!evaluacionCompletada}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">2. Plan</span>
                    {planCompletado && (
                      <Check className="h-3.5 w-3.5 ml-1 absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" />
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="sesiones" 
                    className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white relative rounded-md transition-all py-2.5"
                    disabled={!planCompletado}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium text-sm">3. Sesiones</span>
                    {sesionesCompletadas && (
                      <Check className="h-3.5 w-3.5 ml-1 absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5" />
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: EVALUACIÓN */}
                <TabsContent value="evaluacion">
                  <Card className="bg-white border border-slate-200 rounded">
                    <CardHeader className="border-b border-slate-200 p-6">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-cyan-600 rounded">
                          <ClipboardCheck className="h-5 w-5 text-white" />
                        </div>
                        Evaluación Fisioterapéutica
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Selector: Nueva o Existente */}
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant={modoEvaluacion === "nueva" ? "default" : "outline"}
                          onClick={() => setModoEvaluacion("nueva")}
                          className={modoEvaluacion === "nueva" ? "flex-1 bg-cyan-600 hover:bg-cyan-700" : "flex-1"}
                        >
                          Crear Nueva Evaluación
                        </Button>
                        <Button
                          type="button"
                          variant={modoEvaluacion === "existente" ? "default" : "outline"}
                          onClick={() => setModoEvaluacion("existente")}
                          className={modoEvaluacion === "existente" ? "flex-1 bg-cyan-600 hover:bg-cyan-700" : "flex-1"}
                          disabled={evaluaciones.length === 0}
                        >
                          Seleccionar Existente ({evaluaciones.length})
                        </Button>
                      </div>

                      {modoEvaluacion === "existente" ? (
                        <div className="space-y-4">
                          <Label className="text-sm font-medium text-slate-700">Evaluaciones del Paciente</Label>
                          {evaluaciones.length === 0 ? (
                            <Alert className="border-slate-200 bg-slate-50">
                              <AlertCircle className="h-4 w-4 text-slate-600" />
                              <AlertDescription className="text-slate-700">
                                Este paciente no tiene evaluaciones registradas. Crea una nueva evaluación primero.
                              </AlertDescription>
                            </Alert>
                          ) : (
                            <Select value={evaluacionExistenteId} onValueChange={setEvaluacionExistenteId}>
                              <SelectTrigger className="h-11 bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600">
                                <SelectValue placeholder="Selecciona una evaluación" />
                              </SelectTrigger>
                              <SelectContent>
                                {evaluaciones.map((ev) => (
                                  <SelectItem key={ev.id} value={ev.id}>
                                    <div>
                                      <p className="font-medium">{ev.diagnostico_fisio}</p>
                                      <p className="text-xs text-slate-500">
                                        v{ev.version_numero} - EVA: {ev.eva_score}/10
                                      </p>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
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
                              placeholder="Describe el motivo por el cual el paciente consulta..."
                              rows={3}
                              className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 resize-none transition-all"
                            />
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              Diagnóstico Fisioterapéutico <span className="text-rose-500">*</span>
                            </Label>
                            <Textarea
                              value={formEvaluacion.diagnostico_fisio}
                              onChange={(e) => setFormEvaluacion({ ...formEvaluacion, diagnostico_fisio: e.target.value })}
                              placeholder="Diagnóstico fisioterapéutico principal"
                              rows={3}
                              className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 resize-none transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Historia de Enfermedad
                              </Label>
                              <Textarea
                                value={formEvaluacion.historia_enfermedad_actual}
                                onChange={(e) => setFormEvaluacion({ ...formEvaluacion, historia_enfermedad_actual: e.target.value })}
                                rows={4}
                                placeholder="Evolución del cuadro clínico..."
                                className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 resize-none transition-all"
                              />
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-slate-700 mb-2 block">
                                Hallazgos Clínicos
                              </Label>
                              <Textarea
                                value={formEvaluacion.hallazgos_clinicos}
                                onChange={(e) => setFormEvaluacion({ ...formEvaluacion, hallazgos_clinicos: e.target.value })}
                                rows={4}
                                placeholder="Resultados del examen físico..."
                                className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 resize-none transition-all"
                               />
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-slate-700 mb-2 block">
                              Escala Visual Análoga (EVA) - Nivel de Dolor
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              max="10"
                              value={formEvaluacion.eva_score}
                              onChange={(e) => setFormEvaluacion({ ...formEvaluacion, eva_score: parseInt(e.target.value) || 0 })}
                              className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-11 text-center text-lg font-semibold transition-all"
                            />
                            <p className="text-xs text-slate-500 mt-1.5">Rango: 0 (sin dolor) a 10 (dolor máximo)</p>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-6 border-t border-slate-200">
                        <Button
                          onClick={guardarEvaluacion}
                          disabled={loading}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white h-10 px-6 rounded transition-all"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              Guardar y Continuar
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 2: PLAN */}
                <TabsContent value="plan">
                  <Card className="bg-white border border-slate-200 rounded">
                    <CardHeader className="border-b border-slate-200 p-6">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-cyan-600 rounded">
                          <SettingsIcon className="h-5 w-5 text-white" />
                        </div>
                        Configuración del Plan de Tratamiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Objetivo General del Tratamiento <span className="text-rose-500">*</span>
                        </Label>
                        <Textarea
                          value={formPlan.objetivo_general}
                          onChange={(e) => setFormPlan({ ...formPlan, objetivo_general: e.target.value })}
                          placeholder="Ejemplo: Recuperar movilidad completa del hombro derecho y eliminar dolor en actividades de la vida diaria..."
                          rows={4}
                          className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 resize-none transition-all"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-medium text-slate-700">
                            Objetivos Específicos
                          </Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addObjetivo}
                            className="border-cyan-600 text-cyan-600 hover:bg-cyan-600 hover:text-white rounded transition-all h-9"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Agregar
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {formPlan.objetivos_especificos.map((objetivo, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={objetivo}
                                onChange={(e) => updateObjetivo(index, e.target.value)}
                                placeholder={`Objetivo específico ${index + 1}`}
                                className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-10 transition-all"
                              />
                              {formPlan.objetivos_especificos.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeObjetivo(index)}
                                  className="hover:bg-rose-50 hover:text-rose-600 rounded transition-all"
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">Número de Sesiones *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={formPlan.numero_sesiones}
                            onChange={(e) => setFormPlan({ ...formPlan, numero_sesiones: parseInt(e.target.value) || 1 })}
                            className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-10"
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">Frecuencia Semanal *</Label>
                          <Select
                            value={formPlan.frecuencia_semanal.toString()}
                            onValueChange={(value) => setFormPlan({ ...formPlan, frecuencia_semanal: parseInt(value) })}
                          >
                            <SelectTrigger className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n}x semana</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">Duración (minutos) *</Label>
                          <Select
                            value={formPlan.duracion_sesion.toString()}
                            onValueChange={(value) => setFormPlan({ ...formPlan, duracion_sesion: parseInt(value) })}
                          >
                            <SelectTrigger className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[30, 45, 60, 90, 120].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n} min</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6 border-t border-slate-200">
                        <Button
                          onClick={guardarPlan}
                          disabled={loading}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white h-10 px-6 rounded transition-all"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : (
                            <>
                              Guardar y Continuar
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TAB 3: SESIONES */}
                <TabsContent value="sesiones">
                  <Card className="bg-white border border-slate-200 rounded">
                    <CardHeader className="border-b border-slate-200 p-6">
                      <CardTitle className="text-lg font-semibold text-slate-900 flex items-center gap-3">
                        <div className="p-2 bg-cyan-600 rounded">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        Configuración de Sesiones
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Profesional */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Profesional Asignado <span className="text-rose-500">*</span>
                        </Label>
                        <Select
                          value={formSesiones.profesional_id}
                          onValueChange={(value) => setFormSesiones({ ...formSesiones, profesional_id: value })}
                        >
                          <SelectTrigger className="h-11 bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600">
                            <SelectValue placeholder="Selecciona el profesional..." />
                          </SelectTrigger>
                          <SelectContent>
                            {profesionales.map((prof) => (
                              <SelectItem key={prof.id} value={prof.id}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{prof.nombre} {prof.apellido || ''}</span>
                                  {prof.especialidad && (
                                    <span className="text-xs text-slate-500">({prof.especialidad})</span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Fecha de inicio */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">Fecha de Inicio <span className="text-rose-500">*</span></Label>
                        <Input
                          type="date"
                          value={formSesiones.fecha_inicio}
                          onChange={(e) => setFormSesiones({ ...formSesiones, fecha_inicio: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-10"
                        />
                      </div>

                      {/* Días de la semana */}
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2 block">
                          Días de la Semana <span className="text-rose-500">*</span>
                        </Label>
                        <div className="grid grid-cols-7 gap-2">
                          {[
                            { label: "Lun", value: 1 },
                            { label: "Mar", value: 2 },
                            { label: "Mié", value: 3 },
                            { label: "Jue", value: 4 },
                            { label: "Vie", value: 5 },
                            { label: "Sáb", value: 6 },
                            { label: "Dom", value: 0 },
                          ].map((dia) => (
                            <Button
                              key={dia.value}
                              type="button"
                              variant={formSesiones.dias_semana.includes(dia.value) ? "default" : "outline"}
                              onClick={() => toggleDiaSemana(dia.value)}
                              className={formSesiones.dias_semana.includes(dia.value) ? "h-10 bg-cyan-600 hover:bg-cyan-700" : "h-10"}
                            >
                              {dia.label}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5">
                          {formSesiones.dias_semana.length > 0
                            ? `${formSesiones.dias_semana.length} día(s) seleccionado(s)`
                            : "Selecciona los días en que se realizarán las sesiones"}
                        </p>
                      </div>

                      {/* Hora base + Duración */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Hora Base del Primer Día
                          </Label>
                          <Input
                            type="time"
                            value={formSesiones.hora_inicio}
                            onChange={(e) => setFormSesiones({ ...formSesiones, hora_inicio: e.target.value })}
                            className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-10"
                          />
                          <p className="text-xs text-slate-500 mt-1">
                            Esta hora se usará como referencia para todas las sesiones. Si hay conflictos, el sistema ajustará automáticamente.
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">Duración por Sesión</Label>
                          <Select
                            value={formSesiones.duracion_minutos.toString()}
                            onValueChange={(value) => setFormSesiones({ ...formSesiones, duracion_minutos: parseInt(value) })}
                          >
                            <SelectTrigger className="bg-white border-slate-200 rounded focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 h-10">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[30, 45, 60, 90, 120].map(n => (
                                <SelectItem key={n} value={n.toString()}>{n} minutos</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Resultado de generación */}
                      {generacionResultado && (
                        <div className="space-y-3 pt-2">
                          <Alert className={generacionResultado.conflictos.length > 0 ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}>
                            {generacionResultado.conflictos.length > 0 ? (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            )}
                            <AlertDescription>
                              <p className={generacionResultado.conflictos.length > 0 ? "text-amber-900 font-medium" : "text-emerald-900 font-medium"}>
                                {generacionResultado.mensaje}
                              </p>
                              {generacionResultado.conflictos.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs text-amber-700 font-medium">Conflictos detectados:</p>
                                  {generacionResultado.conflictos.map((c, i) => (
                                    <div key={i} className="text-xs text-amber-800 bg-amber-100 rounded p-2">
                                      <span className="font-medium">Sesión #{c.numeroSesion}:</span> {c.motivo}
                                      {c.sugerencia && <span className="text-amber-600 block mt-0.5">{c.sugerencia}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>

                          {sesionesCompletadas && (
                            <div className="flex justify-center pt-2">
                              <Button
                                onClick={() => router.push(`/planes/${planId}`)}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white"
                              >
                                Ver Plan de Tratamiento
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {!sesionesCompletadas && (
                        <div className="flex justify-end pt-6 border-t border-slate-200">
                          <Button
                            onClick={generarSesiones}
                            disabled={loading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white h-10 px-6 rounded transition-all"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generando sesiones...
                              </>
                            ) : (
                              <>
                                Generar {formPlan.numero_sesiones} Sesiones
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

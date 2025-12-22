"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { X, Calendar, Clock, User, AlertCircle, Loader2, Target, CheckCircle2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  checkDisponibilidad, 
  crearCita, 
  CrearCitaPayload,
  fetchPacientes,
  fetchProfesionales,
  fetchPlanesPaciente,
  obtenerSesionesPendientesPaciente,
  asignarCitaASesion,
  generarSesionesPendientes,
  Paciente,
  Profesional,
  PlanTratamiento,
  Sesion
} from "@/lib/api/citas"
import { useToast } from "@/hooks/use-toast"

interface CitaModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  pacienteId?: string
  profesionalId?: string
  planId?: string
  fechaInicio?: Date
}

export function CitaModal({
  open,
  onClose,
  onSuccess,
  pacienteId: pacienteIdProp,
  profesionalId: profesionalIdProp,
  planId: planIdProp,
  fechaInicio
}: CitaModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(false)
  
  // Data lists for selects
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [planes, setPlanes] = useState<PlanTratamiento[]>([])
  const [sesionesPendientes, setSesionesPendientes] = useState<Sesion[]>([])
  const [loadingPacientes, setLoadingPacientes] = useState(false)
  const [loadingProfesionales, setLoadingProfesionales] = useState(false)
  const [loadingPlanes, setLoadingPlanes] = useState(false)
  const [loadingSesiones, setLoadingSesiones] = useState(false)
  
  // Form state
  const [pacienteId, setPacienteId] = useState(pacienteIdProp || "")
  const [profesionalId, setProfesionalId] = useState(profesionalIdProp || "")
  const [planId, setPlanId] = useState(planIdProp || "")
  const [sesionId, setSesionId] = useState("") // Sesión pendiente a asignar
  const [fecha, setFecha] = useState(
    fechaInicio ? format(fechaInicio, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  )
  const [horaInicio, setHoraInicio] = useState("09:00")
  const [duracionMinutos, setDuracionMinutos] = useState("60")
  const [titulo, setTitulo] = useState("")
  const [notas, setNotas] = useState("")

  // Disponibilidad
  const [disponibilidadVerificada, setDisponibilidadVerificada] = useState(false)
  const [conflictos, setConflictos] = useState<any[]>([])

  // Load data when modal opens
  useEffect(() => {
    if (open) {
      loadPacientes()
      loadProfesionales()
      // Reset form
      if (!planIdProp) {
        setPlanes([])
        setPlanId("")
        setSesionesPendientes([])
        setSesionId("")
      }
    }
  }, [open])

  // Load planes when paciente changes
  useEffect(() => {
    if (pacienteId) {
      loadPlanesPaciente(pacienteId)
      loadSesionesPendientes(pacienteId)
    } else {
      setPlanes([])
      setPlanId("")
      setSesionesPendientes([])
      setSesionId("")
    }
  }, [pacienteId])

  // Filter sesiones when plan changes
  useEffect(() => {
    if (planId && sesionesPendientes.length > 0) {
      // Auto-select first pending session for this plan
      const sesioneDelPlan = sesionesPendientes.filter(s => s.plan_id === planId)
      if (sesioneDelPlan.length > 0) {
        setSesionId(sesioneDelPlan[0].id)
      } else {
        setSesionId("")
      }
    } else {
      setSesionId("")
    }
  }, [planId, sesionesPendientes])

  const loadPacientes = async () => {
    setLoadingPacientes(true)
    const result = await fetchPacientes()
    if (result.success) {
      setPacientes(result.data || [])
    }
    setLoadingPacientes(false)
  }

  const loadProfesionales = async () => {
    setLoadingProfesionales(true)
    const result = await fetchProfesionales()
    if (result.success) {
      setProfesionales(result.data || [])
    }
    setLoadingProfesionales(false)
  }

  const loadPlanesPaciente = async (pacId: string) => {
    setLoadingPlanes(true)
    console.log('Cargando planes para paciente:', pacId)
    const result = await fetchPlanesPaciente(pacId)
    console.log('Resultado fetchPlanesPaciente:', result)
    if (result.success) {
      const todosLosPlanes = result.data || []
      console.log('Todos los planes del paciente:', todosLosPlanes)
      
      // Mostrar planes que no estén completados/cancelados y tengan sesiones disponibles
      const planesDisponibles = todosLosPlanes.filter(p => {
        const estadoLower = (p.estado || '').toLowerCase()
        const esActivo = p.activo !== false
        const noFinalizado = !['completado', 'finalizado', 'cancelado'].includes(estadoLower)
        const tieneSesionesDisponibles = (p.sesiones_completadas || 0) < (p.sesiones_plan || 0)
        
        console.log(`Plan ${p.id}: activo=${esActivo}, estado=${p.estado}, sesiones=${p.sesiones_completadas}/${p.sesiones_plan}, disponible=${tieneSesionesDisponibles}`)
        
        return esActivo && noFinalizado && tieneSesionesDisponibles
      })
      
      console.log('Planes disponibles para agendar:', planesDisponibles)
      setPlanes(planesDisponibles)
    }
    setLoadingPlanes(false)
  }

  const loadSesionesPendientes = async (pacId: string) => {
    setLoadingSesiones(true)
    const result = await obtenerSesionesPendientesPaciente(pacId)
    if (result.success) {
      setSesionesPendientes(result.data || [])
    }
    setLoadingSesiones(false)
  }

  // Calcular hora fin basada en duración
  const calcularHoraFin = () => {
    const [horas, minutos] = horaInicio.split(":").map(Number)
    const totalMinutos = horas * 60 + minutos + Number(duracionMinutos)
    const horaFin = Math.floor(totalMinutos / 60)
    const minutoFin = totalMinutos % 60
    return `${String(horaFin).padStart(2, "0")}:${String(minutoFin).padStart(2, "0")}`
  }

  // Verificar disponibilidad
  const verificarDisponibilidad = async () => {
    if (!profesionalId || !fecha || !horaInicio) {
      toast({
        title: "Campos requeridos",
        description: "Completa profesional, fecha y hora de inicio",
        variant: "destructive"
      })
      return
    }

    setValidating(true)
    setConflictos([])
    setDisponibilidadVerificada(false)

    const inicioISO = `${fecha}T${horaInicio}:00`
    const finISO = `${fecha}T${calcularHoraFin()}:00`

    const result = await checkDisponibilidad(profesionalId, inicioISO, finISO)

    if (result.success) {
      if (result.disponible) {
        setDisponibilidadVerificada(true)
        toast({
          title: "✅ Horario disponible",
          description: "Puedes crear la cita en este horario"
        })
      } else {
        setConflictos(result.conflictos || [])
        toast({
          title: "⚠️ Horario no disponible",
          description: `Hay ${result.conflictos?.length || 0} conflicto(s)`,
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "Error",
        description: result.message || "Error al verificar disponibilidad",
        variant: "destructive"
      })
    }

    setValidating(false)
  }

  // Crear cita (y asignar a sesión si corresponde)
  const handleSubmit = async () => {
    if (!disponibilidadVerificada) {
      toast({
        title: "Verifica disponibilidad",
        description: "Primero debes verificar que el horario esté disponible",
        variant: "destructive"
      })
      return
    }

    if (!pacienteId || !profesionalId) {
      toast({
        title: "Campos requeridos",
        description: "Selecciona paciente y profesional",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Obtener el plan seleccionado para generar título
      const planSeleccionado = planes.find(p => p.id === planId)
      
      // Generar título automático
      let tituloFinal = titulo
      if (!tituloFinal && planSeleccionado) {
        const sesionesDelPlan = sesionesPendientes.filter(s => s.plan_id === planId)
        const numeroSesion = (planSeleccionado.sesiones_completadas || 0) + 1
        tituloFinal = `Sesión ${numeroSesion} de ${planSeleccionado.sesiones_plan}`
      } else if (!tituloFinal) {
        tituloFinal = 'Cita médica'
      }

      // 1. Crear la cita
      const payload: CrearCitaPayload = {
        paciente_id: pacienteId,
        profesional_id: profesionalId,
        inicio: `${fecha}T${horaInicio}:00`,
        fin: `${fecha}T${calcularHoraFin()}:00`,
        titulo: tituloFinal,
        notas: notas || undefined
      }

      const resultCita = await crearCita(payload)

      if (!resultCita.success || !resultCita.data) {
        throw new Error(resultCita.error || "No se pudo crear la cita")
      }

      const citaCreada = resultCita.data
      let sesionAsignada = false
      let mensajeExtra = ""

      // 2. Si hay un plan seleccionado, asignar la cita a una sesión
      if (planId) {
        let sesionParaAsignar = sesionId
        console.log('Plan seleccionado:', planId)
        console.log('Sesión pendiente disponible:', sesionParaAsignar)

        // Si no hay sesión pendiente seleccionada, intentar crear una
        if (!sesionParaAsignar) {
          console.log('No hay sesión pendiente, generando una nueva...')
          // Generar una sesión pendiente
          const resultGenerar = await generarSesionesPendientes(planId, 1)
          console.log('Resultado generar sesión:', resultGenerar)
          if (resultGenerar.success && resultGenerar.data && resultGenerar.data.length > 0) {
            sesionParaAsignar = resultGenerar.data[0].id
            console.log('Sesión generada:', sesionParaAsignar)
          } else {
            console.error('Error al generar sesión:', resultGenerar.error)
          }
        }

        // Asignar la cita a la sesión
        if (sesionParaAsignar) {
          console.log('Asignando cita', citaCreada.id, 'a sesión', sesionParaAsignar)
          const resultAsignar = await asignarCitaASesion(sesionParaAsignar, citaCreada.id)
          console.log('Resultado asignar:', resultAsignar)
          if (resultAsignar.success) {
            sesionAsignada = true
            mensajeExtra = " y sesión asignada al plan"
          } else {
            console.warn("No se pudo asignar la sesión:", resultAsignar.error)
            mensajeExtra = " (la sesión no pudo asignarse automáticamente)"
          }
        }
      }

      toast({
        title: "✅ Cita creada" + mensajeExtra,
        description: planId && sesionAsignada
          ? `La cita se ha vinculado al plan de tratamiento`
          : "La cita se ha creado exitosamente"
      })
      
      onSuccess?.()
      handleClose()

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la cita",
        variant: "destructive"
      })
    }

    setLoading(false)
  }

  // Cerrar y resetear form
  const handleClose = () => {
    setPacienteId(pacienteIdProp || "")
    setProfesionalId(profesionalIdProp || "")
    setPlanId(planIdProp || "")
    setSesionId("")
    setFecha(format(new Date(), "yyyy-MM-dd"))
    setHoraInicio("09:00")
    setDuracionMinutos("60")
    setTitulo("")
    setNotas("")
    setDisponibilidadVerificada(false)
    setConflictos([])
    onClose()
  }

  // Reset disponibilidad cuando cambian inputs clave
  useEffect(() => {
    setDisponibilidadVerificada(false)
    setConflictos([])
  }, [profesionalId, fecha, horaInicio, duracionMinutos])

  // Sesiones pendientes filtradas por plan seleccionado
  const sesionesFiltradas = planId 
    ? sesionesPendientes.filter(s => s.plan_id === planId)
    : []

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-[#056CF2]" />
            Nueva Cita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Paciente */}
          <div className="space-y-2">
            <Label htmlFor="paciente">Paciente *</Label>
            {loadingPacientes ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando pacientes...
              </div>
            ) : (
              <Select 
                value={pacienteId} 
                onValueChange={setPacienteId}
                disabled={!!pacienteIdProp}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombres} {p.apellidos} {p.documento ? `(${p.documento})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Profesional */}
          <div className="space-y-2">
            <Label htmlFor="profesional">Profesional *</Label>
            {loadingProfesionales ? (
              <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando profesionales...
              </div>
            ) : (
              <Select 
                value={profesionalId} 
                onValueChange={setProfesionalId}
                disabled={!!profesionalIdProp}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un profesional" />
                </SelectTrigger>
                <SelectContent>
                  {profesionales.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nombre} {p.apellido || ''} {p.especialidad ? `- ${p.especialidad}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Plan de Tratamiento (opcional) */}
          {pacienteId && (
            <div className="space-y-2">
              <Label htmlFor="plan" className="flex items-center gap-2">
                <Target className="h-4 w-4 text-[#D466F2]" />
                Plan de Tratamiento
              </Label>
              {loadingPlanes ? (
                <div className="flex items-center gap-2 h-10 px-3 border rounded-md text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando planes...
                </div>
              ) : planes.length > 0 ? (
                <>
                  <Select 
                    value={planId || "none"} 
                    onValueChange={(val) => setPlanId(val === "none" ? "" : val)}
                    disabled={!!planIdProp}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un plan (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin plan asociado</SelectItem>
                      {planes.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          <div className="flex items-center gap-2">
                            <span>{plan.objetivo?.substring(0, 40) || 'Plan de tratamiento'}</span>
                            <Badge variant="outline" className="text-xs">
                              {plan.sesiones_completadas}/{plan.sesiones_plan}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Info de sesiones pendientes */}
                  {planId && (
                    <div className="bg-[#F5E6FF] border border-[#D466F2]/30 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-[#9333EA]">
                        <CheckCircle2 className="h-4 w-4" />
                        <span className="font-medium">
                          {sesionesFiltradas.length > 0 
                            ? `${sesionesFiltradas.length} sesión(es) pendiente(s) disponible(s)`
                            : "Se creará una nueva sesión para este plan"
                          }
                        </span>
                      </div>
                      {sesionesFiltradas.length > 0 && (
                        <p className="text-xs text-gray-600 pl-6">
                          La cita se asignará automáticamente a una sesión pendiente del plan.
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-md p-3">
                  <Info className="h-4 w-4" />
                  El paciente no tiene planes de tratamiento activos.
                </div>
              )}
            </div>
          )}

          {/* Fecha y hora */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha *</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hora">Hora de inicio *</Label>
              <Input
                id="hora"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
              />
            </div>
          </div>

          {/* Duración */}
          <div className="space-y-2">
            <Label htmlFor="duracion">Duración (minutos) *</Label>
            <Select value={duracionMinutos} onValueChange={setDuracionMinutos}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="45">45 minutos</SelectItem>
                <SelectItem value="60">60 minutos</SelectItem>
                <SelectItem value="90">90 minutos</SelectItem>
                <SelectItem value="120">120 minutos</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Hora fin: {calcularHoraFin()}
            </p>
          </div>

          {/* Verificar disponibilidad */}
          <div className="bg-[#EBF5FF] border border-[#4BA4F2] rounded-lg p-4">
            <Button
              onClick={verificarDisponibilidad}
              disabled={validating || !profesionalId || !fecha || !horaInicio}
              className="w-full bg-[#056CF2] hover:bg-[#0558C9]"
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar Disponibilidad"
              )}
            </Button>
            
            {disponibilidadVerificada && (
              <div className="mt-3 flex items-center gap-2 text-sm text-[#0AA640]">
                <CheckCircle2 className="h-4 w-4" />
                Horario disponible
              </div>
            )}

            {conflictos.length > 0 && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {conflictos.length} conflicto(s) encontrado(s)
                </div>
                {conflictos.map((c, i) => (
                  <div key={i} className="text-xs text-gray-600 pl-6">
                    • {c.titulo || "Cita"}: {format(new Date(c.inicio), "HH:mm")} - {format(new Date(c.fin), "HH:mm")}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="titulo">Título (opcional)</Label>
            <Input
              id="titulo"
              placeholder={planId ? "Se generará automáticamente" : "ej: Consulta de seguimiento"}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
            {planId && !titulo && (
              <p className="text-xs text-gray-500">
                Se generará: "Sesión X de Y"
              </p>
            )}
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              placeholder="Observaciones adicionales..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !disponibilidadVerificada}
            className="bg-[#0AA640] hover:bg-[#098A36]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {planId ? "Crear Cita y Sesión" : "Crear Cita"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

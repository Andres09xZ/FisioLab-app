"use client"

import { useState, useEffect } from "react"
import { format, isAfter, isBefore, addMinutes, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  Edit3,
  AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchCalendario, CalendarioEvent, completarCita, cancelarCita, moverCita } from "@/lib/api/citas"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function AgendaDelDia() {
  const { toast } = useToast()
  const [citas, setCitas] = useState<CalendarioEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todas' | 'pendientes' | 'completadas' | 'canceladas'>('todas')
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // Modales
  const [showReprogramar, setShowReprogramar] = useState(false)
  const [showCancelar, setShowCancelar] = useState(false)
  const [showCompletar, setShowCompletar] = useState(false)
  const [citaSeleccionada, setCitaSeleccionada] = useState<CalendarioEvent | null>(null)
  
  // Estados de formularios
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")
  const [motivoCancelacion, setMotivoCancelacion] = useState("")
  const [notasCompletacion, setNotasCompletacion] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchCitasDelDia()
    
    // Actualizar el tiempo cada minuto
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    
    // Escuchar evento personalizado para recargar citas
    const handleReloadCitas = () => {
      fetchCitasDelDia()
    }
    window.addEventListener('reloadAgenda', handleReloadCitas)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('reloadAgenda', handleReloadCitas)
    }
  }, [])

  const fetchCitasDelDia = async () => {
    setLoading(true)
    const hoy = format(new Date(), 'yyyy-MM-dd')
    
    console.log('📅 Cargando citas para:', hoy)
    
    // Intentar con /api/agenda en lugar de /api/citas/calendario
    try {
      const url = `http://localhost:3001/api/agenda?fecha=${hoy}&vista=dia`
      console.log('🔗 Intentando con /api/agenda:', url)
      
      const res = await fetch(url)
      const json = await res.json()
      
      console.log('📡 Respuesta de /api/agenda:', json)
      
      if (json.success && json.data?.eventos) {
        const citasDelBackend = json.data.eventos.map((evento: any) => ({
          id: evento.id,
          title: evento.title,
          start: evento.start,
          end: evento.end,
          estado: evento.extendedProps?.estado || 'programada',
          paciente_id: evento.extendedProps?.paciente_id,
          profesional_id: evento.extendedProps?.profesional_id,
          notas: evento.extendedProps?.notas,
          paciente_nombre: evento.extendedProps?.paciente_nombre,
          paciente_telefono: evento.extendedProps?.paciente_telefono,
          paciente_email: evento.extendedProps?.paciente_email,
          profesional_nombre: evento.extendedProps?.profesional_nombre,
          recurso_nombre: evento.extendedProps?.recurso_nombre,
        }))
        
        const citasOrdenadas = citasDelBackend.sort((a: any, b: any) => 
          new Date(a.start).getTime() - new Date(b.start).getTime()
        )
        
        console.log('✅ Citas desde /api/agenda:', citasOrdenadas)
        setCitas(citasOrdenadas)
        setLoading(false)
        return
      }
    } catch (error) {
      console.warn('⚠️ /api/agenda falló, intentando con /api/citas/calendario')
    }
    
    // Fallback al endpoint original
    const result = await fetchCalendario(hoy, hoy)
    
    console.log('📊 Resultado de fetchCalendario:', {
      success: result.success,
      totalCitas: result.data?.length || 0,
      citas: result.data
    })
    
    if (result.success) {
      // Ordenar por hora de inicio
      const citasOrdenadas = (result.data || []).sort((a, b) => 
        new Date(a.start).getTime() - new Date(b.start).getTime()
      )
      
      console.log('✅ Citas ordenadas:', citasOrdenadas)
      setCitas(citasOrdenadas)
    } else {
      console.error('❌ Error al cargar citas:', result.error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las citas del día",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const getEstadoCita = (cita: CalendarioEvent) => {
    const inicio = new Date(cita.start)
    const fin = new Date(cita.end)
    const ahora = currentTime

    if (cita.estado === 'completada') return 'completada'
    if (cita.estado === 'cancelada') return 'cancelada'
    
    if (isAfter(ahora, fin)) return 'vencida'
    if (isAfter(ahora, inicio) && isBefore(ahora, fin)) return 'en_curso'
    
    const minutosParaInicio = differenceInMinutes(inicio, ahora)
    if (minutosParaInicio <= 15 && minutosParaInicio > 0) return 'proxima'
    
    return 'pendiente'
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'en_curso':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'proxima':
        return 'bg-orange-100 text-orange-700 border-orange-300'
      case 'completada':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'cancelada':
        return 'bg-red-100 text-red-700 border-red-300'
      case 'vencida':
        return 'bg-gray-100 text-gray-700 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'en_curso': return '🟢 En Curso'
      case 'proxima': return '🟠 Próxima (< 15 min)'
      case 'completada': return '✅ Completada'
      case 'cancelada': return '❌ Cancelada'
      case 'vencida': return '⏰ No realizada'
      default: return '📅 Programada'
    }
  }

  const handleCompletar = async () => {
    if (!citaSeleccionada) return
    
    setActionLoading(true)
    const result = await completarCita(citaSeleccionada.id, notasCompletacion)
    
    if (result.success) {
      toast({
        title: "✅ Cita completada",
        description: "La cita se ha marcado como completada"
      })
      setShowCompletar(false)
      setNotasCompletacion("")
      fetchCitasDelDia()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo completar la cita",
        variant: "destructive"
      })
    }
    setActionLoading(false)
  }

  const handleCancelar = async () => {
    if (!citaSeleccionada) return
    
    setActionLoading(true)
    const result = await cancelarCita(citaSeleccionada.id, motivoCancelacion)
    
    if (result.success) {
      toast({
        title: "Cita cancelada",
        description: "La cita se ha cancelado correctamente"
      })
      setShowCancelar(false)
      setMotivoCancelacion("")
      fetchCitasDelDia()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo cancelar la cita",
        variant: "destructive"
      })
    }
    setActionLoading(false)
  }

  const handleReprogramar = async () => {
    if (!citaSeleccionada) return
    
    if (!nuevaFecha || !nuevaHora) {
      toast({
        title: "Error",
        description: "Debes seleccionar fecha y hora",
        variant: "destructive"
      })
      return
    }
    
    setActionLoading(true)
    
    // Calcular duración de la cita original
    const inicioOriginal = new Date(citaSeleccionada.start)
    const finOriginal = new Date(citaSeleccionada.end)
    const duracionMinutos = (finOriginal.getTime() - inicioOriginal.getTime()) / (1000 * 60)
    
    // Crear nuevas fechas
    const nuevoInicio = `${nuevaFecha}T${nuevaHora}:00`
    const nuevoFin = new Date(new Date(nuevoInicio).getTime() + duracionMinutos * 60000).toISOString()
    
    const result = await moverCita(citaSeleccionada.id, nuevoInicio, nuevoFin)
    
    if (result.success) {
      toast({
        title: "✅ Cita reprogramada",
        description: "La cita se ha movido correctamente"
      })
      setShowReprogramar(false)
      setNuevaFecha("")
      setNuevaHora("")
      fetchCitasDelDia()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo reprogramar la cita",
        variant: "destructive"
      })
    }
    setActionLoading(false)
  }

  const citasFiltradas = citas.filter(cita => {
    if (filter === 'todas') return true
    const estado = getEstadoCita(cita)
    
    if (filter === 'pendientes') {
      return estado === 'pendiente' || estado === 'proxima' || estado === 'en_curso'
    }
    if (filter === 'completadas') return estado === 'completada'
    if (filter === 'canceladas') return estado === 'cancelada'
    
    return true
  })

  const stats = {
    total: citas.length,
    pendientes: citas.filter(c => {
      const estado = getEstadoCita(c)
      return estado === 'pendiente' || estado === 'proxima' || estado === 'en_curso'
    }).length,
    completadas: citas.filter(c => getEstadoCita(c) === 'completada').length,
    canceladas: citas.filter(c => getEstadoCita(c) === 'cancelada').length,
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#056CF2]" />
              Agenda de Hoy
            </CardTitle>
            <div className="text-sm text-gray-600">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </div>
          </div>
          
          {/* Filtros */}
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              variant={filter === 'todas' ? 'default' : 'outline'}
              onClick={() => setFilter('todas')}
              className={filter === 'todas' ? 'bg-[#056CF2]' : ''}
            >
              Todas ({stats.total})
            </Button>
            <Button
              size="sm"
              variant={filter === 'pendientes' ? 'default' : 'outline'}
              onClick={() => setFilter('pendientes')}
              className={filter === 'pendientes' ? 'bg-[#056CF2]' : ''}
            >
              Pendientes ({stats.pendientes})
            </Button>
            <Button
              size="sm"
              variant={filter === 'completadas' ? 'default' : 'outline'}
              onClick={() => setFilter('completadas')}
              className={filter === 'completadas' ? 'bg-[#056CF2]' : ''}
            >
              Completadas ({stats.completadas})
            </Button>
            <Button
              size="sm"
              variant={filter === 'canceladas' ? 'default' : 'outline'}
              onClick={() => setFilter('canceladas')}
              className={filter === 'canceladas' ? 'bg-[#056CF2]' : ''}
            >
              Canceladas ({stats.canceladas})
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#056CF2]"></div>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {filter === 'todas' ? 'No hay citas programadas para hoy' : `No hay citas ${filter}`}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Total de citas cargadas: {citas.length} | Filtradas: {citasFiltradas.length}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {citasFiltradas
                .sort((a, b) => {
                  // Ordenar por hora de inicio (más próxima primero)
                  const horaA = new Date(a.start).getTime()
                  const horaB = new Date(b.start).getTime()
                  const ahora = new Date().getTime()
                  
                  // Priorizar citas en curso o próximas
                  const estadoA = getEstadoCita(a)
                  const estadoB = getEstadoCita(b)
                  
                  if (estadoA === 'en_curso' && estadoB !== 'en_curso') return -1
                  if (estadoB === 'en_curso' && estadoA !== 'en_curso') return 1
                  if (estadoA === 'proxima' && estadoB !== 'proxima' && estadoB !== 'en_curso') return -1
                  if (estadoB === 'proxima' && estadoA !== 'proxima' && estadoA !== 'en_curso') return 1
                  
                  // Luego por hora
                  return horaA - horaB
                })
                .map((cita) => {
                const estadoCita = getEstadoCita(cita)
                const iniciales = cita.paciente_nombre
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase() || '?'
                
                return (
                  <div
                    key={cita.id}
                    className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                      estadoCita === 'en_curso' ? 'border-green-500 border-2' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#056CF2] text-white">
                          {iniciales}
                        </AvatarFallback>
                      </Avatar>
                      
                      {/* Información principal */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {cita.paciente_nombre || 'Paciente sin nombre'}
                            </h4>
                            <p className="text-sm text-gray-600">{cita.title}</p>
                          </div>
                          
                          <Badge className={`${getEstadoColor(estadoCita)} text-xs`}>
                            {getEstadoTexto(estadoCita)}
                          </Badge>
                        </div>
                        
                        {/* Horario */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {format(new Date(cita.start), "HH:mm")} - {format(new Date(cita.end), "HH:mm")}
                            </span>
                          </div>
                          
                          {cita.profesional_nombre && (
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{cita.profesional_nombre}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Acciones rápidas */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Botón completar - Solo cuando está en curso o ya terminó (vencida) */}
                          {(estadoCita === 'en_curso' || estadoCita === 'vencida') && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setCitaSeleccionada(cita)
                                setShowCompletar(true)
                              }}
                              className="bg-green-600 hover:bg-green-700 text-xs"
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completar
                            </Button>
                          )}
                          
                          {/* Botón modificar fecha */}
                          {estadoCita !== 'completada' && estadoCita !== 'cancelada' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCitaSeleccionada(cita)
                                setNuevaFecha(format(new Date(cita.start), 'yyyy-MM-dd'))
                                setNuevaHora(format(new Date(cita.start), 'HH:mm'))
                                setShowReprogramar(true)
                              }}
                              className="text-xs"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Modificar
                            </Button>
                          )}
                          
                          {/* Botón cancelar */}
                          {estadoCita !== 'completada' && estadoCita !== 'cancelada' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setCitaSeleccionada(cita)
                                setShowCancelar(true)
                              }}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Cancelar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Completar */}
      <Dialog open={showCompletar} onOpenChange={setShowCompletar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Completar Cita
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-4">
                ¿Confirmas que la cita con <strong>{citaSeleccionada?.paciente_nombre}</strong> se ha completado?
              </p>
              
              <Label htmlFor="notas">Notas de la sesión (opcional)</Label>
              <Textarea
                id="notas"
                placeholder="Describe cómo fue la sesión, progreso del paciente..."
                value={notasCompletacion}
                onChange={(e) => setNotasCompletacion(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompletar(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCompletar}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Completando..." : "Completar Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Cancelar */}
      <Dialog open={showCancelar} onOpenChange={setShowCancelar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Cancelar Cita
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  ¿Estás seguro de cancelar la cita con <strong>{citaSeleccionada?.paciente_nombre}</strong>?
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="motivo">Motivo de cancelación (opcional)</Label>
              <Textarea
                id="motivo"
                placeholder="Indica el motivo de la cancelación..."
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelar(false)}>
              No, mantener cita
            </Button>
            <Button
              onClick={handleCancelar}
              disabled={actionLoading}
              variant="destructive"
            >
              {actionLoading ? "Cancelando..." : "Sí, Cancelar Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Reprogramar */}
      <Dialog open={showReprogramar} onOpenChange={setShowReprogramar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-[#056CF2]" />
              Reprogramar Cita
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reprogramar cita de <strong>{citaSeleccionada?.paciente_nombre}</strong>
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fecha">Nueva Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="hora">Nueva Hora</Label>
                <Input
                  id="hora"
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReprogramar(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReprogramar}
              disabled={actionLoading || !nuevaFecha || !nuevaHora}
              className="bg-[#056CF2] hover:bg-[#0558C9]"
            >
              {actionLoading ? "Reprogramando..." : "Reprogramar Cita"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

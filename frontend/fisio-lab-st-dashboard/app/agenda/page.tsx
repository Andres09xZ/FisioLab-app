"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Calendar, Plus, Filter, Clock, User, MapPin, Edit, X, Trash2, MoreVertical, ChevronDown, Search } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { fetchCalendario, CalendarioEvent, checkDisponibilidad, moverCita } from "@/lib/api/citas"
import { CitaModal } from "@/components/agenda/CitaModal"
import { EventPopup } from "@/components/agenda/EventPopup"
import { NewProfesionalModal } from "@/components/dashboard/new-profesional-modal"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// FullCalendar imports
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, EventDropArg, DateSelectArg } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es'

interface Cita {
  id: string
  paciente_id: string
  profesional_id: string
  recurso_id?: string
  inicio: string
  fin: string
  titulo?: string
  estado: string
  paciente_nombre?: string
  profesional_nombre?: string
  recurso_nombre?: string
}

export default function AgendaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [citas, setCitas] = useState<CalendarioEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCitaModal, setShowCitaModal] = useState(false)
  const [showProfesionalModal, setShowProfesionalModal] = useState(false)
  const [selectedEvento, setSelectedEvento] = useState<CalendarioEvent | null>(null)
  const [citaToDelete, setCitaToDelete] = useState<string | null>(null)
  const [citaToEdit, setCitaToEdit] = useState<CalendarioEvent | null>(null)
  
  // Filtro por paciente (Cédula/DNI)
  const [searchPaciente, setSearchPaciente] = useState("")
  const [pacientesFiltro, setPacientesFiltro] = useState<Array<{ id: string; nombres: string; apellidos: string; documento: string }>>([])
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null)
  const [selectedPacienteNombre, setSelectedPacienteNombre] = useState("")
  const [showPacienteDropdown, setShowPacienteDropdown] = useState(false)
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Guardar estado del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchCitas()
      fetchPacientesForFilter()
    }
  }, [router])

  const fetchPacientesForFilter = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/pacientes")
      const json = await res.json()
      if (json.success && json.data) {
        setPacientesFiltro(json.data)
      }
    } catch {
      // Non-critical
    }
  }

  const fetchCitas = async () => {
    setLoading(true)
    
    // Cargar citas para el mes actual (desde hoy - 30 días hasta hoy + 30 días)
    const desde = format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    const hasta = format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    
    const result = await fetchCalendario(desde, hasta)
    
    if (result.success) {
      setCitas(result.data || [])
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudieron cargar las citas",
        variant: "destructive"
      })
    }
    
    setLoading(false)
  }

  // Manejar click en un evento
  const handleEventClick = (clickInfo: EventClickArg) => {
    const evento = citas.find(c => c.id === clickInfo.event.id)
    if (evento) {
      setSelectedEvento(evento)
    }
  }

  // Manejar drag & drop de eventos
  const handleEventDrop = async (dropInfo: EventDropArg) => {
    const { event } = dropInfo
    const nuevoInicio = event.start
    const nuevoFin = event.end

    if (!nuevoInicio || !nuevoFin) {
      dropInfo.revert()
      return
    }

    // Verificar disponibilidad
    const disponibilidad = await checkDisponibilidad(
      event.extendedProps.profesional_id || "1",
      nuevoInicio.toISOString(),
      nuevoFin.toISOString(),
      event.id
    )

    if (!disponibilidad.success || !disponibilidad.disponible) {
      toast({
        title: "Conflicto de horario",
        description: disponibilidad.conflictos && disponibilidad.conflictos.length > 0
          ? `Hay ${disponibilidad.conflictos.length} conflicto(s) en ese horario`
          : "El horario no está disponible",
        variant: "destructive"
      })
      dropInfo.revert()
      return
    }

    // Mover la cita
    const result = await moverCita(
      event.id,
      nuevoInicio.toISOString(),
      nuevoFin.toISOString()
    )

    if (!result.success) {
      toast({
        title: "Error",
        description: result.error || "No se pudo mover la cita",
        variant: "destructive"
      })
      dropInfo.revert()
    } else {
      toast({
        title: "Cita actualizada",
        description: "La cita se movió exitosamente"
      })
      fetchCitas() // Recargar para sincronizar
    }
  }

  // Manejar selección de fecha (para crear nueva cita)
  const handleDateSelect = (selectInfo: DateSelectArg) => {
    setShowCitaModal(true)
    // Aquí podrías prellenar el modal con la fecha seleccionada
  }

  // Editar cita
  const handleEditCita = (cita: CalendarioEvent) => {
    setCitaToEdit(cita)
    setShowCitaModal(true)
  }

  // Cancelar cita (cambiar estado)
  const handleCancelarCita = async (citaId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/citas/${citaId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'cancelada' })
      })
      
      if (!response.ok) throw new Error('Error al cancelar la cita')
      
      toast({
        title: "Cita cancelada",
        description: "La cita ha sido cancelada exitosamente"
      })
      
      fetchCitas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cancelar la cita",
        variant: "destructive"
      })
    }
  }

  // Eliminar cita
  const handleEliminarCita = async () => {
    if (!citaToDelete) return
    
    try {
      const response = await fetch(`http://localhost:3001/api/citas/${citaToDelete}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Error al eliminar la cita')
      
      toast({
        title: "Cita eliminada",
        description: "La cita ha sido eliminada exitosamente"
      })
      
      setCitaToDelete(null)
      fetchCitas()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la cita",
        variant: "destructive"
      })
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "bg-emerald-50 text-emerald-600"
      case "pendiente":
        return "bg-yellow-100 text-yellow-700"
      case "cancelada":
        return "bg-red-100 text-red-700"
      case "completada":
        return "bg-cyan-50 text-cyan-600"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getEventColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "#0AA640"
      case "pendiente":
        return "#EAB308"
      case "cancelada":
        return "#EF4444"
      case "completada":
        return "#056CF2"
      default:
        return "#6B7280"
    }
  }

  const citasDeHoy = citas.filter(c => {
    if (!c.start) return false
    const citaDate = new Date(c.start)
    if (isNaN(citaDate.getTime())) return false
    return format(citaDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
  })

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar 
          user={user} 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
              <p className="text-gray-600 mt-1">
                Gestión de citas y calendario
              </p>
            </div>
            <div className="flex gap-3">
              {/* Split Button: Nueva Cita + Dropdown */}
              <div className="inline-flex rounded">
                <Button 
                  className="bg-cyan-600 hover:bg-cyan-700 rounded-r-none"
                  onClick={() => setShowCitaModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Cita
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700 rounded-l-none border-l border-white/20 px-2"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push("/pacientes/nuevo")}>
                      <User className="h-4 w-4 mr-2" />
                      Crear Paciente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowProfesionalModal(true)}>
                      <User className="h-4 w-4 mr-2" />
                      Crear Profesional
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Filtro por paciente - Búsqueda por Cédula/DNI */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar paciente por Cédula/DNI..."
                  value={searchPaciente}
                  onChange={(e) => {
                    setSearchPaciente(e.target.value)
                    setShowPacienteDropdown(true)
                    if (!e.target.value.trim()) {
                      setSelectedPacienteId(null)
                      setSelectedPacienteNombre("")
                    }
                  }}
                  onFocus={() => searchPaciente.trim() && setShowPacienteDropdown(true)}
                  className="pl-10 h-9 text-sm"
                />
                {showPacienteDropdown && searchPaciente.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                    {pacientesFiltro
                      .filter(p =>
                        p.documento.toLowerCase().includes(searchPaciente.toLowerCase()) ||
                        `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchPaciente.toLowerCase())
                      )
                      .slice(0, 8)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedPacienteId(p.id)
                            setSelectedPacienteNombre(`${p.nombres} ${p.apellidos}`)
                            setSearchPaciente(p.documento)
                            setShowPacienteDropdown(false)
                          }}
                          className="w-full flex items-center justify-between p-2.5 hover:bg-gray-50 text-left text-sm border-b border-gray-50 last:border-0"
                        >
                          <span className="font-medium text-gray-900">{p.nombres} {p.apellidos}</span>
                          <span className="text-xs text-gray-500 font-mono">{p.documento}</span>
                        </button>
                      ))}
                    {pacientesFiltro.filter(p =>
                      p.documento.toLowerCase().includes(searchPaciente.toLowerCase()) ||
                      `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchPaciente.toLowerCase())
                    ).length === 0 && (
                      <div className="p-3 text-center text-sm text-gray-500">Sin resultados</div>
                    )}
                  </div>
                )}
              </div>
              {selectedPacienteId && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <User className="h-3 w-3 mr-1" />
                    {selectedPacienteNombre}
                  </Badge>
                  <button
                    onClick={() => {
                      setSelectedPacienteId(null)
                      setSelectedPacienteNombre("")
                      setSearchPaciente("")
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Vista de Calendario con FullCalendar */}
          <div className="bg-white rounded">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
              </div>
            ) : (
              <div className="fullcalendar-wrapper">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    locale={esLocale}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    dayHeaderFormat={{ weekday: 'short' }}
                    allDaySlot={false}
                    editable={true}
                    droppable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={false}
                    fixedWeekCount={false}
                    weekends={true}
                    events={citas
                      .filter(cita => {
                        // Filtrar citas con fechas inválidas
                        if (!cita.start || !cita.end) return false
                        const startDate = new Date(cita.start)
                        const endDate = new Date(cita.end)
                        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return false
                        // Filtrar por paciente seleccionado
                        if (selectedPacienteId && cita.paciente_id !== selectedPacienteId) return false
                        return true
                      })
                      .map(cita => ({
                        id: cita.id,
                        title: cita.title || 'Cita programada',
                        start: cita.start,
                        end: cita.end,
                        backgroundColor: getEventColor(cita.estado),
                        borderColor: getEventColor(cita.estado),
                        extendedProps: {
                          estado: cita.estado,
                          paciente_id: cita.paciente_id,
                          profesional_id: cita.profesional_id,
                          notas: cita.notas,
                          // Datos del paciente
                          paciente_nombre: cita.paciente_nombre,
                          paciente_telefono: cita.paciente_telefono,
                          paciente_email: cita.paciente_email,
                          // Datos del profesional y recurso
                          profesional_nombre: cita.profesional_nombre,
                          recurso_nombre: cita.recurso_nombre
                        }
                      }))}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    select={handleDateSelect}
                    height="auto"
                    dayCellClassNames="min-h-[120px]"
                    eventContent={(eventInfo) => {
                      const { event } = eventInfo
                      const { extendedProps } = event
                      const start = event.start
                      const timeStr = start ? format(new Date(start), 'HH:mm', { locale: es }) : ''
                      
                      // Obtener iniciales del paciente
                      const getInitials = (nombre: string) => {
                        if (!nombre) return '?'
                        const parts = nombre.split(' ')
                        return parts.length > 1 
                          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
                          : nombre.substring(0, 2).toUpperCase()
                      }
                      
                      return (
                        <div className="w-full bg-white border border-gray-200 rounded transition-all p-3 cursor-pointer group">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-sm text-gray-900 truncate mb-1">
                                {event.title}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {timeStr && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {timeStr}
                                  </span>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button 
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                  }}
                                >
                                  <MoreVertical className="h-4 w-4 text-gray-400" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const citaCompleta = citas.find(c => c.id === event.id)
                                    if (citaCompleta) handleEditCita(citaCompleta)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar cita
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCancelarCita(event.id)
                                  }}
                                  className="cursor-pointer"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Cancelar cita
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCitaToDelete(event.id)
                                  }}
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Eliminar cita
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          
                          {extendedProps.paciente_nombre && (
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="h-6 w-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                                  style={{ backgroundColor: event.backgroundColor }}
                                >
                                  {getInitials(extendedProps.paciente_nombre)}
                                </div>
                                {extendedProps.profesional_nombre && (
                                  <div 
                                    className="h-6 w-6 rounded-full flex items-center justify-center bg-gray-300 text-white text-xs font-medium -ml-2 border-2 border-white"
                                  >
                                    {getInitials(extendedProps.profesional_nombre)}
                                  </div>
                                )}
                              </div>
                              <div 
                                className="h-2 rounded-full flex-1 mx-3 max-w-[60px]"
                                style={{ backgroundColor: `${event.backgroundColor}30` }}
                              >
                                <div 
                                  className="h-full rounded-full transition-all"
                                  style={{ 
                                    width: '60%',
                                    backgroundColor: event.backgroundColor 
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    }}
                    buttonText={{
                      today: 'Hoy',
                      month: 'Mes',
                      week: 'Semana',
                      day: 'Día'
                    }}
                  />
                </div>
              )}
          </div>

          {/* Leyenda de estados */}
          <Card className="mt-6 border-0">
            <CardContent className="py-4">
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-sm font-medium text-gray-700">Leyenda:</span>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#0AA640' }}></div>
                  <span className="text-sm text-gray-600">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-sm text-gray-600">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#056CF2' }}></div>
                  <span className="text-sm text-gray-600">Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-sm text-gray-600">Cancelada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Modales */}
      <NewProfesionalModal 
        open={showProfesionalModal}
        onOpenChange={setShowProfesionalModal}
      />

      <CitaModal 
        open={showCitaModal}
        onClose={() => {
          setShowCitaModal(false)
          setCitaToEdit(null)
        }}
        onSuccess={fetchCitas}
        citaToEdit={citaToEdit}
      />

      {selectedEvento && (
        <EventPopup
          open={!!selectedEvento}
          onClose={() => setSelectedEvento(null)}
          onSuccess={fetchCitas}
          evento={selectedEvento}
        />
      )}

      {/* AlertDialog para confirmar eliminación */}
      <AlertDialog open={!!citaToDelete} onOpenChange={(open) => !open && setCitaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La cita será eliminada permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCitaToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleEliminarCita}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

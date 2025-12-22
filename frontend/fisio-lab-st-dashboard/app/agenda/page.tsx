"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Filter, Clock, User, MapPin } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { fetchCalendario, CalendarioEvent, checkDisponibilidad, moverCita } from "@/lib/api/citas"
import { CitaModal } from "@/components/agenda/CitaModal"
import { EventPopup } from "@/components/agenda/EventPopup"
import { useToast } from "@/hooks/use-toast"

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
  const [selectedEvento, setSelectedEvento] = useState<CalendarioEvent | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchCitas()
    }
  }, [router])

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

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "bg-[#E6FFF5] text-[#0AA640]"
      case "pendiente":
        return "bg-yellow-100 text-yellow-700"
      case "cancelada":
        return "bg-red-100 text-red-700"
      case "completada":
        return "bg-[#EBF5FF] text-[#056CF2]"
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
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
              <p className="text-gray-600 mt-1">
                Gestión de citas y calendario
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <Button 
                className="bg-[#056CF2] hover:bg-[#0558C9]"
                onClick={() => setShowCitaModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>

          {/* Vista de Calendario con FullCalendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#056CF2]" />
                Calendario Interactivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#056CF2]"></div>
                </div>
              ) : (
                <div className="fullcalendar-wrapper">
                  <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    locale={esLocale}
                    headerToolbar={{
                      left: 'prev,next today',
                      center: 'title',
                      right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    slotMinTime="07:00:00"
                    slotMaxTime="20:00:00"
                    allDaySlot={false}
                    editable={true}
                    droppable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    events={citas
                      .filter(cita => {
                        // Filtrar citas con fechas inválidas
                        if (!cita.start || !cita.end) return false
                        const startDate = new Date(cita.start)
                        const endDate = new Date(cita.end)
                        return !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())
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
                          profesional_id: cita.profesional_id
                        }
                      }))}
                    eventClick={handleEventClick}
                    eventDrop={handleEventDrop}
                    select={handleDateSelect}
                    height="auto"
                    buttonText={{
                      today: 'Hoy',
                      month: 'Mes',
                      week: 'Semana',
                      day: 'Día'
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Leyenda de estados */}
          <Card className="mt-6">
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

        {/* Modales */}
        <CitaModal 
          open={showCitaModal}
          onClose={() => setShowCitaModal(false)}
          onSuccess={fetchCitas}
        />

        {selectedEvento && (
          <EventPopup
            open={!!selectedEvento}
            onClose={() => setSelectedEvento(null)}
            onSuccess={fetchCitas}
            evento={selectedEvento}
          />
        )}
      </div>
    </div>
  )
}

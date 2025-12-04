"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus, Filter, Clock, User, MapPin } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

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
  const [user, setUser] = useState<any>(null)
  const [citas, setCitas] = useState<Cita[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())

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
    try {
      const response = await fetch("http://localhost:3001/api/citas/calendario")
      const data = await response.json()
      
      if (data.success) {
        setCitas(data.data || [])
      }
    } catch (error) {
      console.error("Error al cargar citas:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "bg-emerald-100 text-emerald-700"
      case "pendiente":
        return "bg-yellow-100 text-yellow-700"
      case "cancelada":
        return "bg-red-100 text-red-700"
      case "completada":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

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
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cita
              </Button>
            </div>
          </div>

          {/* Vista de Calendario */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendario lateral */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-600" />
                  Calendario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {format(selectedDate, "d", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {format(selectedDate, "MMMM yyyy", { locale: es })}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total de citas hoy:</span>
                    <span className="font-semibold">{citas.length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de citas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">
                  Citas de Hoy - {format(selectedDate, "d 'de' MMMM", { locale: es })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                  </div>
                ) : citas.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No hay citas programadas</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citas.map((cita) => (
                      <div
                        key={cita.id}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {cita.titulo || "Cita"}
                              </h3>
                              <Badge className={getEstadoColor(cita.estado)}>
                                {cita.estado}
                              </Badge>
                            </div>
                            
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {format(new Date(cita.inicio), "HH:mm", { locale: es })} - 
                                {format(new Date(cita.fin), "HH:mm", { locale: es })}
                              </div>
                              {cita.paciente_nombre && (
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  {cita.paciente_nombre}
                                </div>
                              )}
                              {cita.recurso_nombre && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {cita.recurso_nombre}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                            <Button variant="outline" size="sm">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

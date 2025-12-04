"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ClipboardList, User, Calendar, FileText } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Sesion {
  id: string
  cita_id?: string
  paciente_id: string
  profesional_id: string
  fecha: string
  notas?: string
  estado: string
  paciente_nombre?: string
  profesional_nombre?: string
}

export default function SesionesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [sesiones, setSesiones] = useState<Sesion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      // fetchSesiones()
      setLoading(false)
    }
  }, [router])

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "completada":
        return "bg-emerald-100 text-emerald-700"
      case "en_progreso":
        return "bg-blue-100 text-blue-700"
      case "cancelada":
        return "bg-red-100 text-red-700"
      case "pendiente":
        return "bg-yellow-100 text-yellow-700"
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
              <h1 className="text-2xl font-bold text-gray-900">Sesiones</h1>
              <p className="text-gray-600 mt-1">
                Registro de sesiones y evaluaciones fisioterapéuticas
              </p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Sesión
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">8</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Esta Semana</p>
                    <p className="text-2xl font-bold text-gray-900">45</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <ClipboardList className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">156</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <User className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sesiones List */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </CardContent>
            </Card>
          ) : sesiones.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">No hay sesiones registradas</p>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Sesión
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Sesiones Recientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sesiones.map((sesion) => (
                    <div
                      key={sesion.id}
                      className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-gray-900">
                              {sesion.paciente_nombre || "Paciente"}
                            </h3>
                            <Badge className={getEstadoColor(sesion.estado)}>
                              {sesion.estado}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(sesion.fecha), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
                            </div>
                            {sesion.profesional_nombre && (
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {sesion.profesional_nombre}
                              </div>
                            )}
                            {sesion.notas && (
                              <p className="text-xs text-gray-500 mt-2">{sesion.notas}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Ver Detalles
                          </Button>
                          <Button variant="outline" size="sm" className="bg-blue-50 hover:bg-blue-100">
                            Evaluación
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}

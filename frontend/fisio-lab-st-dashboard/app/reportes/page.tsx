"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BarChart3, FileText, TrendingUp, Users, Download, Calendar } from "lucide-react"

export default function ReportesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleGenerarReporte = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (fechaDesde) params.append("desde", fechaDesde)
      if (fechaHasta) params.append("hasta", fechaHasta)
      
      const response = await fetch(`http://localhost:3001/api/reportes/ocupacion?${params}`)
      const data = await response.json()
      
      if (data.success) {
        console.log("Reporte de ocupación:", data.data)
      }
    } catch (error) {
      console.error("Error al generar reporte:", error)
    } finally {
      setLoading(false)
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
              <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
              <p className="text-gray-600 mt-1">
                Análisis y estadísticas de la clínica
              </p>
            </div>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-emerald-600" />
                Filtros de Fecha
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaDesde">Desde</Label>
                  <Input
                    id="fechaDesde"
                    type="datetime-local"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaHasta">Hasta</Label>
                  <Input
                    id="fechaHasta"
                    type="datetime-local"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleGenerarReporte}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    {loading ? "Generando..." : "Generar Reporte"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reportes Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Ocupación de Recursos */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-50 rounded-full">
                    <BarChart3 className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ocupación de Recursos</h3>
                    <p className="text-sm text-gray-600">Salas, camillas y equipos</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">78%</span>
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      +5% vs mes anterior
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ocupación de Profesionales */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <Users className="h-8 w-8 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Ocupación de Profesionales</h3>
                    <p className="text-sm text-gray-600">Agenda y disponibilidad</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">85%</span>
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      +8% vs mes anterior
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas Generales */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-50 rounded-full">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reporte Completo</h3>
                    <p className="text-sm text-gray-600">Métricas detalladas</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  Ver Reporte Completo
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Métricas Adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Citas por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Confirmadas</span>
                    <span className="font-semibold">145</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pendientes</span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completadas</span>
                    <span className="font-semibold">312</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Canceladas</span>
                    <span className="font-semibold">8</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pacientes Activos por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Nuevos este mes</span>
                    <span className="font-semibold text-emerald-600">28</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total activos</span>
                    <span className="font-semibold">156</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio sesiones/paciente</span>
                    <span className="font-semibold">3.2</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

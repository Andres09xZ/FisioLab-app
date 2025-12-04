"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DollarSign, FileText, Download, Plus, TrendingUp, CreditCard, Calendar } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Pago {
  id: string
  paciente_id: string
  concepto: string
  monto: number
  moneda: string
  fecha: string
  medio?: string
  paciente_nombre?: string
}

interface Certificado {
  id: string
  paciente_id: string
  tipo: string
  emitido_en: string
  paciente_nombre?: string
}

export default function FinanzasPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [certificados, setCertificados] = useState<Certificado[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleDownloadPDF = async (certificadoId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/certificados/${certificadoId}/pdf`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificado-${certificadoId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Error al descargar certificado:", error)
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
              <h1 className="text-2xl font-bold text-gray-900">Finanzas</h1>
              <p className="text-gray-600 mt-1">
                Gestión de pagos y certificados
              </p>
            </div>
          </div>

          {/* KPIs Financieros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ingresos Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">S/ 850</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-full">
                    <DollarSign className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Este Mes</p>
                    <p className="text-2xl font-bold text-gray-900">S/ 18,450</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">12</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <CreditCard className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Certificados Emitidos</p>
                    <p className="text-2xl font-bold text-gray-900">45</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-full">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs de Pagos y Certificados */}
          <Tabs defaultValue="pagos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="pagos">Pagos</TabsTrigger>
              <TabsTrigger value="certificados">Certificados</TabsTrigger>
            </TabsList>

            {/* Tab de Pagos */}
            <TabsContent value="pagos">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Registro de Pagos</CardTitle>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Pago
                  </Button>
                </CardHeader>
                <CardContent>
                  {pagos.length === 0 ? (
                    <div className="text-center py-12">
                      <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay pagos registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pagos.map((pago) => (
                        <div
                          key={pago.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {pago.paciente_nombre || "Paciente"}
                                </h3>
                                <Badge className="bg-emerald-100 text-emerald-700">
                                  {pago.moneda} {pago.monto}
                                </Badge>
                              </div>
                              
                              <div className="space-y-1 text-sm text-gray-600">
                                <p><strong>Concepto:</strong> {pago.concepto}</p>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(pago.fecha), "d 'de' MMMM, yyyy", { locale: es })}
                                </div>
                                {pago.medio && (
                                  <p className="text-xs">
                                    <strong>Medio:</strong> {pago.medio}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab de Certificados */}
            <TabsContent value="certificados">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Certificados Emitidos</CardTitle>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Certificado
                  </Button>
                </CardHeader>
                <CardContent>
                  {certificados.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No hay certificados emitidos</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {certificados.map((certificado) => (
                        <div
                          key={certificado.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-gray-900">
                                  {certificado.paciente_nombre || "Paciente"}
                                </h3>
                                <Badge variant="outline">
                                  {certificado.tipo}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                Emitido: {format(new Date(certificado.emitido_en), "d 'de' MMMM, yyyy", { locale: es })}
                              </div>
                            </div>
                            
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadPDF(certificado.id)}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar PDF
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

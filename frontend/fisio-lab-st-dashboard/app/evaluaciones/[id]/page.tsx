"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, FileText, Activity } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Evaluacion {
  id: string
  paciente_id: string
  nombre_paciente: string
  documento: string
  celular: string
  motivo_consulta: string
  historia_enfermedad_actual: string
  diagnostico_fisio: string
  hallazgos_clinicos: any
  eva_score: number
  observaciones: string
  version_numero: number
  es_activa: boolean
  motivo_cambio: string
  nombre_profesional: string
  fecha_creacion: string
  fecha_actualizacion: string
}

export default function EvaluacionDetallePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [evaluacion, setEvaluacion] = useState<Evaluacion | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchEvaluacion(token)
    }
  }, [params.id, router])

  const fetchEvaluacion = async (token: string) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/v2/evaluaciones/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar evaluación")

      const data = await response.json()
      if (data.success && data.data) {
        setEvaluacion(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la evaluación",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getEvaScoreBadge = (score: number) => {
    if (score <= 3) {
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-lg px-3 py-1">Leve ({score})</Badge>
    } else if (score <= 6) {
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-lg px-3 py-1">Moderado ({score})</Badge>
    } else {
      return <Badge className="bg-red-50 text-red-700 border-red-200 text-lg px-3 py-1">Severo ({score})</Badge>
    }
  }

  if (!user || loading) return null

  if (!evaluacion) {
    return <div className="p-8">Evaluación no encontrada</div>
  }

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => router.push("/evaluaciones")}
                className="mb-4 h-10 border-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Evaluaciones
              </Button>
              
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Evaluación Fisioterapéutica
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    Paciente: {evaluacion.nombre_paciente}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200 px-3 py-1">
                    Versión {evaluacion.version_numero}
                  </Badge>
                  {evaluacion.es_activa && (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Activa
                    </Badge>
                  )}
                  {evaluacion.es_activa && (
                    <Button
                      onClick={() => router.push(`/evaluaciones/${evaluacion.id}/editar`)}
                      className="h-10 bg-cyan-600 hover:bg-cyan-700 border border-cyan-600"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Información del Paciente */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Información del Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Nombre Completo</p>
                      <p className="text-sm text-slate-900 font-medium">{evaluacion.nombre_paciente}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Documento</p>
                      <p className="text-sm text-slate-900">{evaluacion.documento || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Celular</p>
                      <p className="text-sm text-slate-900">{evaluacion.celular || "N/A"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Motivo de Consulta */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Motivo de Consulta
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {evaluacion.motivo_consulta}
                  </p>
                </CardContent>
              </Card>

              {/* Historia de Enfermedad Actual */}
              {evaluacion.historia_enfermedad_actual && (
                <Card className="border border-slate-300 rounded">
                  <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Historia de Enfermedad Actual
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">
                      {evaluacion.historia_enfermedad_actual}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Evaluación Clínica */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Evaluación Clínica
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <p className="text-xs font-medium text-slate-500 mb-2">Diagnóstico Fisioterapéutico</p>
                    <p className="text-sm text-slate-900 font-medium">{evaluacion.diagnostico_fisio}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-2">Escala EVA</p>
                      {getEvaScoreBadge(evaluacion.eva_score)}
                    </div>
                  </div>

                  {evaluacion.hallazgos_clinicos && Object.keys(evaluacion.hallazgos_clinicos).length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-3">Hallazgos Clínicos</p>
                      <div className="space-y-3">
                        {evaluacion.hallazgos_clinicos.examen_fisico && (
                          <div>
                            <p className="text-xs font-medium text-slate-600 mb-1">Examen Físico</p>
                            <p className="text-sm text-slate-700">{evaluacion.hallazgos_clinicos.examen_fisico}</p>
                          </div>
                        )}
                        {evaluacion.hallazgos_clinicos.historia && (
                          <div>
                            <p className="text-xs font-medium text-slate-600 mb-1">Historia</p>
                            <p className="text-sm text-slate-700">{evaluacion.hallazgos_clinicos.historia}</p>
                          </div>
                        )}
                        {evaluacion.hallazgos_clinicos.antecedentes && Array.isArray(evaluacion.hallazgos_clinicos.antecedentes) && (
                          <div>
                            <p className="text-xs font-medium text-slate-600 mb-1">Antecedentes</p>
                            <div className="flex flex-wrap gap-2">
                              {evaluacion.hallazgos_clinicos.antecedentes.map((ant: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
                                  {ant}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {evaluacion.observaciones && (
                    <div className="pt-4 border-t border-slate-200">
                      <p className="text-xs font-medium text-slate-500 mb-2">Observaciones</p>
                      <p className="text-sm text-slate-700">{evaluacion.observaciones}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metadatos */}
              <Card className="border border-slate-300 rounded bg-slate-50">
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Profesional</p>
                      <p className="text-sm text-slate-700">{evaluacion.nombre_profesional || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Fecha de Creación</p>
                      <p className="text-sm text-slate-700">
                        {evaluacion.fecha_creacion 
                          ? format(new Date(evaluacion.fecha_creacion), "dd/MM/yyyy HH:mm", { locale: es })
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">Última Actualización</p>
                      <p className="text-sm text-slate-700">
                        {evaluacion.fecha_actualizacion 
                          ? format(new Date(evaluacion.fecha_actualizacion), "dd/MM/yyyy HH:mm", { locale: es })
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

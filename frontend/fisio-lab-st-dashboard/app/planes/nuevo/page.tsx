"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2, Plus, X, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Evaluacion {
  id: string
  paciente_id: string
  profesional_id: string
  nombre_paciente?: string
  motivo_consulta: string
  diagnostico_fisio: string
  version_numero: number
}

interface Profesional {
  id: string
  nombres: string
  apellidos: string
}

export default function NuevoPlanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [selectedEvaluacion, setSelectedEvaluacion] = useState<Evaluacion | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  const [formData, setFormData] = useState({
    evaluacion_id: "",
    profesional_id: "",
    objetivo_general: "",
    objetivos_especificos: [""],
    numero_sesiones: 12,
    frecuencia_semanal: 3,
    duracion_sesion: 60,
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
      fetchEvaluaciones(token)
      fetchProfesionales(token)
    }
  }, [router])

  // Pre-llenar desde evaluación si viene en query params
  useEffect(() => {
    const evaluacionId = searchParams.get("evaluacion_id")
    if (evaluacionId && evaluaciones.length > 0) {
      const evaluacion = evaluaciones.find(e => e.id === evaluacionId)
      if (evaluacion) {
        setSelectedEvaluacion(evaluacion)
        setFormData(prev => ({
          ...prev,
          evaluacion_id: evaluacion.id,
          profesional_id: evaluacion.profesional_id || prev.profesional_id,
          objetivo_general: `Mejorar condición relacionada con: ${evaluacion.diagnostico_fisio}`,
        }))
      }
    }
  }, [searchParams, evaluaciones])

  const fetchEvaluaciones = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/v2/evaluaciones", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Error al cargar evaluaciones")
      const data = await response.json()
      if (data.success && data.data) {
        // Filtrar solo evaluaciones activas
        setEvaluaciones(data.data.filter((e: Evaluacion) => true))
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const fetchProfesionales = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/profesionales", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Error al cargar profesionales")
      const data = await response.json()
      if (data.success && data.data) {
        setProfesionales(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const addObjetivo = () => {
    setFormData({
      ...formData,
      objetivos_especificos: [...formData.objetivos_especificos, ""],
    })
  }

  const removeObjetivo = (index: number) => {
    const newObjetivos = formData.objetivos_especificos.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      objetivos_especificos: newObjetivos.length > 0 ? newObjetivos : [""],
    })
  }

  const updateObjetivo = (index: number, value: string) => {
    const newObjetivos = [...formData.objetivos_especificos]
    newObjetivos[index] = value
    setFormData({
      ...formData,
      objetivos_especificos: newObjetivos,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.evaluacion_id || !formData.profesional_id || !formData.objetivo_general) {
      toast({
        title: "Campos requeridos",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      
      const payload = {
        evaluacion_id: formData.evaluacion_id,
        profesional_id: formData.profesional_id,
        objetivo_general: formData.objetivo_general,
        objetivos_especificos: formData.objetivos_especificos.filter(o => o.trim() !== ""),
        numero_sesiones: parseInt(formData.numero_sesiones.toString()),
        frecuencia_semanal: parseInt(formData.frecuencia_semanal.toString()),
        duracion_sesion: parseInt(formData.duracion_sesion.toString()),
      }

      const response = await fetch("http://localhost:3001/api/v2/planes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al crear plan")
      }

      toast({
        title: "¡Plan creado!",
        description: "El plan de tratamiento se guardó correctamente",
      })

      // Redirigir al detalle del plan recién creado
      if (data.data && data.data.id) {
        router.push(`/planes/${data.data.id}`)
      } else {
        router.push("/planes")
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el plan",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="mb-4 h-10 border-slate-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Nuevo Plan de Tratamiento
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Define los objetivos y características del plan terapéutico
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Evaluación Base */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    A. Evaluación Base
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {selectedEvaluacion && (
                    <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium text-cyan-900">Plan desde evaluación v{selectedEvaluacion.version_numero}</p>
                        <p className="text-cyan-700 text-xs mt-1">
                          Paciente: {selectedEvaluacion.nombre_paciente} | Diagnóstico: {selectedEvaluacion.diagnostico_fisio}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="evaluacion" className="text-sm font-medium text-slate-700">
                        Evaluación Asociada *
                      </Label>
                      <Select
                        value={formData.evaluacion_id}
                        onValueChange={(value) => {
                          const evaluacion = evaluaciones.find(e => e.id === value)
                          setSelectedEvaluacion(evaluacion || null)
                          setFormData({ ...formData, evaluacion_id: value })
                        }}
                        disabled={!!searchParams.get("evaluacion_id")}
                      >
                        <SelectTrigger id="evaluacion" className="h-10 border-slate-300 focus:border-cyan-600">
                          <SelectValue placeholder="Seleccionar evaluación" />
                        </SelectTrigger>
                        <SelectContent>
                          {evaluaciones.map((e) => (
                            <SelectItem key={e.id} value={e.id}>
                            {e.nombre_paciente} - v{e.version_numero} - {e.diagnostico_fisio.substring(0, 40)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {searchParams.get("evaluacion_id") && (
                        <p className="text-xs text-slate-500">Evaluación preseleccionada</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profesional" className="text-sm font-medium text-slate-700">
                        Profesional Responsable *
                      </Label>
                      <Select
                        value={formData.profesional_id}
                        onValueChange={(value) => setFormData({ ...formData, profesional_id: value })}
                      >
                        <SelectTrigger id="profesional" className="h-10 border-slate-300 focus:border-cyan-600">
                          <SelectValue placeholder="Seleccionar profesional" />
                        </SelectTrigger>
                        <SelectContent>
                          {profesionales.map((prof) => (
                            <SelectItem key={prof.id} value={prof.id}>
                              {prof.nombres} {prof.apellidos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Objetivos */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    B. Objetivos Terapéuticos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Objetivo General *</Label>
                    <Textarea
                      value={formData.objetivo_general}
                      onChange={(e) => setFormData({ ...formData, objetivo_general: e.target.value })}
                      placeholder="Ej: Recuperar rango de movimiento completo de hombro derecho y eliminar dolor..."
                      rows={3}
                      className="mt-2 border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium text-slate-700">Objetivos Específicos</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addObjetivo}
                        className="h-8 border-slate-300"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {formData.objetivos_especificos.map((objetivo, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={objetivo}
                            onChange={(e) => updateObjetivo(index, e.target.value)}
                            placeholder={`Objetivo específico ${index + 1}`}
                            className="h-10 border-slate-300 focus:border-cyan-600"
                          />
                          {formData.objetivos_especificos.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeObjetivo(index)}
                              className="h-10 border-slate-300 hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    C. Configuración del Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Número de Sesiones *</Label>
                      <Input
                        type="number"
                        min="1"
                        max="100"
                        value={formData.numero_sesiones}
                        onChange={(e) => setFormData({ ...formData, numero_sesiones: parseInt(e.target.value) || 1 })}
                        className="mt-2 h-10 border-slate-300 focus:border-cyan-600"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Frecuencia Semanal *</Label>
                      <Select
                        value={formData.frecuencia_semanal.toString()}
                        onValueChange={(value) => setFormData({ ...formData, frecuencia_semanal: parseInt(value) })}
                      >
                        <SelectTrigger className="mt-2 h-10 border-slate-300 focus:border-cyan-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x semana</SelectItem>
                          <SelectItem value="2">2x semana</SelectItem>
                          <SelectItem value="3">3x semana</SelectItem>
                          <SelectItem value="4">4x semana</SelectItem>
                          <SelectItem value="5">5x semana</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Duración por Sesión *</Label>
                      <Select
                        value={formData.duracion_sesion.toString()}
                        onValueChange={(value) => setFormData({ ...formData, duracion_sesion: parseInt(value) })}
                      >
                        <SelectTrigger className="mt-2 h-10 border-slate-300 focus:border-cyan-600">
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
                    </div>
                  </div>
                  
                  {/* Estimación */}
                  <div className="mt-6 p-4 bg-cyan-50 border border-cyan-200 rounded">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Duración estimada del tratamiento:</span>
                        <p className="font-semibold text-slate-900 mt-1">
                          {Math.ceil(formData.numero_sesiones / formData.frecuencia_semanal)} semanas
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-600">Total de horas de terapia:</span>
                        <p className="font-semibold text-slate-900 mt-1">
                          {(formData.numero_sesiones * formData.duracion_sesion) / 60} horas
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="h-10 border-slate-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving}
                  className="h-10 bg-cyan-600 hover:bg-cyan-700 border border-cyan-600"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Crear Plan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}

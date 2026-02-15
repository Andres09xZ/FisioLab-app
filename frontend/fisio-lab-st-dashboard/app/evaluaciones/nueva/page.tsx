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
import { ArrowLeft, Save, Loader2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  documento: string
}

export default function NuevaEvaluacionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  const [formData, setFormData] = useState({
    paciente_id: "",
    motivo_consulta: "",
    historia_enfermedad_actual: "",
    diagnostico_fisio: "",
    hallazgos_clinicos: "",
    eva_score: 5,
    antecedentes: "",
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
      fetchPacientes(token)
    }
  }, [router])

  // Pre-seleccionar paciente si viene en query params
  useEffect(() => {
    const pacienteId = searchParams.get("paciente_id")
    if (pacienteId && pacientes.length > 0) {
      const paciente = pacientes.find(p => p.id === pacienteId)
      if (paciente) {
        setSelectedPaciente(paciente)
        setFormData(prev => ({
          ...prev,
          paciente_id: paciente.id,
        }))
      }
    }
  }, [searchParams, pacientes])

  const fetchPacientes = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Error al cargar pacientes")
      const data = await response.json()
      if (data.success && data.data) {
        setPacientes(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones según backend
    const errores = []
    
    if (!formData.paciente_id) {
      errores.push("Selecciona un paciente")
    }
    
    if (!formData.motivo_consulta || formData.motivo_consulta.trim().length < 10) {
      errores.push("El motivo de consulta debe tener al menos 10 caracteres")
    }
    
    if (!formData.diagnostico_fisio || formData.diagnostico_fisio.trim().length < 10) {
      errores.push("El diagnóstico fisioterapéutico debe tener al menos 10 caracteres")
    }
    
    if (errores.length > 0) {
      toast({
        title: "Campos requeridos",
        description: errores.join(". "),
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      
      // Preparar hallazgos clínicos como objeto JSON
      const hallazgosObj: any = {}
      
      if (formData.historia_enfermedad_actual) {
        hallazgosObj.historia = formData.historia_enfermedad_actual
      }
      
      if (formData.hallazgos_clinicos) {
        hallazgosObj.examen_fisico = formData.hallazgos_clinicos
      }
      
      if (formData.antecedentes) {
        const antecedentesArray = formData.antecedentes.split(",").map(a => a.trim()).filter(a => a)
        if (antecedentesArray.length > 0) {
          hallazgosObj.antecedentes = antecedentesArray
        }
      }
      
      const payload = {
        paciente_id: formData.paciente_id,
        motivo_consulta: formData.motivo_consulta.trim(),
        historia_enfermedad_actual: formData.historia_enfermedad_actual.trim() || null,
        diagnostico_fisio: formData.diagnostico_fisio.trim(),
        hallazgos_clinicos: hallazgosObj,
        eva_score: parseInt(formData.eva_score.toString()),
        observaciones: null
      }

      console.log("📤 Payload enviado:", payload)

      const response = await fetch("http://localhost:3001/api/v2/evaluaciones", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        // Mostrar errores específicos del backend
        if (data.errors && Array.isArray(data.errors)) {
          const mensajes = data.errors.map((e: any) => e.message).join(". ")
          throw new Error(mensajes)
        }
        throw new Error(data.message || data.error || "Error al crear evaluación")
      }

      toast({
        title: "¡Evaluación creada!",
        description: "La evaluación se guardó correctamente",
      })

      router.push("/evaluaciones")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la evaluación",
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
                Nueva Evaluación Fisioterapéutica
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Completa la información de la evaluación inicial del paciente
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Datos del Paciente */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    A. Datos del Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {selectedPaciente && (
                    <div className="mb-4 p-3 bg-cyan-50 border border-cyan-200 rounded flex items-start gap-2">
                      <div className="text-sm">
                        <p className="font-medium text-cyan-900">Paciente pre-seleccionado</p>
                        <p className="text-cyan-700 text-xs mt-1">
                          {selectedPaciente.nombres} {selectedPaciente.apellidos} - {selectedPaciente.documento}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="paciente" className="text-sm font-medium text-slate-700">
                        Paciente *
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push("/pacientes/nuevo")}
                        className="h-8 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                      >
                        <Plus className="h-3 w-3" />
                        Nuevo Paciente
                      </Button>
                    </div>
                    <Select
                      value={formData.paciente_id}
                      onValueChange={(value) => {
                        const paciente = pacientes.find(p => p.id === value)
                        setSelectedPaciente(paciente || null)
                        setFormData({ ...formData, paciente_id: value })
                      }}
                      disabled={!!searchParams.get("paciente_id")}
                    >
                      <SelectTrigger id="paciente" className="h-10 border-slate-300 focus:border-cyan-600">
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientes.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500">
                            No hay pacientes registrados.
                            <br />
                            <span className="text-emerald-600 font-medium">Crea uno nuevo usando el botón de arriba.</span>
                          </div>
                        ) : (
                          pacientes.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.nombres} {p.apellidos} - {p.documento}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {searchParams.get("paciente_id") && (
                      <p className="text-xs text-slate-500">Paciente preseleccionado desde el perfil</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      El profesional será registrado automáticamente desde tu sesión
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Motivo de Consulta */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    B. Motivo de Consulta *
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    id="motivo"
                    value={formData.motivo_consulta}
                    onChange={(e) => setFormData({ ...formData, motivo_consulta: e.target.value })}
                    placeholder="Describa el motivo principal de la consulta (mínimo 10 caracteres)..."
                    rows={3}
                    className="border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.motivo_consulta.length}/10 caracteres mínimos
                  </p>
                </CardContent>
              </Card>

              {/* Historia de Enfermedad Actual */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    C. Historia de Enfermedad Actual
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={formData.historia_enfermedad_actual}
                    onChange={(e) => setFormData({ ...formData, historia_enfermedad_actual: e.target.value })}
                    placeholder="Cronología, características, factores agravantes y de alivio..."
                    rows={4}
                    className="border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                  />
                </CardContent>
              </Card>

              {/* Evaluación Clínica */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    D. Evaluación Clínica
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Diagnóstico Fisioterapéutico *</Label>
                    <Textarea
                      value={formData.diagnostico_fisio}
                      onChange={(e) => setFormData({ ...formData, diagnostico_fisio: e.target.value })}
                      placeholder="Diagnóstico fisioterapéutico (mínimo 10 caracteres)..."
                      rows={3}
                      className="mt-2 border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {formData.diagnostico_fisio.length}/10 caracteres mínimos
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-700">Hallazgos Clínicos</Label>
                    <Textarea
                      value={formData.hallazgos_clinicos}
                      onChange={(e) => setFormData({ ...formData, hallazgos_clinicos: e.target.value })}
                      placeholder="Inspección, palpación, rangos de movimiento, fuerza muscular..."
                      rows={4}
                      className="mt-2 border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Escala EVA (0-10) *</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.eva_score}
                        onChange={(e) => setFormData({ ...formData, eva_score: parseInt(e.target.value) || 0 })}
                        className="mt-2 h-10 border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                      />
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Antecedentes</Label>
                      <Input
                        value={formData.antecedentes}
                        onChange={(e) => setFormData({ ...formData, antecedentes: e.target.value })}
                        placeholder="Separados por coma"
                        className="mt-2 h-10 border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-600/20"
                      />
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
                      Guardar Evaluación
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

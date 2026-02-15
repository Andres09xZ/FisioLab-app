"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

const ANTECEDENTES_PERSONALES = [
  { id: "cancer", label: "Cáncer" },
  { id: "diabetes", label: "Diabetes" },
  { id: "insuficiencia_renal", label: "Insuficiencia Renal" },
  { id: "cardiopatias", label: "Cardiopatías" },
  { id: "endocarditis", label: "Endocarditis" },
  { id: "hipertension", label: "Hipertensión" },
  { id: "hemopatias", label: "Hemopatías" },
  { id: "tuberculosis", label: "Tuberculosis" },
  { id: "bronquitis", label: "Bronquitis" },
  { id: "trombosis", label: "Trombosis" },
  { id: "hemorragias_activas", label: "Hemorragias Activas" },
  { id: "implantes_metalicos", label: "Implantes Metálicos" },
  { id: "marcapasos", label: "Marcapasos" },
  { id: "dispositivos_cardiacos", label: "Dispositivos Cardiacos" },
  { id: "heridas", label: "Heridas" },
  { id: "enfermedad_piel", label: "Enfermedad de la piel" },
  { id: "epilepsias", label: "Epilepsias" },
  { id: "alteracion_sensibilidad", label: "Alterac. de la sensibilidad" },
]

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  documento: string
  edad: number
  sexo?: string
}

export default function NuevaHCFisioterapeuticaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [isLoadingPacientes, setIsLoadingPacientes] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [searchDoc, setSearchDoc] = useState("")
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Antecedentes Personales del Paciente
  const [antecedentes, setAntecedentes] = useState<Record<string, boolean>>({})
  const [antecedentesOtros, setAntecedentesOtros] = useState("")

  const [formData, setFormData] = useState({
    motivo_consulta: "",
    dolor_localizacion: "",
    dolor_intensidad_eva: "",
    dolor_tipo: "",
    rango_movimiento: "",
    fuerza_muscular: "",
    evaluacion_postural: "",
    evaluacion_marcha: "",
    pruebas_especiales: "",
    diagnostico_fisioterapeutico: "",
    objetivos_corto_plazo: "",
    objetivos_largo_plazo: "",
    plan_rehabilitacion: "",
    tecnicas_aplicar: "",
    frecuencia_sesiones: "",
    duracion_estimada: "",
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

  const fetchPacientes = async (token: string) => {
    setIsLoadingPacientes(true)
    try {
      const response = await fetch("http://localhost:3001/api/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Error al cargar pacientes")
      const data = await response.json()
      if (data.success && data.data) setPacientes(data.data)
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoadingPacientes(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const seleccionarPaciente = (p: Paciente) => {
    setPacienteSeleccionado(p)
    setSearchDoc("")
  }

  const pacientesFiltrados = searchDoc.trim()
    ? pacientes.filter(
        (p) =>
          p.documento.toLowerCase().includes(searchDoc.toLowerCase()) ||
          `${p.nombres} ${p.apellidos}`.toLowerCase().includes(searchDoc.toLowerCase())
      )
    : []

  const handleGuardar = async () => {
    if (!pacienteSeleccionado) {
      toast({ title: "Selecciona un paciente", variant: "destructive" })
      return
    }
    if (!formData.motivo_consulta) {
      toast({ title: "Ingresa el motivo de consulta", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      const p = pacienteSeleccionado

      const antecedentesSeleccionados = Object.entries(antecedentes)
        .filter(([, v]) => v)
        .map(([k]) => ANTECEDENTES_PERSONALES.find(a => a.id === k)?.label || k)
      if (antecedentesOtros.trim()) antecedentesSeleccionados.push(`Otros: ${antecedentesOtros}`)
      const antecedentesTexto = antecedentesSeleccionados.join(", ") || "Ninguno"

      const payload = {
        tipo_historia: "fisioterapeutica",
        paciente_id: p.id,
        primer_apellido_paciente: p.apellidos.split(" ")[0] || "Sin apellido",
        segundo_apellido_paciente: p.apellidos.split(" ")[1] || "",
        primer_nombre_paciente: p.nombres.split(" ")[0] || "Sin nombre",
        segundo_nombre_paciente: p.nombres.split(" ").slice(1).join(" ") || "",
        sexo_paciente: p.sexo || "M",
        edad_anos: p.edad || 0,
        fecha_consulta: new Date().toISOString().split("T")[0],
        hora_consulta: new Date().toTimeString().slice(0, 5),
        es_primera_consulta: true,
        motivo_consulta_primera: formData.motivo_consulta,
        antecedentes_personales: antecedentesTexto,
        descripcion_enfermedad:
          `Motivo de consulta: ${formData.motivo_consulta}\n` +
          `Dolor: ${formData.dolor_localizacion || "No especificado"} (EVA ${formData.dolor_intensidad_eva || "N/A"}/10, tipo: ${formData.dolor_tipo || "N/A"})\n` +
          `ROM: ${formData.rango_movimiento || "No evaluado"}\n` +
          `Fuerza muscular: ${formData.fuerza_muscular || "No evaluada"}\n` +
          `Evaluación postural: ${formData.evaluacion_postural || "No evaluada"}\n` +
          `Marcha: ${formData.evaluacion_marcha || "No evaluada"}\n` +
          `Pruebas especiales: ${formData.pruebas_especiales || "Ninguna"}`,
        cronologia: "Primera evaluación fisioterapéutica",
        localizacion: formData.dolor_localizacion || "No especificado",
        caracteristicas: `Evaluación funcional fisioterapéutica - ${formData.dolor_tipo || "No especificado"}`,
        examen_esqueletico: formData.rango_movimiento || "Evaluación funcional pendiente",
        intensidad_eva: parseInt(formData.dolor_intensidad_eva) || 5,
        peso: 70,
        talla: 1.70,
        diagnostico_principal: formData.diagnostico_fisioterapeutico || "Por determinar",
        plan_diagnostico:
          `Objetivos a corto plazo: ${formData.objetivos_corto_plazo || "Por definir"}\n` +
          `Objetivos a largo plazo: ${formData.objetivos_largo_plazo || "Por definir"}`,
        plan_terapeutico:
          `Plan de rehabilitación: ${formData.plan_rehabilitacion || "Por definir"}\n` +
          `Técnicas a aplicar: ${formData.tecnicas_aplicar || "Por definir"}\n` +
          `Frecuencia: ${formData.frecuencia_sesiones || "Por definir"}\n` +
          `Duración estimada: ${formData.duracion_estimada || "Por definir"}`,
        nombre_doctor: user?.nombres || user?.name || "Fisioterapeuta",
        primer_apellido_doctor: user?.apellidos || user?.lastName || "Sistema",
        numero_documento_doctor: user?.documento || "0000000000",
        institucion_del_sistema: "FisioLab",
        establecimiento_de_salud: "Centro Médico FisioLab",
        sistema_musculo_esqueletico: true,
        hallazgos_sistemas: "Evaluación funcional fisioterapéutica",
      }

      const response = await fetch("http://localhost:3001/api/historias-clinicas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Error al crear historia clínica")

      toast({ title: "Historia clínica fisioterapéutica creada", description: data.data?.codigo_unico })
      router.push("/historias-clinicas")
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la historia clínica",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <DashboardSidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-5xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/historias-clinicas")}
              className="mb-4 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Historias Clínicas
            </Button>

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                  Nueva Historia Clínica Fisioterapéutica
                </h1>
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Fisioterapéutica</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">Complete la evaluación funcional y plan de rehabilitación del paciente</p>
            </div>

            <div className="space-y-6">
              {/* Paciente */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Paciente</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {pacienteSeleccionado ? (
                    <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">
                          {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                        </p>
                        <p className="text-sm text-slate-500">
                          Doc: {pacienteSeleccionado.documento} · {pacienteSeleccionado.edad} años
                        </p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setPacienteSeleccionado(null)}>
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Buscar paciente por Cédula/DNI o nombre</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          placeholder="Ingresa documento o nombre del paciente..."
                          value={searchDoc}
                          onChange={(e) => setSearchDoc(e.target.value)}
                          className="pl-10 h-11 border-slate-200"
                        />
                      </div>
                      {searchDoc.trim() && (
                        <div className="border border-slate-200 rounded bg-white max-h-48 overflow-y-auto">
                          {pacientesFiltrados.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">No se encontraron pacientes</div>
                          ) : (
                            pacientesFiltrados.map((p) => (
                              <button
                                key={p.id}
                                onClick={() => seleccionarPaciente(p)}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-left"
                              >
                                <span className="font-medium text-slate-900">
                                  {p.nombres} {p.apellidos}
                                </span>
                                <Badge variant="outline" className="text-xs font-mono">
                                  {p.documento}
                                </Badge>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Antecedentes Personales del Paciente */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-emerald-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Antecedentes Personales del Paciente</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-x-8 gap-y-3">
                    {ANTECEDENTES_PERSONALES.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <Checkbox
                          checked={antecedentes[item.id] || false}
                          onCheckedChange={(checked) => setAntecedentes(prev => ({ ...prev, [item.id]: !!checked }))}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-slate-600">Otros</Label>
                    <Input value={antecedentesOtros} onChange={(e) => setAntecedentesOtros(e.target.value)} placeholder="Especifique otros antecedentes..." className="mt-1 h-9 border-slate-200" />
                  </div>
                </CardContent>
              </Card>

              {/* Motivo de Consulta */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Motivo de Consulta *</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea
                    value={formData.motivo_consulta}
                    onChange={(e) => handleInputChange("motivo_consulta", e.target.value)}
                    placeholder="Describa el motivo de consulta del paciente..."
                    rows={3}
                    className="border-slate-200 resize-none"
                  />
                </CardContent>
              </Card>

              {/* Evaluación del Dolor */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Evaluación del Dolor</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Localización</Label>
                      <Input value={formData.dolor_localizacion} onChange={(e) => handleInputChange("dolor_localizacion", e.target.value)} placeholder="Ej: Región lumbar" className="h-10 border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Intensidad EVA (0-10)</Label>
                      <Input type="number" min="0" max="10" value={formData.dolor_intensidad_eva} onChange={(e) => handleInputChange("dolor_intensidad_eva", e.target.value)} placeholder="5" className="h-10 border-slate-200 text-center font-semibold" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Tipo de dolor</Label>
                      <Select value={formData.dolor_tipo} onValueChange={(v) => handleInputChange("dolor_tipo", v)}>
                        <SelectTrigger className="h-10 border-slate-200"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {["Agudo","Crónico","Punzante","Sordo","Irradiado","Localizado","Intermitente","Constante"].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Evaluación Funcional */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Evaluación Funcional</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Rango de Movimiento (ROM)</Label>
                    <Textarea value={formData.rango_movimiento} onChange={(e) => handleInputChange("rango_movimiento", e.target.value)} placeholder="Evalúe rangos articulares: flexión, extensión, rotación, abducción, aducción..." rows={3} className="border-slate-200 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Fuerza Muscular</Label>
                    <Textarea value={formData.fuerza_muscular} onChange={(e) => handleInputChange("fuerza_muscular", e.target.value)} placeholder="Escala de Daniels (0-5) por grupo muscular evaluado..." rows={3} className="border-slate-200 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Evaluación Postural</Label>
                      <Textarea value={formData.evaluacion_postural} onChange={(e) => handleInputChange("evaluacion_postural", e.target.value)} placeholder="Alteraciones posturales observadas..." rows={3} className="border-slate-200 resize-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Evaluación de Marcha</Label>
                      <Textarea value={formData.evaluacion_marcha} onChange={(e) => handleInputChange("evaluacion_marcha", e.target.value)} placeholder="Patrón de marcha, alteraciones, uso de ayudas técnicas..." rows={3} className="border-slate-200 resize-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Pruebas Especiales</Label>
                    <Textarea value={formData.pruebas_especiales} onChange={(e) => handleInputChange("pruebas_especiales", e.target.value)} placeholder="Pruebas funcionales realizadas y resultados..." rows={3} className="border-slate-200 resize-none" />
                  </div>
                </CardContent>
              </Card>

              {/* Diagnóstico Fisioterapéutico */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Diagnóstico Fisioterapéutico</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <Textarea value={formData.diagnostico_fisioterapeutico} onChange={(e) => handleInputChange("diagnostico_fisioterapeutico", e.target.value)} placeholder="Diagnóstico funcional basado en la evaluación realizada..." rows={3} className="border-slate-200 resize-none" />
                </CardContent>
              </Card>

              {/* Objetivos */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Objetivos de Tratamiento</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Objetivos a corto plazo</Label>
                      <Textarea value={formData.objetivos_corto_plazo} onChange={(e) => handleInputChange("objetivos_corto_plazo", e.target.value)} placeholder="Metas a alcanzar en las primeras semanas..." rows={3} className="border-slate-200 resize-none" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Objetivos a largo plazo</Label>
                      <Textarea value={formData.objetivos_largo_plazo} onChange={(e) => handleInputChange("objetivos_largo_plazo", e.target.value)} placeholder="Metas funcionales finales esperadas..." rows={3} className="border-slate-200 resize-none" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Plan de Rehabilitación */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Plan de Rehabilitación</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Plan de rehabilitación</Label>
                    <Textarea value={formData.plan_rehabilitacion} onChange={(e) => handleInputChange("plan_rehabilitacion", e.target.value)} placeholder="Descripción del programa de rehabilitación..." rows={3} className="border-slate-200 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Técnicas a aplicar</Label>
                    <Textarea value={formData.tecnicas_aplicar} onChange={(e) => handleInputChange("tecnicas_aplicar", e.target.value)} placeholder="Ej: Electroestimulación, ultrasonido, termoterapia, ejercicios terapéuticos, terapia manual..." rows={3} className="border-slate-200 resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Frecuencia de sesiones</Label>
                      <Select value={formData.frecuencia_sesiones} onValueChange={(v) => handleInputChange("frecuencia_sesiones", v)}>
                        <SelectTrigger className="h-10 border-slate-200"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {["1 vez por semana","2 veces por semana","3 veces por semana","4 veces por semana","5 veces por semana","Diaria","Según necesidad"].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-slate-600">Duración estimada del tratamiento</Label>
                      <Select value={formData.duracion_estimada} onValueChange={(v) => handleInputChange("duracion_estimada", v)}>
                        <SelectTrigger className="h-10 border-slate-200"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                        <SelectContent>
                          {["2 semanas","4 semanas","6 semanas","8 semanas","3 meses","6 meses","Indefinido"].map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Button variant="outline" onClick={() => router.push("/historias-clinicas")}>
                  Cancelar
                </Button>
                <Button onClick={handleGuardar} disabled={isSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                  {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar Historia Clínica</>}
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

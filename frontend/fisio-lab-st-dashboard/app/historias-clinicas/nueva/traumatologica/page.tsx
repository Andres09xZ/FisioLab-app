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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  documento: string
  edad: number
  sexo?: string
}

const ANTECEDENTES_ITEMS = [
  "Cardiopatía", "Hipertensión", "Enf. Vascular", "Endocrino", "Metabólico",
  "Cáncer", "Tuberculosis", "Enf. Infecciosa", "Mal. Renal", "Otros"
]

const ORGANOS_SISTEMAS = [
  { id: "piel", label: "Piel - Faneras" },
  { id: "organos_sentidos", label: "Órganos de los sentidos" },
  { id: "respiratorio", label: "Respiratorio" },
  { id: "cardiovascular", label: "Cardio - Vascular" },
  { id: "digestivo", label: "Digestivo" },
  { id: "genito_urinario", label: "Génito - Urinario" },
  { id: "musculo_esqueletico", label: "Músculo - Esquelético" },
  { id: "endocrino", label: "Endocrino" },
  { id: "hemo_linfatico", label: "Hemo - Linfático" },
  { id: "nervioso", label: "Nervioso" },
]

const EXAMEN_REGIONAL = [
  "Piel - Faneras", "Cabeza", "Ojos", "Oídos", "Nariz",
  "Boca", "Orofaringe", "Cuello", "Axilas - Mamas", "Tórax",
  "Abdomen", "Vertebral", "Ingle - Periné", "Extremidades Superiores", "Extremidades Inferiores"
]

const EXAMEN_SISTEMICO = [
  "Órganos de los sentidos", "Respiratorio", "Vascular", "Digestivo", "Genital",
  "Urinario", "Músculo - Esquelético", "Endócrino", "Hemo - Linfático", "Neurológico"
]

export default function NuevaHCTraumatologicaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
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

  // C. Antecedentes Patológicos Personales
  const [antecedentesPersonales, setAntecedentesPersonales] = useState<Record<string, boolean>>({})
  const [antecedentesPersonalesOtros, setAntecedentesPersonalesOtros] = useState("")
  const [datosClinicosRelevantes, setDatosClinicosRelevantes] = useState("")

  // D. Antecedentes Patológicos Familiares
  const [antecedentesFamiliares, setAntecedentesFamiliares] = useState<Record<string, boolean>>({})
  const [antecedentesFamiliaresOtros, setAntecedentesFamiliaresOtros] = useState("")

  // E. Enfermedad o Problema Actual
  const [enfermedad, setEnfermedad] = useState({
    descripcion: "",
    cronologia: "",
    localizacion: "",
    caracteristicas: "",
    intensidad: "",
    frecuencia: "",
    factores_agravantes: "",
  })

  // F. Constantes Vitales y Antropometría
  const [signos, setSignos] = useState({
    presion_arterial: "",
    pulso: "",
    frecuencia_respiratoria: "",
    peso: "",
    talla: "",
    imc: "",
    perimetro_abdominal: "",
    hemoglobina: "",
    glucosa_capilar: "",
  })

  // G. Revisión de Órganos y Sistemas
  const [organosSistemas, setOrganosSistemas] = useState<Record<string, { presente: boolean; descripcion: string }>>({})

  // H. Examen Físico
  const [examenRegional, setExamenRegional] = useState<Record<string, string>>({})
  const [examenSistemico, setExamenSistemico] = useState<Record<string, string>>({})

  // Diagnóstico y Plan
  const [diagnostico, setDiagnostico] = useState({
    diagnostico_principal: "",
    plan_diagnostico: "",
    plan_terapeutico: "",
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
    try {
      const response = await fetch("http://localhost:3001/api/pacientes", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Error al cargar pacientes")
      const data = await response.json()
      if (data.success && data.data) setPacientes(data.data)
    } catch (error) {
      console.error("Error:", error)
    }
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

  // Auto-calculate IMC
  useEffect(() => {
    const peso = parseFloat(signos.peso)
    const talla = parseFloat(signos.talla)
    if (peso > 0 && talla > 0) {
      const tallaM = talla > 3 ? talla / 100 : talla
      const imc = (peso / (tallaM * tallaM)).toFixed(1)
      setSignos(prev => ({ ...prev, imc }))
    }
  }, [signos.peso, signos.talla])

  const buildAntecedentesText = (items: Record<string, boolean>, otros: string) => {
    const selected = Object.entries(items).filter(([, v]) => v).map(([k]) => k)
    if (otros.trim()) selected.push(`Otros: ${otros}`)
    return selected.join(", ") || "Ninguno"
  }

  const handleGuardar = async () => {
    if (!pacienteSeleccionado) {
      toast({ title: "Selecciona un paciente", variant: "destructive" })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      const p = pacienteSeleccionado

      const orgSistemasTexto = Object.entries(organosSistemas)
        .filter(([, v]) => v.presente)
        .map(([k, v]) => `${k}: ${v.descripcion || "Alterado"}`)
        .join("\n") || "Sin hallazgos patológicos"

      const exRegTexto = Object.entries(examenRegional)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n") || "Normal"

      const exSisTexto = Object.entries(examenSistemico)
        .filter(([, v]) => v.trim())
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n") || "Normal"

      const payload = {
        tipo_historia: "traumatologica",
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
        motivo_consulta_primera: enfermedad.descripcion || "Consulta traumatológica",
        descripcion_enfermedad: enfermedad.descripcion || "No especificada",
        cronologia: enfermedad.cronologia || "No especificada",
        localizacion: enfermedad.localizacion || "No especificada",
        caracteristicas: enfermedad.caracteristicas || "No especificadas",
        intensidad_eva: parseInt(enfermedad.intensidad) || 5,
        frecuencia: enfermedad.frecuencia || "No especificada",
        antecedentes_personales: buildAntecedentesText(antecedentesPersonales, antecedentesPersonalesOtros),
        antecedentes_familiares: buildAntecedentesText(antecedentesFamiliares, antecedentesFamiliaresOtros),
        peso: parseFloat(signos.peso) || 70,
        talla: parseFloat(signos.talla) || 1.70,
        presion_arterial: signos.presion_arterial || null,
        pulso: signos.pulso || null,
        frecuencia_respiratoria: signos.frecuencia_respiratoria || null,
        examen_esqueletico: `REGIONAL:\n${exRegTexto}\n\nSISTÉMICO:\n${exSisTexto}`,
        hallazgos_sistemas: orgSistemasTexto,
        sistema_musculo_esqueletico: organosSistemas.musculo_esqueletico?.presente ?? true,
        diagnostico_principal: diagnostico.diagnostico_principal || "Por determinar",
        plan_diagnostico: diagnostico.plan_diagnostico || "Pendiente",
        plan_terapeutico: diagnostico.plan_terapeutico || "Pendiente",
        nombre_doctor: user?.nombres || user?.name || "Doctor",
        primer_apellido_doctor: user?.apellidos || user?.lastName || "Sistema",
        numero_documento_doctor: user?.documento || "0000000000",
        institucion_del_sistema: "FisioLab",
        establecimiento_de_salud: "Centro Médico FisioLab",
      }

      const response = await fetch("http://localhost:3001/api/historias-clinicas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      })
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Error al crear historia clínica")

      toast({ title: "Historia clínica traumatológica creada", description: data.data?.codigo_unico })
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
            <Button variant="ghost" onClick={() => router.push("/historias-clinicas")} className="mb-4 text-slate-600 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Historias Clínicas
            </Button>

            <div className="mb-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Nueva Historia Clínica Traumatológica</h1>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">Traumatológica</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">Complete todos los campos de la evaluación traumatológica</p>
            </div>

            <div className="space-y-6">
              {/* Paciente */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Paciente</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {pacienteSeleccionado ? (
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900">{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</p>
                        <p className="text-sm text-slate-500">Doc: {pacienteSeleccionado.documento} · {pacienteSeleccionado.edad} años</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setPacienteSeleccionado(null)}>Cambiar</Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Label className="text-sm font-medium text-slate-700">Buscar paciente por Cédula/DNI o nombre</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Ingresa documento o nombre del paciente..." value={searchDoc} onChange={(e) => setSearchDoc(e.target.value)} className="pl-10 h-11 border-slate-200" />
                      </div>
                      {searchDoc.trim() && (
                        <div className="border border-slate-200 rounded bg-white max-h-48 overflow-y-auto">
                          {pacientesFiltrados.length === 0 ? (
                            <div className="p-4 text-center text-sm text-slate-500">No se encontraron pacientes</div>
                          ) : (
                            pacientesFiltrados.map((p) => (
                              <button key={p.id} onClick={() => seleccionarPaciente(p)} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 border-b border-slate-100 last:border-b-0 text-left">
                                <span className="font-medium text-slate-900">{p.nombres} {p.apellidos}</span>
                                <Badge variant="outline" className="text-xs font-mono">{p.documento}</Badge>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* C. Antecedentes Patológicos Personales */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-green-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">C. Antecedentes Patológicos Personales</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-5 gap-3">
                    {ANTECEDENTES_ITEMS.map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <Checkbox
                          checked={antecedentesPersonales[item] || false}
                          onCheckedChange={(checked) => setAntecedentesPersonales(prev => ({ ...prev, [item]: !!checked }))}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                  {antecedentesPersonales["Otros"] && (
                    <div className="mt-3">
                      <Input value={antecedentesPersonalesOtros} onChange={(e) => setAntecedentesPersonalesOtros(e.target.value)} placeholder="Especifique otros antecedentes..." className="h-9 border-slate-200" />
                    </div>
                  )}
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-slate-600">Datos clínicos, quirúrgicos, obstétricos, alérgicos relevantes</Label>
                    <Textarea value={datosClinicosRelevantes} onChange={(e) => setDatosClinicosRelevantes(e.target.value)} placeholder="Describa datos relevantes..." rows={2} className="mt-1 border-slate-200 resize-none" />
                  </div>
                </CardContent>
              </Card>

              {/* D. Antecedentes Patológicos Familiares */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-green-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">D. Antecedentes Patológicos Familiares</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-5 gap-3">
                    {ANTECEDENTES_ITEMS.map((item) => (
                      <label key={item} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <Checkbox
                          checked={antecedentesFamiliares[item] || false}
                          onCheckedChange={(checked) => setAntecedentesFamiliares(prev => ({ ...prev, [item]: !!checked }))}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                  {antecedentesFamiliares["Otros"] && (
                    <div className="mt-3">
                      <Input value={antecedentesFamiliaresOtros} onChange={(e) => setAntecedentesFamiliaresOtros(e.target.value)} placeholder="Especifique otros antecedentes familiares..." className="h-9 border-slate-200" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* E. Enfermedad o Problema Actual */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-green-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">E. Enfermedad o Problema Actual</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <Textarea value={enfermedad.descripcion} onChange={(e) => setEnfermedad(prev => ({ ...prev, descripcion: e.target.value }))} placeholder="Describa la enfermedad o problema actual del paciente..." rows={4} className="border-slate-200 resize-none" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Cronología</Label>
                      <Input value={enfermedad.cronologia} onChange={(e) => setEnfermedad(prev => ({ ...prev, cronologia: e.target.value }))} placeholder="Tiempo de evolución" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Localización</Label>
                      <Input value={enfermedad.localizacion} onChange={(e) => setEnfermedad(prev => ({ ...prev, localizacion: e.target.value }))} placeholder="Zona afectada" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Características</Label>
                      <Input value={enfermedad.caracteristicas} onChange={(e) => setEnfermedad(prev => ({ ...prev, caracteristicas: e.target.value }))} placeholder="Tipo de dolor/molestia" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Intensidad (EVA 0-10)</Label>
                      <Input type="number" min="0" max="10" value={enfermedad.intensidad} onChange={(e) => setEnfermedad(prev => ({ ...prev, intensidad: e.target.value }))} placeholder="5" className="h-9 border-slate-200 text-center font-semibold" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Frecuencia</Label>
                      <Input value={enfermedad.frecuencia} onChange={(e) => setEnfermedad(prev => ({ ...prev, frecuencia: e.target.value }))} placeholder="Ej: Continuo, intermitente" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Factores Agravantes</Label>
                      <Input value={enfermedad.factores_agravantes} onChange={(e) => setEnfermedad(prev => ({ ...prev, factores_agravantes: e.target.value }))} placeholder="Factores que empeoran" className="h-9 border-slate-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* F. Constantes Vitales y Antropometría */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-green-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">F. Constantes Vitales y Antropometría</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Presión Arterial</Label>
                      <Input value={signos.presion_arterial} onChange={(e) => setSignos(prev => ({ ...prev, presion_arterial: e.target.value }))} placeholder="120/80 mmHg" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Pulso (lpm)</Label>
                      <Input value={signos.pulso} onChange={(e) => setSignos(prev => ({ ...prev, pulso: e.target.value }))} placeholder="72" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Frecuencia Respiratoria</Label>
                      <Input value={signos.frecuencia_respiratoria} onChange={(e) => setSignos(prev => ({ ...prev, frecuencia_respiratoria: e.target.value }))} placeholder="18 rpm" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Peso (kg)</Label>
                      <Input type="number" value={signos.peso} onChange={(e) => setSignos(prev => ({ ...prev, peso: e.target.value }))} placeholder="70" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Talla (cm)</Label>
                      <Input type="number" value={signos.talla} onChange={(e) => setSignos(prev => ({ ...prev, talla: e.target.value }))} placeholder="170" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">IMC (Kg/m²)</Label>
                      <Input value={signos.imc} readOnly className="h-9 border-slate-200 bg-slate-50 font-semibold" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Perímetro Abdominal (cm)</Label>
                      <Input value={signos.perimetro_abdominal} onChange={(e) => setSignos(prev => ({ ...prev, perimetro_abdominal: e.target.value }))} placeholder="85" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Hemoglobina (g/dl)</Label>
                      <Input value={signos.hemoglobina} onChange={(e) => setSignos(prev => ({ ...prev, hemoglobina: e.target.value }))} placeholder="14.5" className="h-9 border-slate-200" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-medium text-slate-500 uppercase">Glucosa Capilar (mg/dl)</Label>
                      <Input value={signos.glucosa_capilar} onChange={(e) => setSignos(prev => ({ ...prev, glucosa_capilar: e.target.value }))} placeholder="95" className="h-9 border-slate-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* G. Revisión Actual de Órganos y Sistemas */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-green-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">G. Revisión Actual de Órganos y Sistemas</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Marcar cuando presente patología y describir</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {ORGANOS_SISTEMAS.map((sistema) => (
                      <div key={sistema.id} className="flex items-start gap-3">
                        <div className="flex items-center gap-2 min-w-[200px] pt-1">
                          <Checkbox
                            checked={organosSistemas[sistema.id]?.presente || false}
                            onCheckedChange={(checked) =>
                              setOrganosSistemas(prev => ({
                                ...prev,
                                [sistema.id]: { presente: !!checked, descripcion: prev[sistema.id]?.descripcion || "" }
                              }))
                            }
                          />
                          <span className="text-sm text-slate-700">{sistema.label}</span>
                        </div>
                        {organosSistemas[sistema.id]?.presente && (
                          <Input
                            value={organosSistemas[sistema.id]?.descripcion || ""}
                            onChange={(e) =>
                              setOrganosSistemas(prev => ({
                                ...prev,
                                [sistema.id]: { ...prev[sistema.id], descripcion: e.target.value }
                              }))
                            }
                            placeholder="Describir hallazgo..."
                            className="h-8 text-sm border-slate-200 flex-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* H. Examen Físico */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-green-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">H. Examen Físico</CardTitle>
                  <p className="text-xs text-slate-500 mt-1">Describir hallazgos cuando presente patología</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-8">
                    {/* Regional */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Regional</h4>
                      <div className="space-y-2">
                        {EXAMEN_REGIONAL.map((region) => (
                          <div key={region} className="space-y-1">
                            <Label className="text-xs font-medium text-slate-600">{region}</Label>
                            <Input
                              value={examenRegional[region] || ""}
                              onChange={(e) => setExamenRegional(prev => ({ ...prev, [region]: e.target.value }))}
                              placeholder="Normal / Hallazgos..."
                              className="h-8 text-sm border-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Sistémico */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wide">Sistémico</h4>
                      <div className="space-y-2">
                        {EXAMEN_SISTEMICO.map((sistema) => (
                          <div key={sistema} className="space-y-1">
                            <Label className="text-xs font-medium text-slate-600">{sistema}</Label>
                            <Input
                              value={examenSistemico[sistema] || ""}
                              onChange={(e) => setExamenSistemico(prev => ({ ...prev, [sistema]: e.target.value }))}
                              placeholder="Normal / Hallazgos..."
                              className="h-8 text-sm border-slate-200"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Diagnóstico y Plan */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-blue-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">Diagnóstico y Plan de Tratamiento</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Diagnóstico Principal</Label>
                    <Input value={diagnostico.diagnostico_principal} onChange={(e) => setDiagnostico(prev => ({ ...prev, diagnostico_principal: e.target.value }))} placeholder="Ej: Fractura de tibia distal - AO tipo B" className="h-10 border-slate-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Plan Diagnóstico</Label>
                    <Textarea value={diagnostico.plan_diagnostico} onChange={(e) => setDiagnostico(prev => ({ ...prev, plan_diagnostico: e.target.value }))} placeholder="Estudios complementarios a solicitar..." rows={3} className="border-slate-200 resize-none" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-600">Plan Terapéutico</Label>
                    <Textarea value={diagnostico.plan_terapeutico} onChange={(e) => setDiagnostico(prev => ({ ...prev, plan_terapeutico: e.target.value }))} placeholder="Tratamiento propuesto..." rows={3} className="border-slate-200 resize-none" />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Button variant="outline" onClick={() => router.push("/historias-clinicas")}>Cancelar</Button>
                <Button onClick={handleGuardar} disabled={isSaving} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
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

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
import { ArrowLeft, Save, FileText, Pill } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  documento: string
  edad: number
}

export default function NuevaHistoriaTraumatologicaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [isLoadingPacientes, setIsLoadingPacientes] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Form state
  const [formData, setFormData] = useState({
    paciente_id: "",
    tipo_lesion: "",
    mecanismo_lesion: "",
    tiempo_evolucion: "",
    antecedentes_ortopedicos: "",
    examen_fisico: "",
    estudios_complementarios: "",
    clasificacion_lesion: "",
    plan_tratamiento: "",
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
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      
      // Solo doctores pueden crear HC traumatológicas
      if (parsedUser.role !== 'DOCTOR') {
        toast({
          title: "Acceso denegado",
          description: "Solo doctores pueden crear historias clínicas traumatológicas",
          variant: "destructive",
        })
        router.push("/historias-clinicas")
      }
      
      fetchPacientes(token)
    }
  }, [router])

  const fetchPacientes = async (token: string) => {
    setIsLoadingPacientes(true)
    try {
      const response = await fetch("http://localhost:3001/api/pacientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar pacientes")

      const data = await response.json()
      if (data.success && data.data) {
        setPacientes(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de pacientes",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPacientes(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGuardar = async () => {
    // Validaciones básicas
    if (!formData.paciente_id) {
      toast({
        title: "Campo requerido",
        description: "Debes seleccionar un paciente",
        variant: "destructive",
      })
      return
    }

    const pacienteSeleccionado = pacientes.find(p => p.id === formData.paciente_id)
    if (!pacienteSeleccionado) return

    setIsSaving(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      
      // Construir el payload según la estructura del backend
      const payload = {
        paciente_id: formData.paciente_id,
        primer_apellido_paciente: pacienteSeleccionado.apellidos.split(' ')[0] || '',
        segundo_apellido_paciente: pacienteSeleccionado.apellidos.split(' ')[1] || '',
        primer_nombre_paciente: pacienteSeleccionado.nombres.split(' ')[0] || '',
        segundo_nombre_paciente: pacienteSeleccionado.nombres.split(' ').slice(1).join(' ') || '',
        sexo_paciente: 'M', // Por ahora hardcoded, debería venir del paciente
        edad_anos: pacienteSeleccionado.edad,
        fecha_consulta: new Date().toISOString().split('T')[0],
        hora_consulta: new Date().toTimeString().slice(0, 5),
        es_primera_consulta: true,
        motivo_consulta_primera: `${formData.tipo_lesion} - ${formData.mecanismo_lesion}`,
        
        // Campos específicos de traumatología
        descripcion_enfermedad: `Tipo de lesión: ${formData.tipo_lesion}\nMecanismo: ${formData.mecanismo_lesion}\nTiempo de evolución: ${formData.tiempo_evolucion}\nAntecedentes ortopédicos: ${formData.antecedentes_ortopedicos}`,
        examen_esqueletico: formData.examen_fisico,
        cronologia: formData.tiempo_evolucion,
        
        // Campos mínimos requeridos
        intensidad_eva: 5, // Valor por defecto, se puede agregar campo después
        peso: 70, // Valores por defecto, se pueden agregar campos después
        talla: 170,
        
        // Diagnóstico y plan
        diagnostico_principal: formData.clasificacion_lesion || "Por determinar",
        plan_diagnostico: formData.estudios_complementarios || "Evaluación pendiente",
        plan_terapeutico: formData.plan_tratamiento || "Plan de tratamiento pendiente",
        
        // Profesional
        nombre_doctor: user?.nombres || user?.name || '',
        primer_apellido_doctor: user?.apellidos || user?.lastName || '',
        numero_documento_doctor: user?.documento || '',
        
        // Institución
        institucion_del_sistema: "FisioLab",
        establecimiento_de_salud: "Centro Médico FisioLab",
        
        // Sistemas
        sistema_musculo_esqueletico: true,
        hallazgos_sistemas: "Evaluación del sistema músculo-esquelético",
      }

      const response = await fetch("http://localhost:3001/api/historias-clinicas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al crear historia clínica")
      }

      toast({
        title: "Éxito",
        description: "Historia clínica traumatológica creada correctamente",
      })

      router.push("/historias-clinicas")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la historia clínica",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleBack = () => {
    router.push("/historias-clinicas")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2 text-slate-600 hover:text-slate-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Crear Historia Clínica Traumatológica</h1>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              {/* Selector de Paciente */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50">
                  <CardTitle className="text-lg font-semibold text-slate-800">Paciente</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Label htmlFor="paciente" className="text-sm font-medium text-slate-600">
                      Seleccionar paciente
                    </Label>
                    <Select
                      value={formData.paciente_id}
                      onValueChange={(value) => handleInputChange('paciente_id', value)}
                      disabled={isLoadingPacientes}
                    >
                      <SelectTrigger 
                        id="paciente" 
                        className="h-11 border-slate-300 focus:border-cyan-600 focus:ring-cyan-600"
                      >
                        <SelectValue placeholder="Seleccionar paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        {pacientes.map((paciente) => (
                          <SelectItem key={paciente.id} value={paciente.id}>
                            {paciente.nombres} {paciente.apellidos} - {paciente.documento}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Datos de la Lesión */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50">
                  <CardTitle className="text-lg font-semibold text-slate-800">Datos de la Lesión</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Tipo de lesión */}
                    <div className="space-y-2">
                      <Label htmlFor="tipo_lesion" className="text-sm font-medium text-slate-600">
                        Tipo de lesión:
                      </Label>
                      <Select
                        value={formData.tipo_lesion}
                        onValueChange={(value) => handleInputChange('tipo_lesion', value)}
                      >
                        <SelectTrigger 
                          id="tipo_lesion" 
                          className="h-11 border-slate-300 focus:border-cyan-600 focus:ring-cyan-600"
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fractura">Fractura</SelectItem>
                          <SelectItem value="Luxación">Luxación</SelectItem>
                          <SelectItem value="Esguince">Esguince</SelectItem>
                          <SelectItem value="Contusión">Contusión</SelectItem>
                          <SelectItem value="Desgarro muscular">Desgarro muscular</SelectItem>
                          <SelectItem value="Tendinitis">Tendinitis</SelectItem>
                          <SelectItem value="Hernia discal">Hernia discal</SelectItem>
                          <SelectItem value="Artritis">Artritis</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mecanismo de lesión */}
                    <div className="space-y-2">
                      <Label htmlFor="mecanismo_lesion" className="text-sm font-medium text-slate-600">
                        Mecanismo de lesión:
                      </Label>
                      <Select
                        value={formData.mecanismo_lesion}
                        onValueChange={(value) => handleInputChange('mecanismo_lesion', value)}
                      >
                        <SelectTrigger 
                          id="mecanismo_lesion" 
                          className="h-11 border-slate-300 focus:border-cyan-600 focus:ring-cyan-600"
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Caída">Caída</SelectItem>
                          <SelectItem value="Traumatismo directo">Traumatismo directo</SelectItem>
                          <SelectItem value="Torsión">Torsión</SelectItem>
                          <SelectItem value="Accidente vehicular">Accidente vehicular</SelectItem>
                          <SelectItem value="Deportivo">Deportivo</SelectItem>
                          <SelectItem value="Laboral">Laboral</SelectItem>
                          <SelectItem value="Sobrecarga">Sobrecarga</SelectItem>
                          <SelectItem value="Degenerativo">Degenerativo</SelectItem>
                          <SelectItem value="Otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tiempo de evolución */}
                    <div className="space-y-2">
                      <Label htmlFor="tiempo_evolucion" className="text-sm font-medium text-slate-600">
                        Tiempo de evolución:
                      </Label>
                      <Input
                        id="tiempo_evolucion"
                        value={formData.tiempo_evolucion}
                        onChange={(e) => handleInputChange('tiempo_evolucion', e.target.value)}
                        placeholder="Ej: 3 días, 2 semanas"
                        className="h-11 border-slate-300 focus:border-cyan-600 focus:ring-cyan-600"
                      />
                    </div>

                    {/* Antecedentes ortopédicos previos */}
                    <div className="space-y-2">
                      <Label htmlFor="antecedentes_ortopedicos" className="text-sm font-medium text-slate-600">
                        Antecedentes ortopédicos previos:
                      </Label>
                      <Input
                        id="antecedentes_ortopedicos"
                        value={formData.antecedentes_ortopedicos}
                        onChange={(e) => handleInputChange('antecedentes_ortopedicos', e.target.value)}
                        placeholder="Lesiones o cirugías previas"
                        className="h-11 border-slate-300 focus:border-cyan-600 focus:ring-cyan-600"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Examen Físico */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50">
                  <CardTitle className="text-lg font-semibold text-slate-800">Examen Físico</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Textarea
                      id="examen_fisico"
                      value={formData.examen_fisico}
                      onChange={(e) => handleInputChange('examen_fisico', e.target.value)}
                      placeholder="Inspección, palpación, movilidad, pruebas específicas..."
                      rows={8}
                      className="border-slate-300 focus:border-cyan-600 focus:ring-cyan-600 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Estudios Complementarios */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50">
                  <CardTitle className="text-lg font-semibold text-slate-800">Estudios Complementarios</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <Textarea
                      id="estudios_complementarios"
                      value={formData.estudios_complementarios}
                      onChange={(e) => handleInputChange('estudios_complementarios', e.target.value)}
                      placeholder="Radiografías, TAC, resonancias, laboratorios solicitados..."
                      rows={6}
                      className="border-slate-300 focus:border-cyan-600 focus:ring-cyan-600 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Clasificación y Tratamiento */}
              <Card className="border border-slate-200">
                <CardHeader className="border-b border-slate-200 bg-slate-50">
                  <CardTitle className="text-lg font-semibold text-slate-800">Clasificación y Tratamiento</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Clasificación de lesión */}
                    <div className="space-y-2">
                      <Label htmlFor="clasificacion_lesion" className="text-sm font-medium text-slate-600">
                        Clasificación de lesión:
                      </Label>
                      <Select
                        value={formData.clasificacion_lesion}
                        onValueChange={(value) => handleInputChange('clasificacion_lesion', value)}
                      >
                        <SelectTrigger 
                          id="clasificacion_lesion" 
                          className="h-11 border-slate-300 focus:border-cyan-600 focus:ring-cyan-600"
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Garden I">Garden I (Incompleta)</SelectItem>
                          <SelectItem value="Garden II">Garden II (Completa sin desplazamiento)</SelectItem>
                          <SelectItem value="Garden III">Garden III (Completa con desplazamiento parcial)</SelectItem>
                          <SelectItem value="Garden IV">Garden IV (Completa con desplazamiento total)</SelectItem>
                          <SelectItem value="AO tipo A">AO tipo A (Extraarticular simple)</SelectItem>
                          <SelectItem value="AO tipo B">AO tipo B (Extraarticular cuña)</SelectItem>
                          <SelectItem value="AO tipo C">AO tipo C (Intraarticular)</SelectItem>
                          <SelectItem value="Gustilo I">Gustilo I (Herida limpia &lt;1cm)</SelectItem>
                          <SelectItem value="Gustilo II">Gustilo II (Herida &gt;1cm, daño moderado)</SelectItem>
                          <SelectItem value="Gustilo IIIA">Gustilo IIIA (Herida grande, cobertura adecuada)</SelectItem>
                          <SelectItem value="Gustilo IIIB">Gustilo IIIB (Daño extenso, periostio desprendido)</SelectItem>
                          <SelectItem value="Gustilo IIIC">Gustilo IIIC (Lesión vascular arterial)</SelectItem>
                          <SelectItem value="No aplica">No aplica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Plan de tratamiento */}
                    <div className="space-y-2">
                      <Label htmlFor="plan_tratamiento" className="text-sm font-medium text-slate-600">
                        Plan de tratamiento:
                      </Label>
                      <Select
                        value={formData.plan_tratamiento}
                        onValueChange={(value) => handleInputChange('plan_tratamiento', value)}
                      >
                        <SelectTrigger 
                          id="plan_tratamiento" 
                          className="h-11 border-slate-300 focus:border-cyan-600 focus:ring-cyan-600"
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Conservador">Conservador (inmovilización, analgesia, rehabilitación)</SelectItem>
                          <SelectItem value="Quirúrgico - ORIF">Quirúrgico - ORIF (Reducción abierta fijación interna)</SelectItem>
                          <SelectItem value="Quirúrgico - Osteosíntesis">Quirúrgico - Osteosíntesis</SelectItem>
                          <SelectItem value="Quirúrgico - Artroplastia">Quirúrgico - Artroplastia</SelectItem>
                          <SelectItem value="Quirúrgico - Arthroscopia">Quirúrgico - Artroscopia</SelectItem>
                          <SelectItem value="Mixto">Mixto (conservador + quirúrgico)</SelectItem>
                          <SelectItem value="Rehabilitación intensiva">Rehabilitación intensiva</SelectItem>
                          <SelectItem value="Observación">Observación y reevaluación</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="border-slate-300 text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50"
                    disabled
                  >
                    <FileText className="h-4 w-4" />
                    Descargar PDF
                  </Button>
                  <Button
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled
                  >
                    <Pill className="h-4 w-4" />
                    Generar Receta Médica
                  </Button>
                  <Button
                    onClick={handleGuardar}
                    disabled={isSaving}
                    className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Download, Edit2, FileText, Pill, Calendar, User, Activity, Stethoscope, ClipboardList } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Helper para formatear fechas
const formatFecha = (fecha: string) => {
  if (!fecha) return 'No registrado';
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper para formatear hora
const formatHora = (hora: string) => {
  if (!hora) return '';
  return hora.substring(0, 5);
};

// Componente para mostrar un campo de datos
const DataField = ({ label, value, full = false }: { label: string, value: any, full?: boolean }) => {
  if (value === null || value === undefined || value === '') return null;
  
  return (
    <div className={full ? "col-span-2" : ""}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  );
};

// Componente para checkbox visual
const CheckboxField = ({ label, checked }: { label: string, checked: boolean }) => {
  if (!checked) return null;
  
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 rounded border-2 border-cyan-700 bg-cyan-700 flex items-center justify-center">
        <svg className="h-3 w-3 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <span className="text-sm text-gray-900">{label}</span>
    </div>
  );
};

export default function HistoriaClinicaDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const historiaId = params?.id as string
  
  const [user, setUser] = useState<any>(null)
  const [historia, setHistoria] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('resumen')
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

  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      setUserRole(parsedUser.role)
      if (historiaId) {
        fetchHistoria(token)
      }
    }
  }, [router, historiaId])

  const fetchHistoria = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/historias-clinicas/${historiaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar historia clínica")

      const data = await response.json()
      if (data.success && data.data) {
        setHistoria(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la historia clínica",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    // Regresar a la vista del paciente si tenemos el ID, sino a la lista de pacientes
    if (historia?.paciente_id) {
      router.push(`/pacientes/${historia.paciente_id}`)
    } else {
      router.push("/pacientes")
    }
  }

  const handleEdit = () => {
    router.push(`/historias-clinicas/${historiaId}/editar`)
  }

  const handleCrearReceta = () => {
    // Navegar a crear receta con datos precargados de esta HC
    router.push(`/recetas/nueva?historia_clinica_id=${historiaId}`)
  }

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem("fisiolab_token")
      const response = await fetch(`http://localhost:3001/api/historias-clinicas/${historiaId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al descargar PDF")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `historia-clinica-${historia?.codigo_unico || historiaId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Éxito",
        description: "PDF descargado correctamente",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo descargar el PDF",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopbar user={user} />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-700"></div>
          </main>
        </div>
      </div>
    )
  }

  const getTipoHistoriaBadge = () => {
    const tipo = historia?.tipo_historia;
    if (tipo === 'traumatologica') {
      return <Badge className="bg-blue-500">Traumatológica</Badge>;
    } else if (tipo === 'fisioterapeutica') {
      return <Badge className="bg-green-500">Fisioterapéutica</Badge>;
    }
    return <Badge>General</Badge>;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </Button>
              </div>
              <div className="flex gap-3">
                {userRole === 'DOCTOR' && (
                  <Button
                    variant="outline"
                    onClick={handleCrearReceta}
                    className="gap-2"
                  >
                    <Pill className="h-4 w-4" />
                    Crear Receta
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar PDF
                </Button>
                {userRole === 'DOCTOR' && (
                  <Button
                    onClick={handleEdit}
                    className="gap-2 bg-cyan-700 hover:bg-cyan-800"
                  >
                    <Edit2 className="h-4 w-4" />
                    Editar
                  </Button>
                )}
              </div>
            </div>

            {/* Title and Quick Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {historia?.codigo_unico}
                </h1>
                {getTipoHistoriaBadge()}
              </div>
              <div className="flex gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{historia?.primer_nombre_paciente} {historia?.segundo_nombre_paciente} {historia?.primer_apellido_paciente} {historia?.segundo_apellido_paciente}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatFecha(historia?.fecha_consulta)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Edad: {historia?.edad_anos} años</span>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="resumen" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Resumen
                </TabsTrigger>
                <TabsTrigger value="paciente" className="gap-2">
                  <User className="h-4 w-4" />
                  Paciente
                </TabsTrigger>
                <TabsTrigger value="clinica" className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Evaluación Clínica
                </TabsTrigger>
                <TabsTrigger value="antecedentes" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Antecedentes
                </TabsTrigger>
                <TabsTrigger value="diagnostico" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Diagnóstico
                </TabsTrigger>
                <TabsTrigger value="plan" className="gap-2">
                  <Pill className="h-4 w-4" />
                  Plan
                </TabsTrigger>
              </TabsList>

              {/* TAB: RESUMEN */}
              <TabsContent value="resumen" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  {/* Motivo de Consulta */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Motivo de Consulta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700">
                        {historia?.es_primera_consulta 
                          ? (historia?.motivo_consulta_primera || "No especificado")
                          : (historia?.motivo_consulta_subsecuente || "No especificado")
                        }
                      </p>
                      <div className="mt-2">
                        <Badge variant={historia?.es_primera_consulta ? "default" : "secondary"}>
                          {historia?.es_primera_consulta ? "Primera Consulta" : "Consulta Subsecuente"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Diagnóstico Principal */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Diagnóstico Principal</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-900 font-semibold mb-2">{historia?.diagnostico_principal || "No especificado"}</p>
                      <dl className="space-y-2">
                        <DataField label="Código CIE-10" value={historia?.codigo_diagnostico_principal} />
                        <DataField label="Clasificación" value={historia?.clasificacion_principal} />
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                {/* Signos Vitales & Antropometría */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Signos Vitales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-4">
                        <DataField label="Temperatura" value={historia?.temperatura && `${historia.temperatura}°C`} />
                        <DataField label="Presión Arterial" value={historia?.presion_arterial_sistolica && historia?.presion_arterial_diastolica && `${historia.presion_arterial_sistolica}/${historia.presion_arterial_diastolica} mmHg`} />
                        <DataField label="Pulso" value={historia?.pulso && `${historia.pulso} lpm`} />
                        <DataField label="Frecuencia Respiratoria" value={historia?.frecuencia_respiratoria && `${historia.frecuencia_respiratoria} rpm`} />
                      </dl>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Antropometría</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <dl className="grid grid-cols-2 gap-4">
                        <DataField label="Peso" value={historia?.peso && `${historia.peso} kg`} />
                        <DataField label="Talla" value={historia?.talla && `${historia.talla} cm`} />
                        <DataField label="IMC" value={historia?.imc} />
                        <DataField label="Perímetro Abdominal" value={historia?.perimetro_abdominal && `${historia.perimetro_abdominal} cm`} />
                      </dl>
                    </CardContent>
                  </Card>
                </div>

                {/* Escala EVA (si existe) */}
                {historia?.intensidad_eva !== null && historia?.intensidad_eva !== undefined && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Escala de Dolor (EVA)</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4">
                        <div className="text-5xl font-bold text-cyan-700">{historia.intensidad_eva}</div>
                        <div className="text-gray-500">/  10</div>
                        <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                            style={{ width: `${(historia.intensidad_eva / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Descripción de la Enfermedad */}
                {historia?.descripcion_enfermedad && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Enfermedad Actual</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{historia.descripcion_enfermedad}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <DataField label="Cronología" value={historia?.cronologia} full />
                        <DataField label="Localización" value={historia?.localizacion} />
                        <DataField label="Características" value={historia?.caracteristicas} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* TAB: PACIENTE */}
              <TabsContent value="paciente" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Datos del Paciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-4">
                      <DataField label="Primer Apellido" value={historia?.primer_apellido_paciente} />
                      <DataField label="Segundo Apellido" value={historia?.segundo_apellido_paciente} />
                      <DataField label="Primer Nombre" value={historia?.primer_nombre_paciente} />
                      <DataField label="Segundo Nombre" value={historia?.segundo_nombre_paciente} />
                      <DataField label="Sexo" value={historia?.sexo_paciente === 'M' ? 'Masculino' : historia?.sexo_paciente === 'F' ? 'Femenino' : 'Otro'} />
                      <DataField label="Edad" value={historia?.edad_anos && `${historia.edad_anos} años`} />
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Información Institucional</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-4">
                      <DataField label="Institución" value={historia?.institucion_del_sistema} />
                      <DataField label="Establecimiento" value={historia?.establecimiento_de_salud} />
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: EVALUACIÓN CLÍNICA */}
              <TabsContent value="clinica" className="space-y-6">
                {/* Signos Vitales Detallados */}
                <Card>
                  <CardHeader>
                    <CardTitle>Constantes Vitales y Laboratorio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">
                        Registrados el {formatFecha(historia?.fecha_constantes)} a las {formatHora(historia?.hora_constantes)}
                      </p>
                    </div>
                    <dl className="grid grid-cols-3 gap-4">
                      <DataField label="Temperatura" value={historia?.temperatura && `${historia.temperatura}°C`} />
                      <DataField label="Presión Arterial (Sistólica)" value={historia?.presion_arterial_sistolica && `${historia.presion_arterial_sistolica} mmHg`} />
                      <DataField label="Presión Arterial (Diastólica)" value={historia?.presion_arterial_diastolica && `${historia.presion_arterial_diastolica} mmHg`} />
                      <DataField label="Pulso" value={historia?.pulso && `${historia.pulso} lpm`} />
                      <DataField label="Frecuencia Respiratoria" value={historia?.frecuencia_respiratoria && `${historia.frecuencia_respiratoria} rpm`} />
                      <DataField label="Peso" value={historia?.peso && `${historia.peso} kg`} />
                      <DataField label="Talla" value={historia?.talla && `${historia.talla} cm`} />
                      <DataField label="IMC" value={historia?.imc} />
                      <DataField label="Perímetro Abdominal" value={historia?.perimetro_abdominal && `${historia.perimetro_abdominal} cm`} />
                      <DataField label="Hemoglobina" value={historia?.hemoglobina && `${historia.hemoglobina} g/dL`} />
                      <DataField label="Glucosa Capilar" value={historia?.glucosa_capilar && `${historia.glucosa_capilar} mg/dL`} />
                      <DataField label="Pleusovolumétrico" value={historia?.pleusovolumerico} />
                    </dl>
                  </CardContent>
                </Card>

                {/* Revisión de Sistemas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revisión Por Sistemas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <CheckboxField label="Piel y Anexos" checked={historia?.sistema_piel_anexos} />
                      <CheckboxField label="Órganos de los Sentidos" checked={historia?.sistema_organos_sentidos} />
                      <CheckboxField label="Respiratorio" checked={historia?.sistema_respiratorio} />
                      <CheckboxField label="Cardiovascular" checked={historia?.sistema_cardiovascular} />
                      <CheckboxField label="Digestivo" checked={historia?.sistema_digestivo} />
                      <CheckboxField label="Genito Urinario" checked={historia?.sistema_genito_urinario} />
                      <CheckboxField label="Músculo Esquelético" checked={historia?.sistema_musculo_esqueletico} />
                      <CheckboxField label="Endocrino" checked={historia?.sistema_endocrino} />
                      <CheckboxField label="Hemolinfático" checked={historia?.sistema_hemo_linfatico} />
                      <CheckboxField label="Nervioso" checked={historia?.sistema_nervioso} />
                    </div>
                    {historia?.hallazgos_sistemas && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Hallazgos</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{historia.hallazgos_sistemas}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Examen Físico Detallado */}
                <Card>
                  <CardHeader>
                    <CardTitle>Examen Físico Segmentario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-4">
                      <DataField label="Piel y Faneras" value={historia?.examen_piel_panecas} full />
                      <DataField label="Cabeza" value={historia?.examen_cabeza} />
                      <DataField label="Ojos" value={historia?.examen_ojos} />
                      <DataField label="Oídos" value={historia?.examen_oidos} />
                      <DataField label="Nariz" value={historia?.examen_nariz} />
                      <DataField label="Boca" value={historia?.examen_boca} />
                      <DataField label="Cuello" value={historia?.examen_cuello} />
                      <DataField label="Garganta" value={historia?.examen_garganta} />
                      <DataField label="Axilas y Mamas" value={historia?.examen_axlas_mamas} full />
                      <DataField label="Abdomen" value={historia?.examen_abdomen_completo} full />
                      <DataField label="Urogenital" value={historia?.examen_urogenital} full />
                      <DataField label="Sistema Respiratorio" value={historia?.examen_respiratorio} full />
                      <DataField label="Sistema Vascular" value={historia?.examen_vascular} full />
                      <DataField label="Sistema Digestivo" value={historia?.examen_digestivo} full />
                      <DataField label="Sistema Hemolinfático" value={historia?.examen_hemo_linfatico} full />
                      <DataField label="Sistema Músculo-Esquelético" value={historia?.examen_esqueletico} full />
                      <DataField label="Sistema Neurológico" value={historia?.examen_neurologico} full />
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB: ANTECEDENTES */}
              <TabsContent value="antecedentes" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Antecedentes Patológicos Personales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <CheckboxField label="Cardiopatía" checked={historia?.antecedente_cardiopatia} />
                      <CheckboxField label="Hipertensión" checked={historia?.antecedente_hipertension} />
                      <CheckboxField label="Enfermedad Cardiovascular" checked={historia?.antecedente_enf_cardiovascular} />
                      <CheckboxField label="Enfermedad Endocrina" checked={historia?.antecedente_endocrino} />
                      <CheckboxField label="Cáncer" checked={historia?.antecedente_cancer} />
                      <CheckboxField label="Tuberculosis" checked={historia?.antecedente_tuberculosis} />
                      <CheckboxField label="Enfermedad Infecciosa" checked={historia?.antecedente_enf_infecciosa} />
                      <CheckboxField label="Malformación Congénita" checked={historia?.antecedente_mal_formacion} />
                    </div>
                    {historia?.antecedente_otro && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Otros Antecedentes</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{historia.antecedente_otro}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {historia?.datos_clinico_quirurgicos && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Antecedentes Clínico-Quirúrgicos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{historia.datos_clinico_quirurgicos}</p>
                    </CardContent>
                  </Card>
                )}

                {historia?.datos_obstetricos && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Antecedentes Obstétricos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{historia.datos_obstetricos}</p>
                    </CardContent>
                  </Card>
                )}

                {historia?.datos_alergicos_relevantes && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Alergias y Datos Relevantes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{historia.datos_alergicos_relevantes}</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* TAB: DIAGNÓSTICO */}
              <TabsContent value="diagnostico" className="space-y-6">
                {/* Enfermedad Actual Completa */}
                <Card>
                  <CardHeader>
                    <CardTitle>Problema Actual</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {historia?.descripcion_enfermedad && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Descripción</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{historia.descripcion_enfermedad}</p>
                      </div>
                    )}
                    <Separator />
                    <dl className="grid grid-cols-2 gap-4">
                      <DataField label="Cronología" value={historia?.cronologia} full />
                      <DataField label="Localización" value={historia?.localizacion} />
                      <DataField label="Características" value={historia?.caracteristicas} />
                      <DataField label="Factores Agravantes" value={historia?.factores_agravantes} full />
                      <DataField label="Factores de Alivio" value={historia?.factores_alivio} full />
                    </dl>
                    {(historia?.intensidad_eva !== null && historia?.intensidad_eva !== undefined) && (
                      <div className="pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Intensidad del Dolor (EVA)</h4>
                        <div className="flex items-center gap-4">
                          <div className="text-4xl font-bold text-cyan-700">{historia.intensidad_eva}</div>
                          <div className="text-gray-500 text-xl">/ 10</div>
                          <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                              style={{ width: `${(historia.intensidad_eva / 10) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Diagnósticos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Diagnóstico Principal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-lg font-semibold text-gray-900">{historia?.diagnostico_principal || "No especificado"}</p>
                      <dl className="grid grid-cols-2 gap-3">
                        <DataField label="Código CIE-10" value={historia?.codigo_diagnostico_principal} />
                        <DataField label="Clasificación" value={historia?.clasificacion_principal} />
                      </dl>
                    </div>
                  </CardContent>
                </Card>

                {historia?.diagnostico_secundario_1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Diagnóstico Secundario 1</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">{historia.diagnostico_secundario_1}</p>
                        <dl className="grid grid-cols-2 gap-3">
                          <DataField label="Código CIE-10" value={historia?.codigo_diagnostico_secundario_1} />
                          <DataField label="Clasificación" value={historia?.clasificacion_secundario_1} />
                        </dl>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {historia?.diagnostico_secundario_2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Diagnóstico Secundario 2</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-lg font-semibold text-gray-900">{historia.diagnostico_secundario_2}</p>
                        <dl className="grid grid-cols-2 gap-3">
                          <DataField label="Código CIE-10" value={historia?.codigo_diagnostico_secundario_2} />
                          <DataField label="Clasificación" value={historia?.clasificacion_secundario_2} />
                        </dl>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* TAB: PLAN */}
              <TabsContent value="plan" className="space-y-6">
                {historia?.plan_diagnostico && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Diagnóstico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{historia.plan_diagnostico}</p>
                    </CardContent>
                  </Card>
                )}

                {historia?.plan_terapeutico && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Terapéutico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{historia.plan_terapeutico}</p>
                    </CardContent>
                  </Card>
                )}

                {historia?.plan_educacional && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Plan Educacional</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">{historia.plan_educacional}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Datos del Profesional */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profesional que atiende</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-2 gap-4">
                      <DataField label="Nombre Completo" value={`${historia?.nombre_doctor || ''} ${historia?.primer_apellido_doctor || ''} ${historia?.segundo_apellido_doctor || ''}`.trim() || 'No especificado'} full />
                      <DataField label="Número de Documento" value={historia?.numero_documento_doctor} />
                    </dl>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

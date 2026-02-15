"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, X, Plus, Trash2, Search, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { codigosCIE10Traumatologia, buscarCodigosCIE10, type CodigoCIE10 } from "@/lib/data/codigos-cie10-traumatologia"
import { obtenerPlantillaPorCodigo, tienePlantilla, type Medicamento as MedicamentoPlantilla } from "@/lib/data/plantillas-tratamiento"

interface Medicamento {
  nombre: string
  presentacion: string
  dosis: string
  duracion: string
  via_administracion: string
  indicaciones: string
}

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  documento: string
  edad: number
  sexo?: string
}

export default function NuevaRecetaPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
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

  // Form data
  const [formData, setFormData] = useState({
    paciente_id: "",
    historia_clinica_id: "",
    diagnostico_principal: "",
    indicaciones_generales: "",
    recomendaciones: "",
    vigencia_dias: 30,
  })

  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([
    {
      nombre: "",
      presentacion: "",
      dosis: "",
      duracion: "",
      via_administracion: "Oral",
      indicaciones: "",
    },
  ])

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Paciente | null>(null)
  
  // Estados para selector CIE-10
  const [busquedaCIE10, setBusquedaCIE10] = useState("")
  const [codigoCIE10Seleccionado, setCodigoCIE10Seleccionado] = useState<CodigoCIE10 | null>(null)
  const [mostrarSelectorCIE10, setMostrarSelectorCIE10] = useState(false)
  
  // Filtrar códigos CIE-10 según búsqueda
  const codigosCIE10Filtrados = useMemo(() => {
    if (!busquedaCIE10 || busquedaCIE10.length < 2) {
      return codigosCIE10Traumatologia.slice(0, 20) // Mostrar primeros 20
    }
    return buscarCodigosCIE10(busquedaCIE10).slice(0, 30)
  }, [busquedaCIE10])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchPacientes(token)
      
      // Cargar datos desde URL params
      const historiaClinicaId = searchParams.get("historia_clinica_id")
      const pacienteIdParam = searchParams.get("paciente_id")
      
      if (historiaClinicaId) {
        cargarDatosDesdeHistoriaClinica(historiaClinicaId, token)
      } else if (pacienteIdParam) {
        // Preseleccionar paciente si viene desde vista de paciente
        setFormData(prev => ({ ...prev, paciente_id: pacienteIdParam }))
      }
    }
  }, [router, searchParams])

  const fetchPacientes = async (token: string) => {
    setIsLoadingPacientes(true)
    try {
      const response = await fetch("http://localhost:3001/api/pacientes", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      if (data.success && data.data) {
        setPacientes(data.data)
        
        // Si hay paciente preseleccionado, actualizar estado
        const pacienteIdParam = searchParams.get("paciente_id")
        if (pacienteIdParam) {
          const paciente = data.data.find((p: Paciente) => p.id === pacienteIdParam)
          if (paciente) {
            setPacienteSeleccionado(paciente)
          }
        }
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la lista de pacientes",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPacientes(false)
    }
  }
  
  const cargarDatosDesdeHistoriaClinica = async (historiaId: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/historias-clinicas/${historiaId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      if (data.success && data.data) {
        const hc = data.data
        
        // Autocompletar formulario con datos de HC
        setFormData(prev => ({
          ...prev,
          historia_clinica_id: historiaId,
          paciente_id: hc.paciente_id,
          diagnostico_principal: hc.diagnostico_principal || "",
          indicaciones_generales: hc.plan_terapeutico || "",
          recomendaciones: hc.recomendaciones || "",
        }))
        
        // Intentar extraer código CIE-10 del diagnóstico
        if (hc.diagnostico_principal) {
          const match = hc.diagnostico_principal.match(/([A-Z]\d{2}\.?\d?)/)
          if (match) {
            const codigoEncontrado = codigosCIE10Traumatologia.find(
              c => c.codigo === match[1] || c.codigo.replace('.', '') === match[1].replace('.', '')
            )
            if (codigoEncontrado) {
              setCodigoCIE10Seleccionado(codigoEncontrado)
            }
          }
        }
        
        toast({
          title: "Datos cargados",
          description: "Se han prellenado los datos desde la historia clínica",
        })
      }
    } catch (error) {
      console.error("Error al cargar historia clínica:", error)
      toast({
        title: "Advertencia",
        description: "No se pudieron cargar los datos de la historia clínica",
        variant: "destructive",
      })
    }
  }
  
  const aplicarPlantillaTratamiento = (codigoCIE10: CodigoCIE10) => {
    const plantilla = obtenerPlantillaPorCodigo(codigoCIE10.codigo)
    
    if (plantilla) {
      // Autocompletar diagnóstico
      setFormData(prev => ({
        ...prev,
        diagnostico_principal: `${plantilla.nombre_diagnostico} (${codigoCIE10.codigo})`,
        indicaciones_generales: plantilla.indicaciones_generales,
        recomendaciones: plantilla.recomendaciones,
      }))
      
      // Autocompletar medicamentos
      const medicamentosPlantilla: Medicamento[] = plantilla.medicamentos.map(m => ({
        nombre: m.nombre,
        presentacion: m.presentacion,
        dosis: m.dosis,
        duracion: m.duracion,
        via_administracion: m.via_administracion,
        indicaciones: m.indicaciones,
      }))
      
      setMedicamentos(medicamentosPlantilla)
      
      toast({
        title: "Plantilla aplicada",
        description: `Se ha aplicado el tratamiento sugerido para ${codigoCIE10.nombre}`,
        duration: 3000,
      })
    } else {
      // Si no hay plantilla, solo llenar el diagnóstico
      setFormData(prev => ({
        ...prev,
        diagnostico_principal: `${codigoCIE10.nombre} (${codigoCIE10.codigo})`,
      }))
      
      toast({
        title: "Código seleccionado",
        description: "No hay plantilla de tratamiento disponible para este diagnóstico",
      })
    }
  }
  
  const seleccionarCodigoCIE10 = (codigo: CodigoCIE10) => {
    setCodigoCIE10Seleccionado(codigo)
    aplicarPlantillaTratamiento(codigo)
    setMostrarSelectorCIE10(false)
    setBusquedaCIE10("")
  }

  const handlePacienteChange = (pacienteId: string) => {
    const paciente = pacientes.find(p => p.id === pacienteId)
    setPacienteSeleccionado(paciente || null)
    setFormData(prev => ({ ...prev, paciente_id: pacienteId }))
  }

  const agregarMedicamento = () => {
    setMedicamentos([
      ...medicamentos,
      {
        nombre: "",
        presentacion: "",
        dosis: "",
        duracion: "",
        via_administracion: "Oral",
        indicaciones: "",
      },
    ])
  }

  const eliminarMedicamento = (index: number) => {
    if (medicamentos.length === 1) {
      toast({
        title: "Atención",
        description: "Debe haber al menos un medicamento",
        variant: "destructive",
      })
      return
    }
    setMedicamentos(medicamentos.filter((_, i) => i !== index))
  }

  const actualizarMedicamento = (index: number, campo: keyof Medicamento, valor: string) => {
    const nuevosMedicamentos = [...medicamentos]
    nuevosMedicamentos[index][campo] = valor
    setMedicamentos(nuevosMedicamentos)
  }

  const handleGuardar = async () => {
    // Validaciones
    if (!formData.paciente_id) {
      toast({
        title: "Campo requerido",
        description: "Debe seleccionar un paciente",
        variant: "destructive",
      })
      return
    }

    if (!formData.diagnostico_principal) {
      toast({
        title: "Campo requerido",
        description: "Debe ingresar el diagnóstico principal",
        variant: "destructive",
      })
      return
    }

    // Validar medicamentos
    const medicamentosValidos = medicamentos.filter(m => 
      m.nombre && m.presentacion && m.dosis && m.duracion && m.via_administracion
    )

    if (medicamentosValidos.length === 0) {
      toast({
        title: "Medicamentos incompletos",
        description: "Debe completar al menos un medicamento con todos sus campos",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      
      const payload = {
        ...(formData.historia_clinica_id && { historia_clinica_id: formData.historia_clinica_id }),
        paciente_id: formData.paciente_id,
        diagnostico_principal: formData.diagnostico_principal,
        medicamentos: medicamentosValidos,
        indicaciones_generales: formData.indicaciones_generales || "",
        recomendaciones: formData.recomendaciones || "",
        vigencia_dias: formData.vigencia_dias,
      }

      const response = await fetch("http://localhost:3001/api/recetas", {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Éxito",
          description: `Receta ${data.data.codigo_receta} creada correctamente`,
        })
        router.push("/recetas")
      } else {
        toast({
          title: "Error al crear receta",
          description: data.message || "No se pudo crear la receta",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al crear receta:", error)
      toast({
        title: "Error al crear receta",
        description: error instanceof Error ? error.message : "No se pudo crear la receta",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Receta Médica</h1>
                  <p className="text-sm text-slate-600 mt-1">Prescripción con código CIE-10</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">HCU-form.003/2021</p>
                  <p className="text-xs text-slate-400 mt-0.5">MSP Ecuador</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Datos del Paciente */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">A. Datos del Paciente</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="paciente">Nombre Completo *</Label>
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
                        onValueChange={handlePacienteChange}
                        disabled={isLoadingPacientes}
                      >
                        <SelectTrigger id="paciente">
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
                            pacientes.map((paciente) => (
                              <SelectItem key={paciente.id} value={paciente.id}>
                                {paciente.nombres} {paciente.apellidos}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {pacienteSeleccionado && (
                      <>
                        <div>
                          <Label>Documento de Identidad</Label>
                          <Input value={pacienteSeleccionado.documento} disabled className="mt-2 bg-slate-50" />
                        </div>
                        <div>
                          <Label>Sexo</Label>
                          <Input value={pacienteSeleccionado.sexo || "N/A"} disabled className="mt-2 bg-slate-50" />
                        </div>
                        <div>
                          <Label>Edad</Label>
                          <Input value={`${pacienteSeleccionado.edad} años`} disabled className="mt-2 bg-slate-50" />
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Datos del Doctor */}
              {user && (
                <Card className="border border-slate-300 rounded">
                  <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                    <CardTitle className="text-base font-semibold text-slate-900">B. Datos del Médico Prescriptor</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre del Doctor</Label>
                        <Input 
                          value={`${user.nombre || ""} ${user.apellido || ""}`} 
                          disabled 
                          className="mt-2 bg-slate-50" 
                        />
                      </div>
                      <div>
                        <Label>Registro Médico</Label>
                        <Input 
                          value={user.numero_registro_medico || "N/A"} 
                          disabled 
                          className="mt-2 bg-slate-50" 
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Diagnóstico con Selector CIE-10 */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900">C. Diagnóstico Principal (CIE-10)</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMostrarSelectorCIE10(!mostrarSelectorCIE10)}
                      className="gap-2 h-9 text-sm border-slate-300 hover:border-cyan-600 hover:bg-cyan-50 transition-colors"
                    >
                      <Search className="h-4 w-4" />
                      {mostrarSelectorCIE10 ? "Cerrar" : "Buscar"} Catálogo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Selector CIE-10 */}
                  {mostrarSelectorCIE10 && (
                    <div className="border border-cyan-200 rounded p-4 bg-slate-50">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded bg-cyan-100 flex items-center justify-center">
                          <Search className="h-4 w-4 text-cyan-700" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-900">Catálogo CIE-10 Traumatología</h3>
                          <p className="text-xs text-slate-600">80 códigos más frecuentes en trauma</p>
                        </div>
                      </div>
                      
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={busquedaCIE10}
                          onChange={(e) => setBusquedaCIE10(e.target.value)}
                          placeholder="Buscar por código o descripción..."
                          className="pl-10 bg-white h-10 border-slate-300 focus:border-cyan-600"
                        />
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto space-y-1 border border-slate-300 rounded bg-white p-2">
                        {codigosCIE10Filtrados.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm text-slate-500">No se encontraron códigos</p>
                            <p className="text-xs text-slate-400 mt-1">Intente con otros términos de búsqueda</p>
                          </div>
                        ) : (
                          codigosCIE10Filtrados.map((codigo) => {
                            const tieneTemplate = tienePlantilla(codigo.codigo)
                            return (
                              <button
                                key={codigo.codigo}
                                type="button"
                                onClick={() => seleccionarCodigoCIE10(codigo)}
                                className="w-full text-left p-2.5 rounded border border-slate-200 hover:border-cyan-600 hover:bg-cyan-50 transition-all group"
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0 pt-0.5">
                                    <span className="inline-block font-mono text-xs font-semibold text-cyan-700 bg-cyan-50 px-2 py-1 rounded border border-cyan-200">
                                      {codigo.codigo}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                      <p className="text-sm font-medium text-slate-900 truncate">{codigo.nombre}</p>
                                      {tieneTemplate && (
                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                                          <Sparkles className="h-3 w-3" />
                                          Plantilla
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-slate-600 line-clamp-1">{codigo.descripcion}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{codigo.categoria}</p>
                                  </div>
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                      
                      <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 rounded">
                        <p className="text-xs text-emerald-900">
                          <span className="font-semibold">💊 Plantilla disponible:</span> Autocompletará medicamentos y recomendaciones según protocolo
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Código seleccionado */}
                  {codigoCIE10Seleccionado && (
                    <div className="border border-cyan-300 rounded bg-cyan-50 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 rounded bg-cyan-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-cyan-900 uppercase tracking-wide">Código seleccionado</p>
                            <p className="font-mono text-sm font-semibold text-cyan-700 mt-0.5">
                              {codigoCIE10Seleccionado.codigo}
                            </p>
                            <p className="text-xs text-slate-700 mt-0.5">{codigoCIE10Seleccionado.nombre}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCodigoCIE10Seleccionado(null)}
                          className="text-slate-500 hover:text-slate-900 hover:bg-white flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Campo de diagnóstico */}
                  <div>
                    <Label htmlFor="diagnostico" className="mb-2 block">Diagnóstico Principal *</Label>
                    <Textarea
                      id="diagnostico"
                      value={formData.diagnostico_principal}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnostico_principal: e.target.value }))}
                      placeholder="Ej: Esguince de tobillo grado II (S93.4)"
                      rows={2}
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      Puede editar el diagnóstico o escribirlo manualmente
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Medicamentos */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6 flex flex-row items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">D. Prescripción de Medicamentos</CardTitle>
                  <Button
                    onClick={agregarMedicamento}
                    variant="outline"
                    size="sm"
                    className="gap-2 h-9 border-slate-300 hover:border-slate-400 hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar
                  </Button>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {medicamentos.map((medicamento, index) => (
                      <div key={index} className="p-4 border border-slate-300 rounded bg-slate-50 relative">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Medicamento {index + 1}
                          </span>
                          <Button
                            onClick={() => eliminarMedicamento(index)}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Eliminar medicamento"
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Eliminar
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Presentación *</Label>
                            <Select
                              value={medicamento.presentacion}
                              onValueChange={(value) => actualizarMedicamento(index, 'presentacion', value)}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Seleccionar presentación" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tableta">Tableta</SelectItem>
                                <SelectItem value="Cápsula">Cápsula</SelectItem>
                                <SelectItem value="Jarabe">Jarabe</SelectItem>
                                <SelectItem value="Suspensión">Suspensión</SelectItem>
                                <SelectItem value="Solución">Solución</SelectItem>
                                <SelectItem value="Crema">Crema</SelectItem>
                                <SelectItem value="Gel">Gel</SelectItem>
                                <SelectItem value="Pomada">Pomada</SelectItem>
                                <SelectItem value="Inyectable">Inyectable</SelectItem>
                                <SelectItem value="Parche">Parche</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Nombre Completo *</Label>
                            <Input
                              value={medicamento.nombre}
                              onChange={(e) => actualizarMedicamento(index, 'nombre', e.target.value)}
                              placeholder="Ej: Ibuprofeno 600mg"
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Dosis *</Label>
                            <Input
                              value={medicamento.dosis}
                              onChange={(e) => actualizarMedicamento(index, 'dosis', e.target.value)}
                              placeholder="Ej: 1 tableta cada 8 horas"
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Duración *</Label>
                            <Input
                              value={medicamento.duracion}
                              onChange={(e) => actualizarMedicamento(index, 'duracion', e.target.value)}
                              placeholder="Ej: 7 días"
                              className="mt-2"
                            />
                          </div>

                          <div>
                            <Label>Vía *</Label>
                            <Select
                              value={medicamento.via_administracion}
                              onValueChange={(value) => actualizarMedicamento(index, 'via_administracion', value)}
                            >
                              <SelectTrigger className="mt-2">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Oral">Oral</SelectItem>
                                <SelectItem value="Tópica">Tópica</SelectItem>
                                <SelectItem value="Intramuscular">Intramuscular</SelectItem>
                                <SelectItem value="Intravenosa">Intravenosa</SelectItem>
                                <SelectItem value="Subcutánea">Subcutánea</SelectItem>
                                <SelectItem value="Inhalatoria">Inhalatoria</SelectItem>
                                <SelectItem value="Rectal">Rectal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Indicaciones</Label>
                            <Input
                              value={medicamento.indicaciones}
                              onChange={(e) => actualizarMedicamento(index, 'indicaciones', e.target.value)}
                              placeholder="Ej: Tomar con alimentos"
                              className="mt-2"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Indicaciones y Recomendaciones */}
              <Card className="border border-slate-300 rounded">
                <CardHeader className="border-b border-slate-200 border-l-4 border-l-cyan-600 bg-slate-50 py-3 px-6">
                  <CardTitle className="text-base font-semibold text-slate-900">E. Indicaciones y Recomendaciones</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <Label htmlFor="indicaciones" className="mb-2 block">Indicaciones Generales</Label>
                    <Textarea
                      id="indicaciones"
                      value={formData.indicaciones_generales}
                      onChange={(e) => setFormData(prev => ({ ...prev, indicaciones_generales: e.target.value }))}
                      placeholder="Indicaciones generales para el tratamiento..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="recomendaciones" className="mb-2 block">Recomendaciones</Label>
                    <Textarea
                      id="recomendaciones"
                      value={formData.recomendaciones}
                      onChange={(e) => setFormData(prev => ({ ...prev, recomendaciones: e.target.value }))}
                      placeholder="Recomendaciones adicionales para el paciente..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="vigencia" className="mb-2 block">Vigencia (días)</Label>
                    <Input
                      id="vigencia"
                      type="number"
                      value={formData.vigencia_dias}
                      onChange={(e) => setFormData(prev => ({ ...prev, vigencia_dias: parseInt(e.target.value) || 30 }))}
                      min="1"
                      max="90"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Botones de Acción */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-300">
                <p className="text-xs text-slate-500">
                  * Campos obligatorios según normativa MSP-HCU
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/recetas")}
                    className="gap-2 h-10 border-slate-300 hover:border-slate-400 hover:bg-slate-50"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleGuardar}
                    disabled={isSaving}
                    className="gap-2 h-10 bg-cyan-600 hover:bg-cyan-700 border border-cyan-600"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Guardando..." : "Emitir Receta"}
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

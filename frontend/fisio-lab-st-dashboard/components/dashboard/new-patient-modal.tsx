"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { CalendarIcon, Loader2, User, Heart, Briefcase, FileText, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"

interface NewPatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewPatientModal({ open, onOpenChange }: NewPatientModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"personal" | "medical" | "work" | "notes">("personal")
  
  // Datos Personales
  const [nombres, setNombres] = useState("")
  const [apellidos, setApellidos] = useState("")
  const [tipoDocumento, setTipoDocumento] = useState("")
  const [documento, setDocumento] = useState("")
  const [fechaNacimiento, setFechaNacimiento] = useState<Date>()
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date())
  const [sexo, setSexo] = useState("")
  const [celular, setCelular] = useState("")
  const [email, setEmail] = useState("")
  const [direccion, setDireccion] = useState("")
  
  // Contacto de Emergencia
  const [emergenciaNombre, setEmergenciaNombre] = useState("")
  const [emergenciaTelefono, setEmergenciaTelefono] = useState("")
  
  // Información Laboral
  const [profesion, setProfesion] = useState("")
  const [tipoTrabajo, setTipoTrabajo] = useState("")
  
  // Antecedentes Médicos
  const [antecedentes, setAntecedentes] = useState<string[]>([])
  const [detallesAntecedentes, setDetallesAntecedentes] = useState<Record<string, string>>({})
  
  // Notas
  const [notas, setNotas] = useState("")
  
  // Validación de errores
  const [errors, setErrors] = useState<Record<string, string>>({})

  const ANTECEDENTES_OPTIONS = [
    { id: "cancer", label: "Cáncer", requiresDetail: true },
    { id: "hemopatias", label: "Hemopatías", requiresDetail: true },
    { id: "diabetes", label: "Diabetes", requiresDetail: false },
    { id: "hipertension", label: "Hipertensión arterial", requiresDetail: false },
    { id: "problemas_cardiacos", label: "Problemas cardíacos", requiresDetail: true },
    { id: "marcapasos", label: "Marcapasos", requiresDetail: false },
    { id: "embarazo", label: "Embarazo", requiresDetail: false },
    { id: "epilepsia", label: "Epilepsia", requiresDetail: false },
    { id: "alergias", label: "Alergias", requiresDetail: true },
    { id: "problemas_tiroideos", label: "Problemas tiroideos", requiresDetail: true },
    { id: "osteoporosis", label: "Osteoporosis", requiresDetail: false },
    { id: "cirugias", label: "Cirugías recientes", requiresDetail: true },
    { id: "protesis", label: "Prótesis metálicas", requiresDetail: true },
    { id: "infecciones", label: "Infecciones activas", requiresDetail: true },
    { id: "trombosis", label: "Trombosis", requiresDetail: true },
    { id: "otra", label: "Otra patología", requiresDetail: true },
  ]

  const tabs = [
    { id: "personal" as const, label: "Datos Personales", icon: User },
    { id: "medical" as const, label: "Antecedentes", icon: Heart },
    { id: "work" as const, label: "Info. Laboral", icon: Briefcase },
    { id: "notes" as const, label: "Notas", icon: FileText },
  ]

  const toggleAntecedente = (antecedenteId: string) => {
    setAntecedentes(prev => {
      const newSelection = prev.includes(antecedenteId)
        ? prev.filter(a => a !== antecedenteId)
        : [...prev, antecedenteId]
      
      if (prev.includes(antecedenteId)) {
        const newDetalles = { ...detallesAntecedentes }
        delete newDetalles[antecedenteId]
        setDetallesAntecedentes(newDetalles)
      }
      
      return newSelection
    })
  }

  const handleDetalleChange = (antecedenteId: string, value: string) => {
    setDetallesAntecedentes(prev => ({
      ...prev,
      [antecedenteId]: value
    }))
  }

  const calcularEdad = (fecha: Date) => {
    const hoy = new Date()
    let edad = hoy.getFullYear() - fecha.getFullYear()
    const mes = hoy.getMonth() - fecha.getMonth()
    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--
    }
    return edad
  }

  const validateField = (field: string, value: any) => {
    const newErrors = { ...errors }
    
    switch (field) {
      case "nombres":
        if (!value.trim()) newErrors.nombres = "El nombre es requerido"
        else delete newErrors.nombres
        break
      case "apellidos":
        if (!value.trim()) newErrors.apellidos = "Los apellidos son requeridos"
        else delete newErrors.apellidos
        break
      case "documento":
        if (!value.trim()) newErrors.documento = "El documento es requerido"
        else if (value.trim().length < 6) newErrors.documento = "Debe tener al menos 6 caracteres"
        else delete newErrors.documento
        break
      case "celular":
        if (!value.trim()) newErrors.celular = "El celular es requerido"
        else if (value.trim().length < 9) newErrors.celular = "Debe tener al menos 9 dígitos"
        else delete newErrors.celular
        break
      case "email":
        if (value && !value.includes('@')) newErrors.email = "Email inválido"
        else delete newErrors.email
        break
    }
    
    setErrors(newErrors)
  }

  const handleSubmit = async () => {
    if (!nombres.trim() || !apellidos.trim() || !documento.trim() || !celular.trim() || !fechaNacimiento || !sexo || !tipoDocumento) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios marcados con *",
        variant: "destructive",
      })
      setActiveTab("personal")
      return
    }

    if (documento.trim().length < 6) {
      toast({
        title: "Documento inválido",
        description: "El documento debe tener al menos 6 caracteres",
        variant: "destructive",
      })
      setActiveTab("personal")
      return
    }

    if (celular.trim().length < 9) {
      toast({
        title: "Celular inválido",
        description: "El celular debe tener al menos 9 dígitos",
        variant: "destructive",
      })
      setActiveTab("personal")
      return
    }

    if (email && !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor ingrese un email válido",
        variant: "destructive",
      })
      setActiveTab("personal")
      return
    }

    const antecedentesConDetalleRequerido = ANTECEDENTES_OPTIONS.filter(
      ant => ant.requiresDetail && antecedentes.includes(ant.id)
    )
    
    const faltanDetalles = antecedentesConDetalleRequerido.some(
      ant => !detallesAntecedentes[ant.id]?.trim()
    )

    if (faltanDetalles) {
      toast({
        title: "Información incompleta",
        description: "Por favor especifica los detalles de los antecedentes médicos seleccionados",
        variant: "destructive",
      })
      setActiveTab("medical")
      return
    }

    setLoading(true)
    try {
      const edad = fechaNacimiento ? calcularEdad(fechaNacimiento) : 0
      
      const antecedentesTexto = antecedentes.map(id => {
        const opcion = ANTECEDENTES_OPTIONS.find(opt => opt.id === id)
        const detalle = detallesAntecedentes[id]
        return detalle ? `${opcion?.label}: ${detalle}` : opcion?.label
      }).join(", ")
      
      const pacienteData = {
        nombres,
        apellidos,
        tipo_documento: tipoDocumento,
        documento,
        fecha_nacimiento: fechaNacimiento ? format(fechaNacimiento, "yyyy-MM-dd") : "",
        edad,
        sexo,
        celular,
        email: email || null,
        direccion: direccion || null,
        emergencia_nombre: emergenciaNombre || null,
        emergencia_telefono: emergenciaTelefono || null,
        profesion: profesion || null,
        tipo_trabajo: tipoTrabajo || null,
        antecedentes_medicos: antecedentesTexto || null,
        notas: notas || null,
        activo: true,
      }

      const response = await fetch("http://localhost:3001/api/pacientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pacienteData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.message && (result.message.includes('duplicate key') || result.message.includes('already exists'))) {
          toast({
            title: "Documento duplicado",
            description: `Ya existe un paciente registrado con el documento ${documento}`,
            variant: "destructive",
          })
          return
        }
        
        throw new Error(result.message || "Error al crear paciente")
      }

      resetForm()
      
      toast({
        title: "Paciente creado exitosamente",
        description: `${nombres} ${apellidos} ha sido registrado en el sistema.`,
      })
      
      onOpenChange(false)
      
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error al crear paciente",
        description: error.message || "Por favor, verifique los datos e intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setNombres("")
    setApellidos("")
    setTipoDocumento("")
    setDocumento("")
    setFechaNacimiento(undefined)
    setSexo("")
    setCelular("")
    setEmail("")
    setDireccion("")
    setEmergenciaNombre("")
    setEmergenciaTelefono("")
    setProfesion("")
    setTipoTrabajo("")
    setAntecedentes([])
    setDetallesAntecedentes({})
    setNotas("")
    setActiveTab("personal")
    setErrors({})
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-4xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0"
        showCloseButton={true}
      >
        <DialogHeader className="pb-4 border-b border-slate-200 px-6 pt-6">
          <DialogTitle className="text-lg font-semibold text-slate-900">Registrar Nuevo Paciente</DialogTitle>
        </DialogHeader>

        {/* Tabs Navigation */}
        <div className="flex gap-1 border-b border-slate-200 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative",
                  isActive
                    ? "text-slate-900"
                    : "text-slate-500 hover:text-slate-700"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                )}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto py-6 px-6">
          {/* TAB 1: DATOS PERSONALES */}
          {activeTab === "personal" && (
            <div className="space-y-5 max-w-3xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nombres" className="text-sm font-medium text-slate-700">
                    Nombres <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="nombres"
                    value={nombres}
                    onChange={(e) => {
                      setNombres(e.target.value)
                      validateField("nombres", e.target.value)
                    }}
                    onBlur={(e) => validateField("nombres", e.target.value)}
                    placeholder="Juan Carlos"
                    className={cn(
                      "h-10",
                      errors.nombres && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.nombres && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.nombres}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="apellidos" className="text-sm font-medium text-slate-700">
                    Apellidos <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="apellidos"
                    value={apellidos}
                    onChange={(e) => {
                      setApellidos(e.target.value)
                      validateField("apellidos", e.target.value)
                    }}
                    onBlur={(e) => validateField("apellidos", e.target.value)}
                    placeholder="Pérez Gómez"
                    className={cn(
                      "h-10",
                      errors.apellidos && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.apellidos && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.apellidos}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="tipo_documento" className="text-sm font-medium text-slate-700">
                    Tipo de Documento <span className="text-red-600">*</span>
                  </Label>
                  <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DNI">DNI</SelectItem>
                      <SelectItem value="CarnetExtranjeria">Carné de Extranjería</SelectItem>
                      <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="documento" className="text-sm font-medium text-slate-700">
                    Número de Documento <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="documento"
                    value={documento}
                    onChange={(e) => {
                      setDocumento(e.target.value)
                      validateField("documento", e.target.value)
                    }}
                    onBlur={(e) => validateField("documento", e.target.value)}
                    placeholder="12345678"
                    className={cn(
                      "h-10",
                      errors.documento && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.documento && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.documento}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-slate-700">
                    Fecha de Nacimiento <span className="text-red-600">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full h-10 justify-start text-left font-normal",
                          !fechaNacimiento && "text-slate-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fechaNacimiento ? format(fechaNacimiento, "dd/MM/yyyy", { locale: es }) : "Seleccionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 border-b space-y-2">
                        <div className="flex gap-2">
                          <Select
                            value={calendarMonth.getMonth().toString()}
                            onValueChange={(value) => {
                              const newDate = new Date(calendarMonth)
                              newDate.setMonth(parseInt(value))
                              setCalendarMonth(newDate)
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"].map((mes, i) => (
                                <SelectItem key={i} value={i.toString()}>{mes}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={calendarMonth.getFullYear().toString()}
                            onValueChange={(value) => {
                              const newDate = new Date(calendarMonth)
                              newDate.setFullYear(parseInt(value))
                              setCalendarMonth(newDate)
                            }}
                          >
                            <SelectTrigger className="h-9 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 100 }, (_, i) => {
                                const year = new Date().getFullYear() - i
                                return <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Calendar
                        mode="single"
                        selected={fechaNacimiento}
                        onSelect={setFechaNacimiento}
                        month={calendarMonth}
                        onMonthChange={setCalendarMonth}
                        locale={es}
                        disabled={(date) => date > new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edad" className="text-sm font-medium text-slate-700">
                    Edad <span className="text-xs text-slate-500 font-normal">(automático)</span>
                  </Label>
                  <Input
                    id="edad"
                    value={fechaNacimiento ? calcularEdad(fechaNacimiento) + " años" : ""}
                    disabled
                    className="h-10 bg-slate-50 text-slate-600"
                    placeholder="--"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="sexo" className="text-sm font-medium text-slate-700">
                    Sexo <span className="text-red-600">*</span>
                  </Label>
                  <Select value={sexo} onValueChange={setSexo}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="celular" className="text-sm font-medium text-slate-700">
                    Celular <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="celular"
                    type="tel"
                    value={celular}
                    onChange={(e) => {
                      setCelular(e.target.value)
                      validateField("celular", e.target.value)
                    }}
                    onBlur={(e) => validateField("celular", e.target.value)}
                    placeholder="999888777"
                    className={cn(
                      "h-10",
                      errors.celular && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  {errors.celular && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.celular}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    validateField("email", e.target.value)
                  }}
                  onBlur={(e) => validateField("email", e.target.value)}
                  placeholder="correo@ejemplo.com"
                  className={cn(
                    "h-10",
                    errors.email && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="direccion" className="text-sm font-medium text-slate-700">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Av. Siempre Viva 123, Distrito"
                  className="h-10"
                />
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-4">Contacto de Emergencia</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="emergencia_nombre" className="text-sm font-medium text-slate-700">
                      Nombre completo
                    </Label>
                    <Input
                      id="emergencia_nombre"
                      value={emergenciaNombre}
                      onChange={(e) => setEmergenciaNombre(e.target.value)}
                      placeholder="María Pérez"
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="emergencia_telefono" className="text-sm font-medium text-slate-700">
                      Teléfono
                    </Label>
                    <Input
                      id="emergencia_telefono"
                      type="tel"
                      value={emergenciaTelefono}
                      onChange={(e) => setEmergenciaTelefono(e.target.value)}
                      placeholder="987654321"
                      className="h-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANTECEDENTES */}
          {activeTab === "medical" && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <p className="text-sm text-slate-600 mb-4">Selecciona todos los antecedentes médicos que apliquen al paciente</p>
                
                <div className="space-y-3">
                  {ANTECEDENTES_OPTIONS.map((opcion) => (
                    <label
                      key={opcion.id}
                      className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <Checkbox
                        id={opcion.id}
                        checked={antecedentes.includes(opcion.id)}
                        onCheckedChange={() => toggleAntecedente(opcion.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-slate-900">{opcion.label}</span>
                        {opcion.requiresDetail && antecedentes.includes(opcion.id) && (
                          <Input
                            placeholder={`Especifica detalles: ${
                              opcion.id === 'cancer' ? 'ej. Cáncer de mama en remisión' :
                              opcion.id === 'alergias' ? 'ej. Penicilina, mariscos' :
                              opcion.id === 'cirugias' ? 'ej. Apendicectomía 2023' :
                              opcion.id === 'otra' ? 'ej. Especifica la patología' :
                              'Proporciona más información'
                            }`}
                            value={detallesAntecedentes[opcion.id] || ""}
                            onChange={(e) => handleDetalleChange(opcion.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 h-9 text-sm"
                          />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INFO LABORAL */}
          {activeTab === "work" && (
            <div className="space-y-5 max-w-3xl">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="profesion" className="text-sm font-medium text-slate-700">
                    Profesión
                  </Label>
                  <Input
                    id="profesion"
                    value={profesion}
                    onChange={(e) => setProfesion(e.target.value)}
                    placeholder="Enfermera, Ingeniero, etc."
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tipo_trabajo" className="text-sm font-medium text-slate-700">
                    Tipo de Trabajo
                  </Label>
                  <Input
                    id="tipo_trabajo"
                    value={tipoTrabajo}
                    onChange={(e) => setTipoTrabajo(e.target.value)}
                    placeholder="Turnos rotativos, Oficina, etc."
                    className="h-10"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: NOTAS */}
          {activeTab === "notes" && (
            <div className="space-y-5 max-w-3xl">
              <div className="space-y-1.5">
                <Label htmlFor="notas" className="text-sm font-medium text-slate-700">
                  ¿Cómo se enteró de Fisiolab ST?
                </Label>
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  placeholder="Ej. Recomendación de un amigo, Instagram, Google, volante, etc."
                  rows={6}
                  className="resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 px-6 pb-6">
          <p className="text-xs text-slate-500">
            <span className="text-red-600">*</span> Campos obligatorios
          </p>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                resetForm()
                onOpenChange(false)
              }} 
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading} 
              className="bg-slate-900 hover:bg-slate-800"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Crear Paciente"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

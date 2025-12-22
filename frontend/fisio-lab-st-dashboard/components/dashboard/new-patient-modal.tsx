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
import { CalendarIcon, Loader2 } from "lucide-react"
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

  const toggleAntecedente = (antecedenteId: string) => {
    setAntecedentes(prev => {
      const newSelection = prev.includes(antecedenteId)
        ? prev.filter(a => a !== antecedenteId)
        : [...prev, antecedenteId]
      
      // Si se desmarca, limpiar el detalle
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

  const handleSubmit = async () => {
    // Validaciones básicas
    if (!nombres || !apellidos || !documento || !celular || !fechaNacimiento || !sexo || !tipoDocumento) {
      toast({
        title: "Campos requeridos",
        description: "Por favor complete todos los campos obligatorios marcados con *",
        variant: "destructive",
      })
      return
    }

    // Validar que los antecedentes que requieren detalle lo tengan
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
      return
    }

    setLoading(true)
    try {
      const edad = fechaNacimiento ? calcularEdad(fechaNacimiento) : 0
      
      // Construir el texto de antecedentes con detalles
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
        throw new Error(result.message || "Error al crear paciente")
      }

      // Resetear formulario
      resetForm()
      onOpenChange(false)
      
      // Mostrar mensaje de éxito
      toast({
        title: "¡Paciente creado exitosamente!",
        description: `${nombres} ${apellidos} ha sido registrado en el sistema.`,
      })
      
      // Recargar la página para actualizar la lista
      window.location.reload()
      
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
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Nuevo Paciente</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-emerald-500 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-800">Datos Personales</h3>
            </div>
            
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 space-y-2">
                <Label htmlFor="nombres" className="text-sm font-medium">
                  Nombres <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombres"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej. Juan Carlos"
                  className="h-10"
                />
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="apellidos" className="text-sm font-medium">
                  Apellidos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ej. Pérez Gómez"
                  className="h-10"
                />
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="tipo_documento" className="text-sm font-medium">
                  Tipo de Documento <span className="text-red-500">*</span>
                </Label>
                <Select value={tipoDocumento} onValueChange={setTipoDocumento}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DNI">DNI</SelectItem>
                    <SelectItem value="CarnetExtranjeria">Carné de Extranjería</SelectItem>
                    <SelectItem value="Pasaporte">Pasaporte</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="documento" className="text-sm font-medium">
                  Número de Documento <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="documento"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                  placeholder="Ej. 12345678"
                  className="h-10"
                />
              </div>

              <div className="col-span-6 space-y-2">
                <Label className="text-sm font-medium">
                  Fecha de Nacimiento <span className="text-red-500">*</span>
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full h-10 justify-start text-left font-normal",
                        !fechaNacimiento && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fechaNacimiento ? format(fechaNacimiento, "PPP", { locale: es }) : "Seleccione fecha"}
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
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Enero</SelectItem>
                            <SelectItem value="1">Febrero</SelectItem>
                            <SelectItem value="2">Marzo</SelectItem>
                            <SelectItem value="3">Abril</SelectItem>
                            <SelectItem value="4">Mayo</SelectItem>
                            <SelectItem value="5">Junio</SelectItem>
                            <SelectItem value="6">Julio</SelectItem>
                            <SelectItem value="7">Agosto</SelectItem>
                            <SelectItem value="8">Septiembre</SelectItem>
                            <SelectItem value="9">Octubre</SelectItem>
                            <SelectItem value="10">Noviembre</SelectItem>
                            <SelectItem value="11">Diciembre</SelectItem>
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
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 100 }, (_, i) => {
                              const year = new Date().getFullYear() - i
                              return (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              )
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
                      defaultMonth={calendarMonth}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="edad" className="text-sm font-medium flex items-center gap-2">
                  Edad
                  <span className="text-xs text-gray-500 font-normal">(Se calcula automáticamente)</span>
                </Label>
                <Input
                  id="edad"
                  value={fechaNacimiento ? calcularEdad(fechaNacimiento) : ""}
                  disabled
                  className="h-10 bg-gray-50"
                  placeholder="--"
                />
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="sexo" className="text-sm font-medium">
                  Sexo <span className="text-red-500">*</span>
                </Label>
                <Select value={sexo} onValueChange={setSexo}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculino</SelectItem>
                    <SelectItem value="F">Femenino</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="celular" className="text-sm font-medium">
                  Celular / WhatsApp <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="celular"
                  type="tel"
                  value={celular}
                  onChange={(e) => setCelular(e.target.value)}
                  placeholder="Ej. 999888777"
                  className="h-10"
                />
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej. juan.perez@example.com"
                  className="h-10"
                />
              </div>

              <div className="col-span-12 space-y-2">
                <Label htmlFor="direccion" className="text-sm font-medium">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Av. Siempre Viva 123, Surco"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SECCIÓN 2: CONTACTO DE EMERGENCIA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-orange-500 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-800">Contacto de Emergencia</h3>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-7 space-y-2">
                <Label htmlFor="emergencia_nombre" className="text-sm font-medium">
                  Nombre completo
                </Label>
                <Input
                  id="emergencia_nombre"
                  value={emergenciaNombre}
                  onChange={(e) => setEmergenciaNombre(e.target.value)}
                  placeholder="Ej. María Pérez"
                  className="h-10"
                />
              </div>

              <div className="col-span-5 space-y-2">
                <Label htmlFor="emergencia_telefono" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="emergencia_telefono"
                  type="tel"
                  value={emergenciaTelefono}
                  onChange={(e) => setEmergenciaTelefono(e.target.value)}
                  placeholder="Ej. 987654321"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SECCIÓN 3: INFORMACIÓN LABORAL */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-[#4BA4F2] rounded-full" />
              <h3 className="text-lg font-semibold text-gray-800">Información Laboral</h3>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-6 space-y-2">
                <Label htmlFor="profesion" className="text-sm font-medium">
                  Profesión
                </Label>
                <Input
                  id="profesion"
                  value={profesion}
                  onChange={(e) => setProfesion(e.target.value)}
                  placeholder="Ej. Enfermera, Ingeniero, etc."
                  className="h-10"
                />
              </div>

              <div className="col-span-6 space-y-2">
                <Label htmlFor="tipo_trabajo" className="text-sm font-medium">
                  Tipo de Trabajo
                </Label>
                <Input
                  id="tipo_trabajo"
                  value={tipoTrabajo}
                  onChange={(e) => setTipoTrabajo(e.target.value)}
                  placeholder="Ej. Turnos rotativos, Oficina, etc."
                  className="h-10"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* SECCIÓN 4: ANTECEDENTES MÉDICOS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-red-500 rounded-full" />
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Antecedentes Médicos Relevantes</h3>
                <p className="text-sm text-gray-600">Marque todos los que apliquen al paciente</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Grid de opciones */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                {ANTECEDENTES_OPTIONS.map((opcion) => (
                  <div key={opcion.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={opcion.id}
                      checked={antecedentes.includes(opcion.id)}
                      onCheckedChange={() => toggleAntecedente(opcion.id)}
                    />
                    <Label
                      htmlFor={opcion.id}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {opcion.label}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Inputs de detalle para antecedentes seleccionados */}
              {antecedentes.some(id => ANTECEDENTES_OPTIONS.find(opt => opt.id === id)?.requiresDetail) && (
                <div className="space-y-3 p-4 bg-[#F0E6FF] border border-[#D466F2] rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-1 bg-[#D466F2] rounded-full" />
                    <p className="text-sm font-medium text-[#8B3AB8]">Especifique los detalles de los antecedentes seleccionados:</p>
                  </div>
                  
                  {ANTECEDENTES_OPTIONS.filter(opt => opt.requiresDetail && antecedentes.includes(opt.id)).map((opcion) => (
                    <div key={`detalle-${opcion.id}`} className="space-y-1.5">
                      <Label htmlFor={`detalle-${opcion.id}`} className="text-sm font-medium text-gray-700">
                        {opcion.label}
                      </Label>
                      <Input
                        id={`detalle-${opcion.id}`}
                        placeholder={`Ej: ${
                          opcion.id === 'cancer' ? 'Cáncer de mama en remisión' :
                          opcion.id === 'alergias' ? 'Penicilina, mariscos' :
                          opcion.id === 'cirugias' ? 'Apendicectomía 2023' :
                          opcion.id === 'otra' ? 'Especifique la patología' :
                          `Detalles de ${opcion.label.toLowerCase()}`
                        }`}
                        value={detallesAntecedentes[opcion.id] || ""}
                        onChange={(e) => handleDetalleChange(opcion.id, e.target.value)}
                        className="bg-white border-[#D466F2] focus:border-[#D466F2] focus:ring-[#D466F2]"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* SECCIÓN 5: NOTAS ADICIONALES */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 bg-purple-500 rounded-full" />
              <h3 className="text-lg font-semibold text-gray-800">Notas Adicionales</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas" className="text-sm font-medium">
                ¿Cómo se enteró de las terapias de Fisiolab ST?
              </Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej. Recomendación de un amigo, Instagram, Google, volante, etc."
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
        </div>

        {/* FOOTER CON BOTONES */}
        <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm()
              onOpenChange(false)
            }} 
            disabled={loading}
            className="px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="bg-[#0AA640] hover:bg-[#098A36] px-6"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Guardando..." : "Crear Paciente"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

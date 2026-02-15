"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NuevoPacientePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState<{ documento: boolean; email: boolean }>({ documento: false, email: false })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [duplicateInfo, setDuplicateInfo] = useState<{
    documento: { id: string; nombre: string } | null
    email: { id: string; nombre: string } | null
  }>({ documento: null, email: null })

  const [formData, setFormData] = useState({
    nombres: "",
    apellidos: "",
    tipo_documento: "DNI",
    documento: "",
    fecha_nacimiento: "",
    sexo: "",
    celular: "",
    email: "",
    direccion: "",
    emergencia_nombre: "",
    emergencia_telefono: "",
  })

  const validateField = (name: string, value: string) => {
    if (name === "nombres" && !value.trim()) return "Los nombres son obligatorios"
    if (name === "apellidos" && !value.trim()) return "Los apellidos son obligatorios"
    if (name === "documento" && !value.trim()) return "El documento es obligatorio"
    if (name === "documento" && value.trim().length < 6) return "Mínimo 6 caracteres"
    if (name === "celular" && !value.trim()) return "El celular es obligatorio"
    if (name === "celular" && value.trim().length < 9) return "Mínimo 9 dígitos"
    if (name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Formato de email inválido"
    }
    return ""
  }

  const checkDocumentoDuplicado = async (documento: string) => {
    if (!documento || documento.length < 6) return

    setValidating(prev => ({ ...prev, documento: true }))
    try {
      const response = await fetch(`http://localhost:3001/api/pacientes?q=${encodeURIComponent(documento)}`)
      const data = await response.json()
      
      if (data.success && data.data && data.data.length > 0) {
        const pacienteExistente = data.data.find((p: any) => p.documento === documento)
        if (pacienteExistente) {
          setDuplicateInfo(prev => ({
            ...prev,
            documento: {
              id: pacienteExistente.id,
              nombre: `${pacienteExistente.nombres} ${pacienteExistente.apellidos}`
            }
          }))
        } else {
          setDuplicateInfo(prev => ({ ...prev, documento: null }))
        }
      } else {
        setDuplicateInfo(prev => ({ ...prev, documento: null }))
      }
    } catch (error) {
      console.error("Error verificando documento:", error)
    } finally {
      setValidating(prev => ({ ...prev, documento: false }))
    }
  }

  const checkEmailDuplicado = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

    setValidating(prev => ({ ...prev, email: true }))
    try {
      const response = await fetch(`http://localhost:3001/api/pacientes?q=${encodeURIComponent(email)}`)
      const data = await response.json()
      
      if (data.success && data.data && data.data.length > 0) {
        const pacienteExistente = data.data.find((p: any) => p.email?.toLowerCase() === email.toLowerCase())
        if (pacienteExistente) {
          setDuplicateInfo(prev => ({
            ...prev,
            email: {
              id: pacienteExistente.id,
              nombre: `${pacienteExistente.nombres} ${pacienteExistente.apellidos}`
            }
          }))
        } else {
          setDuplicateInfo(prev => ({ ...prev, email: null }))
        }
      } else {
        setDuplicateInfo(prev => ({ ...prev, email: null }))
      }
    } catch (error) {
      console.error("Error verificando email:", error)
    } finally {
      setValidating(prev => ({ ...prev, email: false }))
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    const error = validateField(field, value)
    setErrors(prev => ({ ...prev, [field]: error }))
    if (field === "documento") setDuplicateInfo(prev => ({ ...prev, documento: null }))
    if (field === "email") setDuplicateInfo(prev => ({ ...prev, email: null }))
  }

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {}
    if (!formData.nombres.trim()) newErrors.nombres = "Los nombres son obligatorios"
    if (!formData.apellidos.trim()) newErrors.apellidos = "Los apellidos son obligatorios"
    if (!formData.documento.trim()) newErrors.documento = "El documento es obligatorio"
    if (!formData.celular.trim()) newErrors.celular = "El celular es obligatorio"
    if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = "La fecha de nacimiento es obligatoria"
    if (!formData.sexo) newErrors.sexo = "El sexo es obligatorio"

    // Verificar si hay duplicados detectados
    if (duplicateInfo.documento) {
      newErrors.documento = "duplicate"
    }
    if (duplicateInfo.email) {
      newErrors.email = "duplicate"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast({
        title: "Error de validación",
        description: "Por favor corrige los errores antes de continuar",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Calcular edad si hay fecha de nacimiento
      let edad = null
      if (formData.fecha_nacimiento) {
        const fechaNac = new Date(formData.fecha_nacimiento)
        const hoy = new Date()
        edad = hoy.getFullYear() - fechaNac.getFullYear()
        const mes = hoy.getMonth() - fechaNac.getMonth()
        if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
          edad--
        }
      }

      const payload = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        tipo_documento: formData.tipo_documento,
        documento: formData.documento,
        celular: formData.celular,
        email: formData.email || null,
        direccion: formData.direccion || null,
        fecha_nacimiento: formData.fecha_nacimiento,
        sexo: formData.sexo,
        edad,
        emergencia_nombre: formData.emergencia_nombre || null,
        emergencia_telefono: formData.emergencia_telefono || null,
      }

      console.log("Enviando payload:", payload)

      const response = await fetch("http://localhost:3001/api/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log("Respuesta del servidor:", data)

      if (!response.ok) {
        throw new Error(data.message || "Error al crear paciente")
      }

      toast({
        title: "Paciente creado",
        description: `${formData.nombres} ${formData.apellidos} ha sido registrado exitosamente`
      })

      router.push("/pacientes")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el paciente",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const renderPersonalTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombres">
            Nombres <span className="text-red-500">*</span>
          </Label>
          <Input
            id="nombres"
            value={formData.nombres}
            onChange={(e) => handleChange("nombres", e.target.value)}
            className={errors.nombres ? "border-red-500" : ""}
          />
          {errors.nombres && <p className="text-sm text-red-500">{errors.nombres}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apellidos">
            Apellidos <span className="text-red-500">*</span>
          </Label>
          <Input
            id="apellidos"
            value={formData.apellidos}
            onChange={(e) => handleChange("apellidos", e.target.value)}
            className={errors.apellidos ? "border-red-500" : ""}
          />
          {errors.apellidos && <p className="text-sm text-red-500">{errors.apellidos}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tipo_documento">
            Tipo de Documento <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.tipo_documento} onValueChange={(value) => handleChange("tipo_documento", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DNI">DNI</SelectItem>
              <SelectItem value="CarnetExtranjeria">Carné de Extranjería</SelectItem>
              <SelectItem value="Pasaporte">Pasaporte</SelectItem>
              <SelectItem value="Otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documento">
            Número de Documento <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="documento"
              value={formData.documento}
              onChange={(e) => handleChange("documento", e.target.value)}
              onBlur={(e) => checkDocumentoDuplicado(e.target.value)}
              className={duplicateInfo.documento ? "border-amber-400 focus-visible:ring-amber-300" : errors.documento ? "border-red-500" : ""}
              placeholder="12345678"
            />
            {validating.documento && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              </div>
            )}
          </div>
          {errors.documento && !duplicateInfo.documento && (
            <p className="text-sm text-red-500">{errors.documento}</p>
          )}
          {duplicateInfo.documento && (
            <p className="text-sm text-black mt-1" style={{ fontFamily: 'Roboto Condensed' }}>Esta cédula ya se encuentra registrada</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fecha_nacimiento">
            Fecha de Nacimiento <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fecha_nacimiento"
            type="date"
            value={formData.fecha_nacimiento}
            onChange={(e) => handleChange("fecha_nacimiento", e.target.value)}
            className={errors.fecha_nacimiento ? "border-red-500" : ""}
          />
          {errors.fecha_nacimiento && <p className="text-sm text-red-500">{errors.fecha_nacimiento}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sexo">
            Sexo <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.sexo} onValueChange={(value) => handleChange("sexo", value)}>
            <SelectTrigger className={errors.sexo ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecciona el sexo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="M">Masculino</SelectItem>
              <SelectItem value="F">Femenino</SelectItem>
              <SelectItem value="O">Otro</SelectItem>
            </SelectContent>
          </Select>
          {errors.sexo && <p className="text-sm text-red-500">{errors.sexo}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="celular">
            Celular <span className="text-red-500">*</span>
          </Label>
          <Input
            id="celular"
            type="tel"
            value={formData.celular}
            onChange={(e) => handleChange("celular", e.target.value)}
            className={errors.celular ? "border-red-500" : ""}
            placeholder="999888777"
          />
          {errors.celular && <p className="text-sm text-red-500">{errors.celular}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={(e) => checkEmailDuplicado(e.target.value)}
              className={duplicateInfo.email ? "border-amber-400 focus-visible:ring-amber-300" : errors.email ? "border-red-500" : ""}
              placeholder="correo@ejemplo.com"
            />
            {validating.email && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
              </div>
            )}
          </div>
          {errors.email && !duplicateInfo.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
          {duplicateInfo.email && (
            <p className="text-sm text-black mt-1" style={{ fontFamily: 'Roboto Condensed' }}>Este correo ya se encuentra registrado</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="direccion">Dirección</Label>
        <Input
          id="direccion"
          value={formData.direccion}
          onChange={(e) => handleChange("direccion", e.target.value)}
          placeholder="Jr. Los Pinos 123, San Isidro"
        />
      </div>

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-4">Contacto de Emergencia</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="emergencia_nombre">Nombre completo</Label>
            <Input
              id="emergencia_nombre"
              value={formData.emergencia_nombre}
              onChange={(e) => handleChange("emergencia_nombre", e.target.value)}
              placeholder="María Pérez"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencia_telefono">Teléfono</Label>
            <Input
              id="emergencia_telefono"
              type="tel"
              value={formData.emergencia_telefono}
              onChange={(e) => handleChange("emergencia_telefono", e.target.value)}
              placeholder="987654321"
            />
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar 
          user={{ nombre: "Usuario" } as any}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="container max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Nuevo Paciente</h1>
                <p className="text-slate-600 mt-1">Registra un nuevo paciente en el sistema</p>
              </div>
            </div>

            {/* Form Card */}
            <Card>
              <CardContent className="p-6">
                {renderPersonalTab()}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Paciente
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

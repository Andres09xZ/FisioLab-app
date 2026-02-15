"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface NewProfesionalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewProfesionalModal({ open, onOpenChange }: NewProfesionalModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const [especialidad, setEspecialidad] = useState("")
  const [email, setEmail] = useState("")
  const [telefono, setTelefono] = useState("")
  const [licencia, setLicencia] = useState("")

  const handleSubmit = async () => {
    // Validaciones
    if (!nombre.trim() || !apellido.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre y apellido son obligatorios"
      })
      return
    }

    if (!especialidad) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La especialidad es obligatoria"
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:3001/api/profesionales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          apellido,
          especialidad,
          email: email || undefined,
          telefono: telefono || undefined,
          licencia: licencia || undefined,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear profesional')
      }

      toast({
        title: "✅ Profesional creado",
        description: `${nombre} ${apellido} ha sido registrado exitosamente`,
      })

      // Limpiar formulario
      setNombre("")
      setApellido("")
      setEspecialidad("")
      setEmail("")
      setTelefono("")
      setLicencia("")
      
      onOpenChange(false)
    } catch (error) {
      console.error('Error al crear profesional:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el profesional. Intenta de nuevo.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nuevo Profesional</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Información Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Juan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">
                Apellido <span className="text-red-500">*</span>
              </Label>
              <Input
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                placeholder="Ej: Pérez"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="especialidad">
              Especialidad <span className="text-red-500">*</span>
            </Label>
            <Select value={especialidad} onValueChange={setEspecialidad}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una especialidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fisioterapia">Fisioterapia</SelectItem>
                <SelectItem value="Rehabilitación">Rehabilitación</SelectItem>
                <SelectItem value="Traumatología">Traumatología</SelectItem>
                <SelectItem value="Medicina Deportiva">Medicina Deportiva</SelectItem>
                <SelectItem value="Terapia Ocupacional">Terapia Ocupacional</SelectItem>
                <SelectItem value="Masoterapia">Masoterapia</SelectItem>
                <SelectItem value="Quiropráctica">Quiropráctica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profesional@ejemplo.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: 3001234567"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="licencia">Licencia Profesional</Label>
            <Input
              id="licencia"
              value={licencia}
              onChange={(e) => setLicencia(e.target.value)}
              placeholder="Número de licencia o registro"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Profesional"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

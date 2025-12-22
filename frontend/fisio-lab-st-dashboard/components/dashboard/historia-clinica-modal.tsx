"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface HistoriaClinicaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
  pacienteNombre: string
}

const ANTECEDENTES_OPTIONS = [
  { id: "cancer", label: "Cáncer", requiresDetail: true },
  { id: "hemopatias", label: "Hemopatías", requiresDetail: true },
  { id: "marcapasos", label: "Marcapasos", requiresDetail: false },
  { id: "diabetes", label: "Diabetes", requiresDetail: false },
  { id: "tuberculosis", label: "Tuberculosis", requiresDetail: true },
  { id: "digestivos_cardiacos", label: "Digestivos Cardiacos", requiresDetail: true },
  { id: "insuficiencia_renal", label: "Insuficiencia Renal", requiresDetail: true },
  { id: "bronquitis", label: "Bronquitis", requiresDetail: false },
  { id: "heridas", label: "Heridas", requiresDetail: true },
  { id: "cardiopatias", label: "Cardiopatías", requiresDetail: true },
  { id: "trombosis", label: "Trombosis", requiresDetail: true },
  { id: "enfer_de_la_piel", label: "Enfer. de la piel", requiresDetail: true },
  { id: "endocarditis", label: "Endocarditis", requiresDetail: false },
  { id: "hemorragias_activas", label: "Hemorragias Activas", requiresDetail: true },
  { id: "epilepsias", label: "Epilepsias", requiresDetail: false },
  { id: "hipertension", label: "Hipertensión", requiresDetail: false },
  { id: "implantes_metalicos", label: "Implantes Metálicos", requiresDetail: true },
  { id: "alterac_sensibilidad", label: "Alterac. de la sensibilidad", requiresDetail: true },
  { id: "otra_patologica", label: "Otra patológica", requiresDetail: true },
]

export function HistoriaClinicaModal({ open, onOpenChange, pacienteId, pacienteNombre }: HistoriaClinicaModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [profesion, setProfesion] = useState("")
  const [tipoTrabajo, setTipoTrabajo] = useState("")
  const [antecedentesSeleccionados, setAntecedentesSeleccionados] = useState<string[]>([])
  const [detallesAntecedentes, setDetallesAntecedentes] = useState<Record<string, string>>({})
  const [otros, setOtros] = useState("")
  const [notas, setNotas] = useState("")
  const [alergias, setAlergias] = useState("")
  const [diagnostico, setDiagnostico] = useState("")

  const handleToggleAntecedente = (antecedenteId: string) => {
    setAntecedentesSeleccionados(prev => {
      const newSelection = prev.includes(antecedenteId)
        ? prev.filter(id => id !== antecedenteId)
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

  const handleSubmit = async () => {
    if (antecedentesSeleccionados.length === 0 && !otros && !notas && !alergias && !diagnostico && !profesion && !tipoTrabajo) {
      toast({
        title: "Error",
        description: "Debes completar al menos un campo",
        variant: "destructive",
      })
      return
    }

    // Validar que los antecedentes que requieren detalle lo tengan
    const antecedentesConDetalleRequerido = ANTECEDENTES_OPTIONS.filter(
      ant => ant.requiresDetail && antecedentesSeleccionados.includes(ant.id)
    )
    
    const faltanDetalles = antecedentesConDetalleRequerido.some(
      ant => !detallesAntecedentes[ant.id]?.trim()
    )

    if (faltanDetalles) {
      toast({
        title: "Error",
        description: "Por favor especifica los detalles de los antecedentes seleccionados",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:3001/api/historia-clinica", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paciente_id: pacienteId,
          historia: {
            profesion,
            tipo_trabajo: tipoTrabajo,
            antecedentes: antecedentesSeleccionados,
            detalles_antecedentes: detallesAntecedentes,
            otros,
            notas,
            alergias,
            diagnostico,
          },
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Historia Clínica Creada",
          description: "La historia clínica se ha guardado correctamente",
          className: "bg-emerald-50 border-emerald-200",
        })
        resetForm()
        onOpenChange(false)
      } else {
        throw new Error(data.message || "Error al crear historia clínica")
      }
    } catch (error) {
      console.error("Error al crear historia clínica:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la historia clínica",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setProfesion("")
    setTipoTrabajo("")
    setAntecedentesSeleccionados([])
    setDetallesAntecedentes({})
    setOtros("")
    setNotas("")
    setAlergias("")
    setDiagnostico("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Historia Clínica</DialogTitle>
          <DialogDescription>
            Paciente: <span className="font-semibold text-gray-900">{pacienteNombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Información Laboral */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-lg text-blue-900">Información Laboral</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Profesión */}
              <div className="space-y-2">
                <Label htmlFor="profesion">Profesión</Label>
                <Input
                  id="profesion"
                  placeholder="Ej: Ingeniero, Contador, etc."
                  value={profesion}
                  onChange={(e) => setProfesion(e.target.value)}
                />
              </div>

              {/* Tipo de Trabajo */}
              <div className="space-y-2">
                <Label htmlFor="tipoTrabajo">Tipo de Trabajo</Label>
                <Input
                  id="tipoTrabajo"
                  placeholder="Ej: Oficina, Campo, Remoto, etc."
                  value={tipoTrabajo}
                  onChange={(e) => setTipoTrabajo(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Antecedentes Patológicos */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Antecedentes Patológicos</Label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              {ANTECEDENTES_OPTIONS.map((antecedente) => (
                <div key={antecedente.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={antecedente.id}
                      checked={antecedentesSeleccionados.includes(antecedente.id)}
                      onCheckedChange={() => handleToggleAntecedente(antecedente.id)}
                    />
                    <label
                      htmlFor={antecedente.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {antecedente.label}
                    </label>
                  </div>
                  
                  {/* Input de detalle si está seleccionado y requiere detalle */}
                  {antecedente.requiresDetail && antecedentesSeleccionados.includes(antecedente.id) && (
                    <div className="ml-6 mt-2">
                      <Input
                        placeholder={`Especifique detalles de ${antecedente.label.toLowerCase()}...`}
                        value={detallesAntecedentes[antecedente.id] || ""}
                        onChange={(e) => handleDetalleChange(antecedente.id, e.target.value)}
                        className="bg-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Otros Antecedentes */}
          <div className="space-y-2">
            <Label htmlFor="otros">Otros Antecedentes</Label>
            <Textarea
              id="otros"
              placeholder="Especifique otros antecedentes relevantes..."
              value={otros}
              onChange={(e) => setOtros(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              placeholder="Notas adicionales sobre la historia clínica..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
            />
          </div>

          {/* Alergias */}
          <div className="space-y-2">
            <Label htmlFor="alergias">Alergias</Label>
            <Textarea
              id="alergias"
              placeholder="Alergias conocidas del paciente..."
              value={alergias}
              onChange={(e) => setAlergias(e.target.value)}
              rows={2}
            />
          </div>

          {/* Diagnóstico */}
          <div className="space-y-2">
            <Label htmlFor="diagnostico">Diagnóstico</Label>
            <Textarea
              id="diagnostico"
              placeholder="Diagnóstico clínico..."
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
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
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Historia Clínica
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

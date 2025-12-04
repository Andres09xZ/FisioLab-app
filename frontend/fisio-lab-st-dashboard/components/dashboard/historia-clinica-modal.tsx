"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface HistoriaClinicaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
  pacienteNombre: string
}

const ANTECEDENTES_OPTIONS = [
  { id: "cancer", label: "Cáncer" },
  { id: "hemopatias", label: "Hemopatías" },
  { id: "marcapasos", label: "Marcapasos" },
  { id: "diabetes", label: "Diabetes" },
  { id: "tuberculosis", label: "Tuberculosis" },
  { id: "digestivos_cardiacos", label: "Digestivos Cardiacos" },
  { id: "insuficiencia_renal", label: "Insuficiencia Renal" },
  { id: "bronquitis", label: "Bronquitis" },
  { id: "heridas", label: "Heridas" },
  { id: "cardiopatias", label: "Cardiopatías" },
  { id: "trombosis", label: "Trombosis" },
  { id: "enfer_de_la_piel", label: "Enfer. de la piel" },
  { id: "endocarditis", label: "Endocarditis" },
  { id: "hemorragias_activas", label: "Hemorragias Activas" },
  { id: "epilepsias", label: "Epilepsias" },
  { id: "hipertension", label: "Hipertensión" },
  { id: "implantes_metalicos", label: "Implantes Metálicos" },
  { id: "alterac_sensibilidad", label: "Alterac. de la sensibilidad" },
]

export function HistoriaClinicaModal({ open, onOpenChange, pacienteId, pacienteNombre }: HistoriaClinicaModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [antecedentesSeleccionados, setAntecedentesSeleccionados] = useState<string[]>([])
  const [otros, setOtros] = useState("")
  const [notas, setNotas] = useState("")
  const [alergias, setAlergias] = useState("")
  const [diagnostico, setDiagnostico] = useState("")

  const handleToggleAntecedente = (antecedenteId: string) => {
    setAntecedentesSeleccionados(prev => 
      prev.includes(antecedenteId)
        ? prev.filter(id => id !== antecedenteId)
        : [...prev, antecedenteId]
    )
  }

  const handleSubmit = async () => {
    if (antecedentesSeleccionados.length === 0 && !otros && !notas && !alergias && !diagnostico) {
      toast({
        title: "Error",
        description: "Debes completar al menos un campo",
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
            antecedentes: antecedentesSeleccionados,
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
    setAntecedentesSeleccionados([])
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
          {/* Antecedentes Patológicos */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Antecedentes Patológicos</Label>
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {ANTECEDENTES_OPTIONS.map((antecedente) => (
                <div key={antecedente.id} className="flex items-center space-x-2">
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

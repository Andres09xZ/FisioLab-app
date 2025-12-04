"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface EvaluacionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pacienteId: string
  pacienteNombre: string
}

export function EvaluacionModal({ open, onOpenChange, pacienteId, pacienteNombre }: EvaluacionModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [motivoConsulta, setMotivoConsulta] = useState("")
  const [enfermedadActual, setEnfermedadActual] = useState("")
  const [objetivoPaciente, setObjetivoPaciente] = useState("")
  const [inspeccion, setInspeccion] = useState("")
  const [palpacion, setPalpacion] = useState("")
  const [movimiento, setMovimiento] = useState("")
  const [ejercicios, setEjercicios] = useState("")
  const [diagnosticoFT, setDiagnosticoFT] = useState("")
  const [planTratamiento, setPlanTratamiento] = useState("")

  const handleSubmit = async () => {
    if (!motivoConsulta || !enfermedadActual) {
      toast({
        title: "Error",
        description: "El motivo de consulta y la enfermedad actual son obligatorios",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://localhost:3001/api/evaluacion-fisioterapeutica", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paciente_id: pacienteId,
          motivo_consulta: motivoConsulta,
          enfermedad_actual: enfermedadActual,
          objetivo_paciente: objetivoPaciente,
          inspeccion,
          palpacion,
          movimiento,
          ejercicios,
          diagnostico_ft: diagnosticoFT,
          plan_tratamiento: planTratamiento,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Evaluación Creada",
          description: "La evaluación fisioterapéutica se ha guardado correctamente",
          className: "bg-blue-50 border-blue-200",
        })
        resetForm()
        onOpenChange(false)
      } else {
        throw new Error(data.message || "Error al crear evaluación")
      }
    } catch (error) {
      console.error("Error al crear evaluación:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear la evaluación",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setMotivoConsulta("")
    setEnfermedadActual("")
    setObjetivoPaciente("")
    setInspeccion("")
    setPalpacion("")
    setMovimiento("")
    setEjercicios("")
    setDiagnosticoFT("")
    setPlanTratamiento("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Evaluación Fisioterapéutica</DialogTitle>
          <DialogDescription>
            Paciente: <span className="font-semibold text-gray-900">{pacienteNombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Motivo de Consulta */}
          <div className="space-y-2">
            <Label htmlFor="motivoConsulta" className="text-base font-semibold">
              Motivo de Consulta <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="motivoConsulta"
              placeholder="¿Por qué acude el paciente a consulta?"
              value={motivoConsulta}
              onChange={(e) => setMotivoConsulta(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Enfermedad Actual */}
          <div className="space-y-2">
            <Label htmlFor="enfermedadActual" className="text-base font-semibold">
              Enfermedad Actual <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="enfermedadActual"
              placeholder="Descripción de la condición actual del paciente..."
              value={enfermedadActual}
              onChange={(e) => setEnfermedadActual(e.target.value)}
              rows={3}
              required
            />
          </div>

          {/* Objetivo del Paciente */}
          <div className="space-y-2">
            <Label htmlFor="objetivoPaciente">Objetivo del Paciente</Label>
            <Textarea
              id="objetivoPaciente"
              placeholder="¿Qué espera lograr el paciente con el tratamiento?"
              value={objetivoPaciente}
              onChange={(e) => setObjetivoPaciente(e.target.value)}
              rows={2}
            />
          </div>

          {/* Sección de Evaluación Física */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg">Evaluación Física</h3>
            
            {/* Inspección */}
            <div className="space-y-2">
              <Label htmlFor="inspeccion">Inspección</Label>
              <Textarea
                id="inspeccion"
                placeholder="Observaciones visuales del paciente (postura, marcha, etc.)..."
                value={inspeccion}
                onChange={(e) => setInspeccion(e.target.value)}
                rows={3}
              />
            </div>

            {/* Palpación */}
            <div className="space-y-2">
              <Label htmlFor="palpacion">Palpación</Label>
              <Textarea
                id="palpacion"
                placeholder="Hallazgos por palpación (puntos de dolor, tensión muscular, etc.)..."
                value={palpacion}
                onChange={(e) => setPalpacion(e.target.value)}
                rows={3}
              />
            </div>

            {/* Movimiento */}
            <div className="space-y-2">
              <Label htmlFor="movimiento">Movimiento</Label>
              <Textarea
                id="movimiento"
                placeholder="Rango de movimiento, limitaciones, dolor durante el movimiento..."
                value={movimiento}
                onChange={(e) => setMovimiento(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Ejercicios */}
          <div className="space-y-2">
            <Label htmlFor="ejercicios">Ejercicios Recomendados</Label>
            <Textarea
              id="ejercicios"
              placeholder="Ejercicios y actividades recomendadas para el paciente..."
              value={ejercicios}
              onChange={(e) => setEjercicios(e.target.value)}
              rows={4}
            />
          </div>

          {/* Diagnóstico Fisioterapéutico */}
          <div className="space-y-2">
            <Label htmlFor="diagnosticoFT">Diagnóstico Fisioterapéutico</Label>
            <Textarea
              id="diagnosticoFT"
              placeholder="Diagnóstico desde la perspectiva fisioterapéutica..."
              value={diagnosticoFT}
              onChange={(e) => setDiagnosticoFT(e.target.value)}
              rows={3}
            />
          </div>

          {/* Plan de Tratamiento */}
          <div className="space-y-2">
            <Label htmlFor="planTratamiento">Plan de Tratamiento</Label>
            <Textarea
              id="planTratamiento"
              placeholder="Estrategia y plan de tratamiento propuesto..."
              value={planTratamiento}
              onChange={(e) => setPlanTratamiento(e.target.value)}
              rows={4}
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Evaluación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

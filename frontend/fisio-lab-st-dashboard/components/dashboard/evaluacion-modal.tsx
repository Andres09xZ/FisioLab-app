"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { EspecialidadSelect } from "@/components/ui/especialidad-select"

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
  const [especialidad, setEspecialidad] = useState<string | null>(null)
  const [enfermedadActual, setEnfermedadActual] = useState("")
  const [objetivoPaciente, setObjetivoPaciente] = useState("")
  const [escalaEVA, setEscalaEVA] = useState<number>(0)
  const [inspeccion, setInspeccion] = useState("")
  const [palpacion, setPalpacion] = useState("")
  const [movimiento, setMovimiento] = useState("")
  const [ejercicios, setEjercicios] = useState("")
  const [diagnosticoFT, setDiagnosticoFT] = useState("")
  const [planTratamiento, setPlanTratamiento] = useState("")

  const getEVAColor = (value: number) => {
    if (value === 0) return "bg-green-500"
    if (value <= 2) return "bg-green-400"
    if (value <= 4) return "bg-yellow-300"
    if (value <= 6) return "bg-yellow-500"
    if (value <= 8) return "bg-orange-500"
    return "bg-red-500"
  }

  const getEVALabel = (value: number) => {
    if (value === 0) return "Sin Dolor"
    if (value <= 2) return "Poco Dolor"
    if (value <= 4) return "Dolor Moderado"
    if (value <= 6) return "Dolor Fuerte"
    if (value <= 8) return "Dolor Muy Fuerte"
    return "Dolor Extremo"
  }

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
          especialidad: especialidad,
          enfermedad_actual: enfermedadActual,
          objetivo_paciente: objetivoPaciente,
          escala_eva: escalaEVA,
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
    setEspecialidad(null)
    setEnfermedadActual("")
    setObjetivoPaciente("")
    setEscalaEVA(0)
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

          {/* Especialidad */}
          <div className="space-y-2">
            <Label htmlFor="especialidad" className="text-base font-semibold">
              Especialidad <span className="text-gray-500 text-sm font-normal">(Opcional)</span>
            </Label>
            <EspecialidadSelect
              value={especialidad}
              onChange={setEspecialidad}
              placeholder="Seleccionar especialidad"
            />
            <p className="text-xs text-gray-500">
              💡 Selecciona la especialidad de fisioterapia más adecuada para esta evaluación
            </p>
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

          {/* Escala EVA (Escala Visual Analógica) */}
          <div className="space-y-4 p-6 bg-cyan-50 rounded border border-cyan-200">
            <div className="text-center">
              <h3 className="font-bold text-xl text-cyan-900 mb-1">ESCALA VISUAL ANALÓGICA</h3>
              <p className="text-sm text-gray-600">Seleccione el nivel de dolor del paciente</p>
            </div>
            
            <div className="space-y-4">
              {/* Caras indicadoras */}
              <div className="flex justify-between items-center px-2">
                {[
                  { range: [0, 0], emoji: "😊", label: "Sin\nDolor", color: "text-green-600" },
                  { range: [1, 2], emoji: "🙂", label: "Poco\nDolor", color: "text-green-500" },
                  { range: [3, 4], emoji: "😐", label: "Dolor\nModerado", color: "text-yellow-500" },
                  { range: [5, 6], emoji: "😟", label: "Dolor\nFuerte", color: "text-orange-500" },
                  { range: [7, 8], emoji: "😨", label: "Dolor\nMuy Fuerte", color: "text-orange-600" },
                  { range: [9, 10], emoji: "😱", label: "Dolor\nExtremo", color: "text-red-600" },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <span className={`text-3xl ${item.color}`}>{item.emoji}</span>
                    <span className={`text-xs font-medium text-center whitespace-pre-line mt-1 ${item.color}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Barra de colores */}
              <div className="relative h-12 rounded overflow-hidden">
                <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-green-500"></div>
                  <div className="flex-1 bg-green-400"></div>
                  <div className="flex-1 bg-yellow-300"></div>
                  <div className="flex-1 bg-yellow-400"></div>
                  <div className="flex-1 bg-yellow-500"></div>
                  <div className="flex-1 bg-orange-400"></div>
                  <div className="flex-1 bg-orange-500"></div>
                  <div className="flex-1 bg-orange-600"></div>
                  <div className="flex-1 bg-red-500"></div>
                  <div className="flex-1 bg-red-600"></div>
                  <div className="flex-1 bg-red-700"></div>
                </div>
                {/* Indicador de posición */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-black transition-all duration-200"
                  style={{ left: `${(escalaEVA / 10) * 100}%` }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-8 border-t-black"></div>
                </div>
              </div>

              {/* Números */}
              <div className="flex justify-between px-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setEscalaEVA(num)}
                    className={`w-8 h-8 rounded-full font-bold text-sm transition-all ${
                      escalaEVA === num
                        ? "bg-cyan-600 text-white scale-125"
                        : "bg-white text-slate-700 hover:bg-cyan-50 border border-slate-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Slider */}
              <div className="space-y-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={escalaEVA}
                  onChange={(e) => setEscalaEVA(Number(e.target.value))}
                  className="w-full h-3 rounded-lg eva-slider cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      rgb(34, 197, 94) 0%, 
                      rgb(74, 222, 128) 18%, 
                      rgb(253, 224, 71) 36%, 
                      rgb(250, 204, 21) 45%, 
                      rgb(251, 191, 36) 54%, 
                      rgb(251, 146, 60) 63%, 
                      rgb(249, 115, 22) 72%, 
                      rgb(234, 88, 12) 81%, 
                      rgb(239, 68, 68) 90%, 
                      rgb(220, 38, 38) 100%)`,
                  }}
                />
                <div className="text-center">
                  <span className={`inline-block px-6 py-2 rounded-full text-white font-bold text-lg ${getEVAColor(escalaEVA)}`}>
                    {escalaEVA} - {getEVALabel(escalaEVA)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de Evaluación Física */}
          <div className="space-y-4 p-4 bg-slate-50 rounded border border-slate-200">
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
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Evaluación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, Clock, CheckCircle2, Edit, XCircle, AlertTriangle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { completarCita, cancelarCita, moverCita, eliminarCita } from "@/lib/api/citas"
import { useToast } from "@/hooks/use-toast"

interface EventPopupProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
  evento: {
    id: string
    title: string
    start: string
    end: string
    estado: string
    paciente_id?: string
    profesional_id?: string
    notas?: string
  }
}

export function EventPopup({ open, onClose, onSuccess, evento }: EventPopupProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [notasCompletar, setNotasCompletar] = useState("")
  const [mostrarFormCompletar, setMostrarFormCompletar] = useState(false)
  const [mostrarConfirmCancelar, setMostrarConfirmCancelar] = useState(false)
  const [mostrarConfirmEliminar, setMostrarConfirmEliminar] = useState(false)
  const [mostrarEditarHora, setMostrarEditarHora] = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState("")
  
  // Estado para edición de hora
  const [editFecha, setEditFecha] = useState(format(new Date(evento.start), "yyyy-MM-dd"))
  const [editHoraInicio, setEditHoraInicio] = useState(format(new Date(evento.start), "HH:mm"))
  const [editHoraFin, setEditHoraFin] = useState(format(new Date(evento.end), "HH:mm"))

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "confirmada":
        return "bg-[#E6FFF5] text-[#0AA640] border-[#0AA640]/30"
      case "pendiente":
      case "programada":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "cancelada":
        return "bg-red-100 text-red-700 border-red-200"
      case "completada":
        return "bg-[#EBF5FF] text-[#056CF2] border-[#4BA4F2]/30"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const handleCompletar = async () => {
    setLoading(true)
    const result = await completarCita(evento.id, notasCompletar)

    if (result.success) {
      toast({
        title: "✅ Cita completada",
        description: "La cita se ha marcado como completada"
      })
      onSuccess?.()
      onClose()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo completar la cita",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleCancelar = async () => {
    setLoading(true)
    const result = await cancelarCita(evento.id, motivoCancelacion)

    if (result.success) {
      toast({
        title: "Cita cancelada",
        description: result.message || "La cita se ha cancelado"
      })
      onSuccess?.()
      onClose()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo cancelar la cita",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleEliminar = async () => {
    setLoading(true)
    const result = await eliminarCita(evento.id)

    if (result.success) {
      toast({
        title: "Cita eliminada",
        description: "La cita se ha eliminado permanentemente"
      })
      onSuccess?.()
      onClose()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo eliminar la cita",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const handleGuardarHora = async () => {
    setLoading(true)
    
    const nuevoInicio = `${editFecha}T${editHoraInicio}:00`
    const nuevoFin = `${editFecha}T${editHoraFin}:00`
    
    const result = await moverCita(evento.id, nuevoInicio, nuevoFin)

    if (result.success) {
      toast({
        title: "✅ Horario actualizado",
        description: "La cita se ha reprogramado correctamente"
      })
      onSuccess?.()
      onClose()
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo actualizar el horario",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const puedeEditar = evento.estado.toLowerCase() !== "completada" && evento.estado.toLowerCase() !== "cancelada"
  const puedeCompletar = puedeEditar
  const puedeCancelar = puedeEditar

  // Reset de vistas
  const resetVistas = () => {
    setMostrarFormCompletar(false)
    setMostrarConfirmCancelar(false)
    setMostrarConfirmEliminar(false)
    setMostrarEditarHora(false)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Calendar className="h-5 w-5 text-[#056CF2]" />
            Detalles de la Cita
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Título y Estado */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {evento.title || 'Cita programada'}
              </h3>
              <Badge className={getEstadoColor(evento.estado)}>
                {evento.estado}
              </Badge>
            </div>
          </div>

          {/* Horario - Editable */}
          {mostrarEditarHora ? (
            <div className="bg-[#EBF5FF] border border-[#4BA4F2] rounded-lg p-4 space-y-3">
              <Label className="font-medium">Editar horario:</Label>
              <div className="space-y-2">
                <div>
                  <Label className="text-sm">Fecha</Label>
                  <Input
                    type="date"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Hora inicio</Label>
                    <Input
                      type="time"
                      value={editHoraInicio}
                      onChange={(e) => setEditHoraInicio(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Hora fin</Label>
                    <Input
                      type="time"
                      value={editHoraFin}
                      onChange={(e) => setEditHoraFin(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleGuardarHora}
                  disabled={loading}
                  className="flex-1 bg-[#056CF2] hover:bg-[#0558C9]"
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMostrarEditarHora(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Horario:</span>
                </div>
                {puedeEditar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      resetVistas()
                      setMostrarEditarHora(true)
                    }}
                    className="text-[#056CF2] hover:text-[#0558C9]"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-700">
                {format(new Date(evento.start), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
              </div>
              <div className="text-sm text-gray-700">
                {format(new Date(evento.start), "HH:mm", { locale: es })} - {format(new Date(evento.end), "HH:mm", { locale: es })}
              </div>
            </div>
          )}

          {/* Notas existentes */}
          {evento.notas && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Notas:</Label>
              <div className="text-sm text-gray-700 bg-gray-50 rounded p-3">
                {evento.notas}
              </div>
            </div>
          )}

          {/* Formulario para completar */}
          {mostrarFormCompletar && puedeCompletar && (
            <div className="space-y-2 bg-[#E6FFF5] border border-[#0AA640]/30 rounded-lg p-4">
              <Label htmlFor="notasCompletar">Notas de finalización:</Label>
              <Textarea
                id="notasCompletar"
                placeholder="Describe cómo fue la sesión, progreso del paciente, observaciones..."
                value={notasCompletar}
                onChange={(e) => setNotasCompletar(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleCompletar}
                  disabled={loading}
                  className="flex-1 bg-[#0AA640] hover:bg-[#098A36]"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {loading ? "Completando..." : "Confirmar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMostrarFormCompletar(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Confirmación de cancelación */}
          {mostrarConfirmCancelar && puedeCancelar && (
            <div className="space-y-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-700 font-medium mb-2">
                <AlertTriangle className="h-5 w-5" />
                ¿Cancelar esta cita?
              </div>
              <Label htmlFor="motivoCancelacion">Motivo (opcional):</Label>
              <Textarea
                id="motivoCancelacion"
                placeholder="Indica el motivo de la cancelación..."
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                rows={2}
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleCancelar}
                  disabled={loading}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {loading ? "Cancelando..." : "Sí, Cancelar Cita"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMostrarConfirmCancelar(false)}
                  disabled={loading}
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {/* Confirmación de eliminación */}
          {mostrarConfirmEliminar && (
            <div className="space-y-2 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <Trash2 className="h-5 w-5" />
                ¿Eliminar esta cita permanentemente?
              </div>
              <p className="text-sm text-red-600">
                Esta acción no se puede deshacer. La cita y cualquier sesión asociada serán eliminadas.
              </p>
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleEliminar}
                  disabled={loading}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {loading ? "Eliminando..." : "Sí, Eliminar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMostrarConfirmEliminar(false)}
                  disabled={loading}
                >
                  No
                </Button>
              </div>
            </div>
          )}

          {/* ID de referencia */}
          <div className="text-xs text-gray-500 border-t pt-3">
            ID: {evento.id}
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          {!mostrarFormCompletar && !mostrarConfirmCancelar && !mostrarConfirmEliminar && !mostrarEditarHora && (
            <>
              {puedeCompletar && (
                <Button
                  onClick={() => {
                    resetVistas()
                    setMostrarFormCompletar(true)
                  }}
                  className="bg-[#0AA640] hover:bg-[#098A36]"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Completar
                </Button>
              )}
              {puedeCancelar && (
                <Button
                  variant="outline"
                  onClick={() => {
                    resetVistas()
                    setMostrarConfirmCancelar(true)
                  }}
                  className="text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  resetVistas()
                  setMostrarConfirmEliminar(true)
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            </>
          )}
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

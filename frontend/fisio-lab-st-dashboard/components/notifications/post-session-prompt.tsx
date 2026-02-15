"use client"

import { useState, useEffect, useCallback } from "react"
import { format, isPast, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { CheckCircle2, Clock, X, CalendarClock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { completarCita, moverCita } from "@/lib/api/citas"

interface EndedSession {
  id: string
  title: string
  start: string
  end: string
  paciente_nombre?: string
  profesional_nombre?: string
  estado: string
}

/**
 * Non-invasive post-session prompt.
 * After a session's planned time ends, shows a subtle banner
 * asking to confirm completion or reschedule the next session.
 * Slides up from bottom-left, does NOT block the UI.
 */
export function PostSessionPrompt() {
  const { toast } = useToast()
  const [endedSessions, setEndedSessions] = useState<EndedSession[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState<EndedSession | null>(null)
  const [notas, setNotas] = useState("")
  const [nuevaFecha, setNuevaFecha] = useState("")
  const [nuevaHora, setNuevaHora] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("fisiolab_user"))
  }, [])

  const checkEndedSessions = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const hoy = format(new Date(), "yyyy-MM-dd")
      const res = await fetch(
        `http://localhost:3001/api/agenda?fecha=${hoy}&vista=dia`
      )
      const json = await res.json()

      if (json.success && json.data?.eventos) {
        const ahora = new Date()
        const ended = json.data.eventos
          .map((ev: any) => ({
            id: ev.id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
            paciente_nombre: ev.extendedProps?.paciente_nombre,
            profesional_nombre: ev.extendedProps?.profesional_nombre,
            estado: ev.extendedProps?.estado || "programada",
          }))
          .filter((ev: EndedSession) => {
            if (dismissed.has(ev.id)) return false
            if (ev.estado === "completada" || ev.estado === "cancelada") return false
            const fin = new Date(ev.end)
            // Show only for sessions that ended in the last 60 minutes
            const minsEnded = differenceInMinutes(ahora, fin)
            return isPast(fin) && minsEnded <= 60 && minsEnded >= 0
          })

        setEndedSessions(ended)
      }
    } catch {
      // Non-critical, fail silently
    }
  }, [dismissed, isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return
    checkEndedSessions()
    const interval = setInterval(checkEndedSessions, 60000)
    return () => clearInterval(interval)
  }, [checkEndedSessions, isLoggedIn])

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    setEndedSessions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleConfirmComplete = async () => {
    if (!selectedSession) return
    setActionLoading(true)

    const result = await completarCita(selectedSession.id, notas)
    if (result.success) {
      toast({
        title: "Sesión completada",
        description: `Cita de ${selectedSession.paciente_nombre || "paciente"} marcada como completada`,
      })
      dismiss(selectedSession.id)
      setShowConfirmDialog(false)
      setNotas("")
      // Trigger reload of agenda
      window.dispatchEvent(new Event("reloadAgenda"))
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo completar la cita",
        variant: "destructive",
      })
    }
    setActionLoading(false)
  }

  const handleReschedule = async () => {
    if (!selectedSession || !nuevaFecha || !nuevaHora) return
    setActionLoading(true)

    const inicioOriginal = new Date(selectedSession.start)
    const finOriginal = new Date(selectedSession.end)
    const duracionMs = finOriginal.getTime() - inicioOriginal.getTime()

    const nuevoInicio = `${nuevaFecha}T${nuevaHora}:00`
    const nuevoFin = new Date(new Date(nuevoInicio).getTime() + duracionMs).toISOString()

    const result = await moverCita(selectedSession.id, nuevoInicio, nuevoFin)
    if (result.success) {
      toast({
        title: "Sesión reprogramada",
        description: `Siguiente sesión movida al ${format(new Date(nuevoInicio), "d 'de' MMMM, HH:mm", { locale: es })}`,
      })
      dismiss(selectedSession.id)
      setShowRescheduleDialog(false)
      setNuevaFecha("")
      setNuevaHora("")
      window.dispatchEvent(new Event("reloadAgenda"))
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo reprogramar",
        variant: "destructive",
      })
    }
    setActionLoading(false)
  }

  if (endedSessions.length === 0) return null

  return (
    <>
      {/* Non-invasive floating banners - bottom left */}
      <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-sm">
        {endedSessions.slice(0, 2).map((session) => (
          <div
            key={session.id}
            className="bg-white border border-amber-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-4 duration-300"
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 rounded-full shrink-0">
                <CalendarClock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  Sesión finalizada
                </p>
                <p className="text-xs text-slate-600 mt-0.5 truncate">
                  {session.paciente_nombre || session.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {format(new Date(session.start), "HH:mm")} - {format(new Date(session.end), "HH:mm")}
                </p>
              </div>
              <button
                onClick={() => dismiss(session.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Descartar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                className="text-xs bg-emerald-600 hover:bg-emerald-700 h-7 flex-1"
                onClick={() => {
                  setSelectedSession(session)
                  setShowConfirmDialog(true)
                }}
              >
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Confirmar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 flex-1"
                onClick={() => {
                  setSelectedSession(session)
                  setNuevaFecha(format(new Date(), "yyyy-MM-dd"))
                  setNuevaHora(format(new Date(session.start), "HH:mm"))
                  setShowRescheduleDialog(true)
                }}
              >
                <Clock className="h-3 w-3 mr-1" />
                Reprogramar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Confirm completion dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Confirmar sesión completada
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              ¿La sesión con <strong>{selectedSession?.paciente_nombre}</strong> se realizó correctamente?
            </p>
            <div>
              <Label htmlFor="post-notas" className="text-sm">Notas de la sesión (opcional)</Label>
              <Textarea
                id="post-notas"
                placeholder="Evolución del paciente, observaciones..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmComplete}
              disabled={actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLoading ? "Confirmando..." : "Confirmar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-cyan-600" />
              Reprogramar siguiente sesión
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Cambiar horario de la sesión de <strong>{selectedSession?.paciente_nombre}</strong>
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="post-fecha" className="text-sm">Nueva fecha</Label>
                <Input
                  id="post-fecha"
                  type="date"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="post-hora" className="text-sm">Nueva hora</Label>
                <Input
                  id="post-hora"
                  type="time"
                  value={nuevaHora}
                  onChange={(e) => setNuevaHora(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleReschedule}
              disabled={actionLoading || !nuevaFecha || !nuevaHora}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {actionLoading ? "Reprogramando..." : "Reprogramar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

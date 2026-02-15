"use client"

import { useState, useEffect, useCallback } from "react"
import { format, differenceInMinutes, isPast } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, X, Bell, ArrowRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface UpcomingSession {
  id: string
  title: string
  start: string
  end: string
  paciente_nombre?: string
  profesional_nombre?: string
  estado: string
}

/**
 * Non-invasive floating notification for upcoming sessions.
 * Shows a subtle slide-up banner 15 minutes before a session.
 * Auto-dismisses after 30 seconds or on user interaction.
 */
export function SessionReminder() {
  const router = useRouter()
  const [reminders, setReminders] = useState<UpcomingSession[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("fisiolab_user"))
  }, [])

  const checkUpcomingSessions = useCallback(async () => {
    if (!isLoggedIn) return
    try {
      const hoy = format(new Date(), "yyyy-MM-dd")
      const res = await fetch(
        `http://localhost:3001/api/agenda?fecha=${hoy}&vista=dia`
      )
      const json = await res.json()

      if (json.success && json.data?.eventos) {
        const ahora = new Date()
        const upcoming = json.data.eventos
          .map((ev: any) => ({
            id: ev.id,
            title: ev.title,
            start: ev.start,
            end: ev.end,
            paciente_nombre: ev.extendedProps?.paciente_nombre,
            profesional_nombre: ev.extendedProps?.profesional_nombre,
            estado: ev.extendedProps?.estado || "programada",
          }))
          .filter((ev: UpcomingSession) => {
            if (dismissed.has(ev.id)) return false
            if (ev.estado === "completada" || ev.estado === "cancelada") return false
            const inicio = new Date(ev.start)
            const mins = differenceInMinutes(inicio, ahora)
            return mins > 0 && mins <= 15
          })

        setReminders(upcoming)
      }
    } catch {
      // Silently fail - notifications are non-critical
    }
  }, [dismissed, isLoggedIn])

  useEffect(() => {
    if (!isLoggedIn) return
    checkUpcomingSessions()
    const interval = setInterval(checkUpcomingSessions, 60000)
    return () => clearInterval(interval)
  }, [checkUpcomingSessions, isLoggedIn])

  // Auto-dismiss after 30 seconds
  useEffect(() => {
    if (reminders.length === 0) return
    const timer = setTimeout(() => {
      setReminders([])
    }, 30000)
    return () => clearTimeout(timer)
  }, [reminders])

  const dismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    setReminders((prev) => prev.filter((r) => r.id !== id))
  }

  if (reminders.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {reminders.map((session) => {
        const inicio = new Date(session.start)
        const mins = differenceInMinutes(inicio, new Date())

        return (
          <div
            key={session.id}
            className="bg-white border border-cyan-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-bottom-4 duration-300"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-cyan-50 rounded-full shrink-0">
                <Bell className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">
                  Sesión en {mins} minuto{mins !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-slate-600 mt-0.5 truncate">
                  {session.paciente_nombre || session.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  <span>{format(inicio, "HH:mm", { locale: es })}</span>
                  {session.profesional_nombre && (
                    <>
                      <span className="text-slate-300">•</span>
                      <User className="h-3 w-3" />
                      <span className="truncate">{session.profesional_nombre}</span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismiss(session.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
                aria-label="Descartar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex justify-end mt-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 h-7"
                onClick={() => {
                  dismiss(session.id)
                  router.push("/agenda")
                }}
              >
                Ver agenda
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

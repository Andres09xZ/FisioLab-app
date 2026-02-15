"use client"

import { useState, useEffect } from "react"
import { format, isAfter, isBefore, differenceInMinutes } from "date-fns"
import { es } from "date-fns/locale"
import { Clock, User, Target, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface SesionHoy {
  id: string
  titulo: string
  inicio: string
  fin: string
  paciente_nombre: string
  profesional_nombre: string
  estado: string
  paciente_id?: string
}

type SessionStatus = "en_curso" | "proxima" | "pendiente" | "completada" | "cancelada" | "vencida"

/**
 * Priority view of today's sessions for the dashboard.
 * Shows sessions ordered by urgency: in-progress > next-up > pending > completed
 */
export function SesionesDelDia() {
  const router = useRouter()
  const [sesiones, setSesiones] = useState<SesionHoy[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchSesionesHoy()
    const interval = setInterval(() => setCurrentTime(new Date()), 60000)
    const handleReload = () => fetchSesionesHoy()
    window.addEventListener("reloadAgenda", handleReload)
    return () => {
      clearInterval(interval)
      window.removeEventListener("reloadAgenda", handleReload)
    }
  }, [])

  const fetchSesionesHoy = async () => {
    setLoading(true)
    try {
      const hoy = format(new Date(), "yyyy-MM-dd")
      const res = await fetch(`http://localhost:3001/api/agenda?fecha=${hoy}&vista=dia`)
      const json = await res.json()

      if (json.success && json.data?.eventos) {
        const mapped: SesionHoy[] = json.data.eventos.map((ev: any) => ({
          id: ev.id,
          titulo: ev.title || "Sesión programada",
          inicio: ev.start,
          fin: ev.end,
          paciente_nombre: ev.extendedProps?.paciente_nombre || "Paciente",
          profesional_nombre: ev.extendedProps?.profesional_nombre || "",
          estado: ev.extendedProps?.estado || "programada",
          paciente_id: ev.extendedProps?.paciente_id,
        }))
        setSesiones(mapped)
      }
    } catch {
      // Fail silently
    }
    setLoading(false)
  }

  const getStatus = (s: SesionHoy): SessionStatus => {
    if (s.estado === "completada") return "completada"
    if (s.estado === "cancelada") return "cancelada"

    const inicio = new Date(s.inicio)
    const fin = new Date(s.fin)
    const ahora = currentTime

    if (isAfter(ahora, fin)) return "vencida"
    if (isAfter(ahora, inicio) && isBefore(ahora, fin)) return "en_curso"

    const mins = differenceInMinutes(inicio, ahora)
    if (mins <= 30 && mins > 0) return "proxima"

    return "pendiente"
  }

  const statusPriority: Record<SessionStatus, number> = {
    en_curso: 0,
    proxima: 1,
    vencida: 2,
    pendiente: 3,
    completada: 4,
    cancelada: 5,
  }

  const statusConfig: Record<SessionStatus, { label: string; color: string; bg: string; dot: string }> = {
    en_curso: { label: "En curso", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500 animate-pulse" },
    proxima: { label: "Próxima", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", dot: "bg-amber-500" },
    pendiente: { label: "Programada", color: "text-slate-600", bg: "bg-slate-50 border-slate-200", dot: "bg-slate-400" },
    completada: { label: "Completada", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", dot: "bg-blue-500" },
    cancelada: { label: "Cancelada", color: "text-red-600", bg: "bg-red-50 border-red-200", dot: "bg-red-500" },
    vencida: { label: "Sin confirmar", color: "text-orange-600", bg: "bg-orange-50 border-orange-200", dot: "bg-orange-500" },
  }

  const sortedSesiones = [...sesiones].sort((a, b) => {
    const statusA = getStatus(a)
    const statusB = getStatus(b)
    if (statusPriority[statusA] !== statusPriority[statusB]) {
      return statusPriority[statusA] - statusPriority[statusB]
    }
    return new Date(a.inicio).getTime() - new Date(b.inicio).getTime()
  })

  const activeSessions = sortedSesiones.filter(s => {
    const st = getStatus(s)
    return st !== "completada" && st !== "cancelada"
  })
  const completedCount = sesiones.filter(s => getStatus(s) === "completada").length

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-cyan-600" />
            Sesiones de Hoy
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">
              {format(new Date(), "d 'de' MMMM", { locale: es })}
            </span>
            <Badge variant="outline" className="text-xs">
              {activeSessions.length} activa{activeSessions.length !== 1 ? "s" : ""}
              {completedCount > 0 && ` · ${completedCount} completada${completedCount !== 1 ? "s" : ""}`}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-600" />
          </div>
        ) : sortedSesiones.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No hay sesiones programadas para hoy</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 text-xs"
              onClick={() => router.push("/agenda")}
            >
              Ir a Agenda
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedSesiones.map((sesion) => {
              const status = getStatus(sesion)
              const config = statusConfig[status]
              const iniciales = sesion.paciente_nombre
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) || "?"

              return (
                <div
                  key={sesion.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${config.bg} ${
                    status === "en_curso" ? "ring-1 ring-emerald-300" : ""
                  }`}
                >
                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${config.dot}`} />

                  {/* Avatar */}
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-cyan-600 text-white text-xs">
                      {iniciales}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {sesion.paciente_nombre}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        {format(new Date(sesion.inicio), "HH:mm")} - {format(new Date(sesion.fin), "HH:mm")}
                      </span>
                      {sesion.profesional_nombre && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="truncate">{sesion.profesional_nombre}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color} whitespace-nowrap`}>
                    {config.label}
                  </span>
                </div>
              )
            })}

            {/* Quick link to full agenda */}
            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-cyan-600 hover:text-cyan-700 h-7"
                onClick={() => router.push("/agenda")}
              >
                Ver toda la agenda
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Search,
  Eye,
  Bone,
  HeartPulse,
  Loader2,
} from "lucide-react"

interface Historia {
  id: string
  codigo_unico: string
  tipo_historia: "traumatologica" | "fisioterapeutica"
  paciente_id: string
  paciente_nombres: string
  paciente_apellidos: string
  paciente_documento: string
  diagnostico_principal: string
  creado_en: string
}

type FiltroTipo = "todas" | "traumatologica" | "fisioterapeutica"

export default function HistoriasClinicasPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [historias, setHistorias] = useState<Historia[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todas")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")
    if (!userData || !token) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchHistorias(token)
    }
  }, [router])

  const fetchHistorias = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/historias-clinicas", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) throw new Error("Error al cargar historias clinicas")
      const data = await response.json()
      if (data.success && data.data) {
        setHistorias(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = historias.filter((h) => {
    const matchesTipo = filtroTipo === "todas" || h.tipo_historia === filtroTipo
    if (!matchesTipo) return false
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      (h.paciente_nombres || "").toLowerCase().includes(term) ||
      (h.paciente_apellidos || "").toLowerCase().includes(term) ||
      (h.paciente_documento || "").toLowerCase().includes(term) ||
      (h.codigo_unico || "").toLowerCase().includes(term) ||
      (h.diagnostico_principal || "").toLowerCase().includes(term)
    )
  })

  const countByType = (tipo: string) => historias.filter((h) => h.tipo_historia === tipo).length

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Historias Clinicas</h1>
              <p className="text-sm text-slate-500 mt-1">
                Gestiona las historias clinicas traumatologicas y fisioterapeuticas de los pacientes
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button
                onClick={() => router.push("/historias-clinicas/nueva/traumatologica")}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Bone className="h-4 w-4" />
                Nueva HC Traumatologica
              </Button>
              <Button
                onClick={() => router.push("/historias-clinicas/nueva/fisioterapeutica")}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <HeartPulse className="h-4 w-4" />
                Nueva HC Fisioterapeutica
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="border-slate-200">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Total</p>
                    <p className="text-2xl font-bold text-slate-900">{historias.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-slate-300" />
                </CardContent>
              </Card>
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-600 font-medium">Traumatologicas</p>
                    <p className="text-2xl font-bold text-blue-700">{countByType("traumatologica")}</p>
                  </div>
                  <Bone className="h-8 w-8 text-blue-300" />
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Fisioterapeuticas</p>
                    <p className="text-2xl font-bold text-emerald-700">{countByType("fisioterapeutica")}</p>
                  </div>
                  <HeartPulse className="h-8 w-8 text-emerald-300" />
                </CardContent>
              </Card>
            </div>

            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por paciente, documento, codigo o diagnostico..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-10 border-slate-200 bg-white"
                />
              </div>
              <div className="flex gap-1 bg-white border border-slate-200 rounded-md p-1">
                {([
                  { key: "todas" as const, label: "Todas" },
                  { key: "traumatologica" as const, label: "Traumatologicas" },
                  { key: "fisioterapeutica" as const, label: "Fisioterapeuticas" },
                ]).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFiltroTipo(f.key)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      filtroTipo === f.key
                        ? "bg-cyan-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 text-cyan-600 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">
                  {searchTerm || filtroTipo !== "todas"
                    ? "No se encontraron historias clinicas con esos filtros"
                    : "No hay historias clinicas registradas"}
                </p>
                {!searchTerm && filtroTipo === "todas" && (
                  <p className="text-sm text-slate-400 mt-1">Crea la primera historia clinica usando los botones de arriba</p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((historia) => {
                  const esTrauma = historia.tipo_historia === "traumatologica"
                  return (
                    <Card
                      key={historia.id}
                      className="border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer"
                      onClick={() => router.push(`/historias-clinicas/${historia.id}`)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1.5">
                              <span className="font-mono text-sm font-semibold text-cyan-700">
                                {historia.codigo_unico}
                              </span>
                              <Badge
                                className={
                                  esTrauma
                                    ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    : "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                }
                              >
                                {esTrauma ? "Traumatologica" : "Fisioterapeutica"}
                              </Badge>
                            </div>
                            <p className="font-medium text-slate-900 truncate">
                              {historia.paciente_nombres} {historia.paciente_apellidos}
                            </p>
                            <p className="text-sm text-slate-500 mt-0.5 truncate">
                              {historia.diagnostico_principal || "Sin diagnostico"}
                              {historia.creado_en &&
                                ` - ${new Date(historia.creado_en).toLocaleDateString("es-ES", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}`}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200 shrink-0 ml-4"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/historias-clinicas/${historia.id}`)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                            Ver
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

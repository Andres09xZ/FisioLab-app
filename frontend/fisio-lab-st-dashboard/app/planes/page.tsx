"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Calendar, ChevronDown, ChevronRight, Clock, Target } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Plan {
  id: string
  evaluacion_id: string
  objetivos: string
  total_sesiones: number
  frecuencia_semanal: number
  fecha_inicio: string
  estado: string
  nombre_paciente?: string
  diagnostico_fisio?: string
  sesiones_completadas?: number
  sesiones_pendientes?: number
  porcentaje_completado?: number
  notas?: string
}

interface PacienteConPlanes {
  nombre_paciente: string
  planes: Plan[]
}

type FiltroEstado = 'todos' | 'activo' | 'pausado' | 'completado'

const DRAFT_KEY = "plan_tratamiento_draft"

// Función helper para formatear fechas de forma segura
const formatearFecha = (fecha: string | Date | null | undefined, formato: string): string => {
  if (!fecha) return "Sin fecha"
  try {
    const date = new Date(fecha)
    if (isNaN(date.getTime())) return "Fecha inválida"
    const fechaFormateada = format(date, formato, { locale: es })
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
  } catch {
    return "Fecha inválida"
  }
}

// Componente de barra de progreso inline
const ProgressBar = ({ completadas, total }: { completadas: number; total: number }) => {
  const porcentaje = total > 0 ? (completadas / total) * 100 : 0
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-cyan-600 rounded-full transition-all"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
      <span className="text-xs text-slate-500">{completadas}/{total}</span>
    </div>
  )
}

export default function PlanesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [planes, setPlanes] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [checkingDraft, setCheckingDraft] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todos')
  const [expandedPacientes, setExpandedPacientes] = useState<Set<string>>(new Set())
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

  // Verificar borrador ANTES de renderizar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedDraft = localStorage.getItem(DRAFT_KEY)
      if (savedDraft) {
        router.push("/planes/crear")
      } else {
        setCheckingDraft(false)
      }
    }
  }, [router])

  useEffect(() => {
    if (checkingDraft) return
    
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchPlanes(token)
    }
  }, [router, checkingDraft])

  const fetchPlanes = async (token: string) => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/v2/planes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar planes")

      const data = await response.json()
      if (data.success && data.data) {
        setPlanes(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los planes de tratamiento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePaciente = (nombre: string) => {
    setExpandedPacientes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(nombre)) {
        newSet.delete(nombre)
      } else {
        newSet.add(nombre)
      }
      return newSet
    })
  }

  const getEstadoBadge = (estado: string) => {
    const estados: Record<string, { bg: string; text: string; border: string; label: string }> = {
      ACTIVO: { bg: "bg-cyan-50/80", text: "text-cyan-700", border: "border-cyan-200/60", label: "Activo" },
      PAUSADO: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200/60", label: "Pausado" },
      PENDIENTE_CIERRE: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", label: "Pendiente Cierre" },
      COMPLETADO: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200/60", label: "Completado" },
      CANCELADO: { bg: "bg-red-50/80", text: "text-red-700", border: "border-red-200/60", label: "Cancelado" },
    }
    
    const config = estados[estado] || estados.ACTIVO
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bg} border ${config.border}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.text === 'text-cyan-700' ? 'bg-cyan-500' : config.text === 'text-amber-700' ? 'bg-amber-500' : config.text === 'text-emerald-700' ? 'bg-emerald-500' : config.text === 'text-red-700' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
        <span className={`text-xs font-medium ${config.text}`}>{config.label}</span>
      </div>
    )
  }

  // Agrupar planes por paciente
  const agruparPorPaciente = (): PacienteConPlanes[] => {
    const mapa = new Map<string, Plan[]>()
    
    const planesFiltrados = planes.filter(plan => {
      const cumpleBusqueda = !searchTerm || 
        (plan.nombre_paciente || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.diagnostico_fisio || "").toLowerCase().includes(searchTerm.toLowerCase())
      
      const cumpleFiltro = filtroEstado === 'todos' || plan.estado === filtroEstado.toUpperCase()
      
      return cumpleBusqueda && cumpleFiltro
    })
    
    planesFiltrados.forEach(plan => {
      const nombre = plan.nombre_paciente || "Sin nombre"
      if (!mapa.has(nombre)) {
        mapa.set(nombre, [])
      }
      mapa.get(nombre)!.push(plan)
    })
    
    return Array.from(mapa.entries())
      .map(([nombre_paciente, planes]) => ({
        nombre_paciente,
        planes: planes.sort((a, b) => new Date(b.fecha_inicio).getTime() - new Date(a.fecha_inicio).getTime()),
      }))
      .sort((a, b) => new Date(b.planes[0].fecha_inicio).getTime() - new Date(a.planes[0].fecha_inicio).getTime())
  }

  const pacientesAgrupados = agruparPorPaciente()
  const totalPlanesFiltrados = pacientesAgrupados.reduce((acc, p) => acc + p.planes.length, 0)

  // No renderizar nada mientras verifica borrador
  if (checkingDraft) return null
  if (!user) return null

  return (
    <div className="flex h-screen bg-slate-50">
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
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Planes de Tratamiento
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {pacientesAgrupados.length} {pacientesAgrupados.length === 1 ? 'paciente' : 'pacientes'}
                    {' '}({totalPlanesFiltrados} {totalPlanesFiltrados === 1 ? 'plan' : 'planes'})
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/planes/crear")}
                  className="gap-2 h-10 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Plan
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600/20 focus:border-cyan-600 transition-all"
                />
              </div>

              {/* Filtros */}
              <div className="mt-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">Estado:</span>
                  <div className="flex gap-1">
                    <Button
                      variant={filtroEstado === 'todos' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('todos')}
                      className={filtroEstado === 'todos' ? 'bg-cyan-600 hover:bg-cyan-700' : 'hover:bg-slate-50'}
                    >
                      Todos
                    </Button>
                    <Button
                      variant={filtroEstado === 'activo' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('activo')}
                      className={filtroEstado === 'activo' ? 'bg-cyan-600 hover:bg-cyan-700' : 'hover:bg-cyan-50'}
                    >
                      Activos
                    </Button>
                    <Button
                      variant={filtroEstado === 'pausado' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('pausado')}
                      className={filtroEstado === 'pausado' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50'}
                    >
                      Pausados
                    </Button>
                    <Button
                      variant={filtroEstado === 'completado' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('completado')}
                      className={filtroEstado === 'completado' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}
                    >
                      Completados
                    </Button>
                  </div>
                </div>

                {(filtroEstado !== 'todos' || searchTerm) && (
                  <>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFiltroEstado('todos')
                        setSearchTerm('')
                      }}
                      className="text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      Limpiar filtros
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-slate-500">Cargando planes...</div>
              </div>
            )}

            {/* Empty State */}
            {!loading && pacientesAgrupados.length === 0 && (
              <div className="bg-white border border-slate-200 rounded p-12 text-center">
                <Target className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <div className="text-slate-400 mb-2">Sin planes de tratamiento</div>
                <p className="text-sm text-slate-500">
                  {searchTerm ? 'No se encontraron planes con ese criterio' : 'Crea el primer plan de tratamiento para comenzar'}
                </p>
              </div>
            )}

            {/* Lista de Pacientes */}
            <div className="space-y-3">
              {pacientesAgrupados.map((paciente) => {
                const isExpanded = expandedPacientes.has(paciente.nombre_paciente)
                const planReciente = paciente.planes[0]
                const totalSesiones = planReciente.total_sesiones
                const completadas = planReciente.sesiones_completadas || 0
                
                return (
                  <div
                    key={paciente.nombre_paciente}
                    className="bg-white border border-slate-200 rounded overflow-hidden transition-all"
                  >
                    {/* Header del Paciente */}
                    <div
                      onClick={() => togglePaciente(paciente.nombre_paciente)}
                      className="p-4 cursor-pointer group hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {/* Chevron */}
                          <div className="text-slate-400 transition-transform duration-200">
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5" />
                            ) : (
                              <ChevronRight className="h-5 w-5" />
                            )}
                          </div>

                          {/* Info del Paciente */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-slate-900 text-base">
                                {paciente.nombre_paciente}
                              </h3>
                              <span className="text-xs text-slate-500">
                                {paciente.planes.length} {paciente.planes.length === 1 ? 'plan' : 'planes'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {formatearFecha(planReciente.fecha_inicio, "EEEE d 'de' MMMM 'de' yyyy")}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="truncate max-w-xs">
                                {planReciente.diagnostico_fisio || "Sin diagnóstico"}
                              </span>
                            </div>
                          </div>

                          {/* Progreso y Estado */}
                          <div className="flex items-center gap-4">
                            <ProgressBar completadas={completadas} total={totalSesiones} />
                            {getEstadoBadge(planReciente.estado)}
                          </div>

                          {/* Botón Agendar (visible al hover) */}
                          {planReciente.estado === "ACTIVO" && (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/planes/${planReciente.id}/generar-sesiones`)
                              }}
                              variant="outline"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs border-cyan-600 text-cyan-600 hover:bg-cyan-600/5"
                            >
                              <Calendar className="h-3 w-3 mr-1" />
                              Agendar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalle de Planes (expandible) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-4">
                        <div className="pl-9">
                          <div className="space-y-3">
                            {paciente.planes.map((plan, index) => {
                              const isLast = index === paciente.planes.length - 1
                              const progreso = plan.porcentaje_completado || 0
                              
                              return (
                                <div
                                  key={plan.id}
                                  className="relative pl-6 pb-3 group"
                                >
                                  {/* Línea vertical timeline */}
                                  {!isLast && (
                                    <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-200"></div>
                                  )}
                                  
                                  {/* Punto timeline */}
                                  <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 ${plan.estado === 'ACTIVO' ? 'border-cyan-600' : plan.estado === 'COMPLETADO' ? 'border-emerald-500' : 'border-slate-300'} bg-white`}></div>

                                  {/* Contenido Plan */}
                                  <div className="bg-white border border-slate-200 rounded p-3 hover:border-slate-300 transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          {getEstadoBadge(plan.estado)}
                                          <span className="text-xs text-slate-500">
                                            {formatearFecha(plan.fecha_inicio, "EEEE d 'de' MMMM 'de' yyyy")}
                                          </span>
                                        </div>
                                        <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                                          {plan.diagnostico_fisio || "Sin diagnóstico"}
                                        </p>
                                        <div className="flex items-center gap-4">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-slate-500">Sesiones:</span>
                                            <ProgressBar completadas={plan.sesiones_completadas || 0} total={plan.total_sesiones} />
                                          </div>
                                          <span className="text-xs text-slate-500">
                                            {plan.frecuencia_semanal}x semana
                                          </span>
                                          <span className="text-xs text-slate-500">
                                            {Math.round(progreso)}% completado
                                          </span>
                                        </div>
                                      </div>

                                      {/* Acciones (visibles al hover) */}
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => router.push(`/planes/${plan.id}`)}
                                          className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                          title="Ver detalles"
                                        >
                                          <Eye className="h-4 w-4 text-slate-600" />
                                        </button>
                                        {plan.estado === "ACTIVO" && (
                                          <button
                                            onClick={() => router.push(`/planes/${plan.id}/generar-sesiones`)}
                                            className="p-1.5 hover:bg-cyan-600/5 rounded transition-colors"
                                            title="Agendar sesiones"
                                          >
                                            <Calendar className="h-4 w-4 text-cyan-600" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

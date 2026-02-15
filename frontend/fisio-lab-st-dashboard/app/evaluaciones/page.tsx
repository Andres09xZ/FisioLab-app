"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Edit, Trash2, ChevronDown, ChevronRight, Clock, TrendingDown, TrendingUp, Minus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Evaluacion {
  id: string
  paciente_id: string
  profesional_id: string
  motivo_consulta: string
  historia_enfermedad_actual: string
  diagnostico_fisio: string
  hallazgos_clinicos: string
  eva_score: number
  antecedentes: string[]
  version_numero: number
  es_activa: boolean
  fecha_creacion: string
  nombre_paciente?: string
  nombre_profesional?: string
  tiene_plan?: boolean
}

interface PacienteConEvaluaciones {
  paciente_id: string
  nombre_paciente: string
  evaluaciones: Evaluacion[]
}

type FiltroEstado = 'todas' | 'con-plan' | 'sin-plan' | 'activas'

// Función helper para formatear fechas de forma segura
const formatearFecha = (fecha: string | Date | null | undefined, formato: string): string => {
  if (!fecha) return "Fecha inválida"
  
  try {
    const date = new Date(fecha)
    if (isNaN(date.getTime())) {
      return "Fecha inválida"
    }
    const fechaFormateada = format(date, formato, { locale: es })
    // Capitalizar la primera letra (para días de la semana)
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1)
  } catch (error) {
    return "Fecha inválida"
  }
}

// Componente Sparkline médico
const Sparkline = ({ scores }: { scores: number[] }) => {
  if (scores.length === 0) return null
  
  const max = 10 // EVA máximo
  const width = 80
  const height = 24
  const padding = 2
  
  const actualHeight = height - padding * 2
  const points = scores.map((score, i) => {
    const x = (i / Math.max(scores.length - 1, 1)) * width
    const y = height - (score / max) * actualHeight - padding
    return `${x},${y}`
  }).join(' ')
  
  // Determinar color basado en tendencia
  const trend = scores.length > 1 ? scores[scores.length - 1] - scores[0] : 0
  const color = trend < -1 ? '#10b981' : trend > 1 ? '#f59e0b' : '#6b7280'
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {scores.map((score, i) => {
        const x = (i / Math.max(scores.length - 1, 1)) * width
        const y = height - (score / max) * actualHeight - padding
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.5"
            fill={color}
            className="opacity-60"
          />
        )
      })}
    </svg>
  )
}

export default function EvaluacionesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [pacientes, setPacientes] = useState<PacienteConEvaluaciones[]>([])
  const [expandedPacientes, setExpandedPacientes] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('todas')
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
      fetchEvaluaciones(token)
    }
  }, [router])

  const fetchEvaluaciones = async (token: string) => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/v2/evaluaciones", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar evaluaciones")

      const data = await response.json()
      if (data.success && data.data) {
        // Cargar planes para verificar cuáles evaluaciones tienen plan
        const planesResponse = await fetch("http://localhost:3001/api/v2/planes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        const planesData = await planesResponse.json()
        const evaluacionesConPlan = new Set<string>()
        
        if (planesData.success && planesData.data) {
          planesData.data.forEach((plan: any) => {
            if (plan.evaluacion_id) {
              evaluacionesConPlan.add(plan.evaluacion_id)
            }
          })
        }
        
        // Agrupar evaluaciones por paciente
        const evaluacionesPorPaciente = new Map<string, Evaluacion[]>()
        
        data.data.forEach((evaluacion: Evaluacion) => {
          const pacienteId = evaluacion.paciente_id
          // Marcar si tiene plan
          evaluacion.tiene_plan = evaluacionesConPlan.has(evaluacion.id)
          
          if (!evaluacionesPorPaciente.has(pacienteId)) {
            evaluacionesPorPaciente.set(pacienteId, [])
          }
          evaluacionesPorPaciente.get(pacienteId)!.push(evaluacion)
        })
        
        // Convertir a array de pacientes con sus evaluaciones
        const pacientesArray: PacienteConEvaluaciones[] = Array.from(evaluacionesPorPaciente.entries()).map(([paciente_id, evaluaciones]) => {
          // Ordenar evaluaciones por versión descendente (más reciente primero)
          const evaluacionesOrdenadas = evaluaciones.sort((a, b) => b.version_numero - a.version_numero)
          
          return {
            paciente_id,
            nombre_paciente: evaluacionesOrdenadas[0].nombre_paciente || "Sin nombre",
            evaluaciones: evaluacionesOrdenadas,
          }
        })
        
        // Ordenar pacientes por fecha de evaluación más reciente
        pacientesArray.sort((a, b) => {
          const fechaA = new Date(a.evaluaciones[0].fecha_creacion).getTime()
          const fechaB = new Date(b.evaluaciones[0].fecha_creacion).getTime()
          return fechaB - fechaA
        })
        
        setPacientes(pacientesArray)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las evaluaciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const togglePaciente = (pacienteId: string) => {
    setExpandedPacientes(prev => {
      const newSet = new Set(prev)
      if (newSet.has(pacienteId)) {
        newSet.delete(pacienteId)
      } else {
        newSet.add(pacienteId)
      }
      return newSet
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta evaluación? Esta acción eliminará también los planes de tratamiento asociados.")) {
      return
    }

    try {
      const token = localStorage.getItem("fisiolab_token")
      const response = await fetch(`http://localhost:3001/api/v2/evaluaciones/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ motivo: "Eliminación desde interfaz de usuario" }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al eliminar evaluación")
      }

      toast({
        title: "Evaluación eliminada",
        description: "La evaluación se eliminó correctamente",
      })

      // Recargar lista
      if (token) fetchEvaluaciones(token)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la evaluación",
        variant: "destructive",
      })
    }
  }

  const getEvaScoreBadge = (score: number) => {
    if (score <= 3) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50/80 border border-emerald-200/60">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <span className="text-xs font-medium text-emerald-700">{score}</span>
        </div>
      )
    } else if (score <= 6) {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/80 border border-amber-200/60">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
          <span className="text-xs font-medium text-amber-700">{score}</span>
        </div>
      )
    } else {
      return (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50/80 border border-rose-200/60">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
          <span className="text-xs font-medium text-rose-700">{score}</span>
        </div>
      )
    }
  }

  const getTendenciaIcon = (evaluaciones: Evaluacion[]) => {
    if (evaluaciones.length < 2) return <Minus className="h-3.5 w-3.5 text-slate-400" />
    
    const primeraEva = evaluaciones[evaluaciones.length - 1].eva_score
    const ultimaEva = evaluaciones[0].eva_score
    const diferencia = ultimaEva - primeraEva
    
    if (diferencia < -1) {
      return <TrendingDown className="h-3.5 w-3.5 text-emerald-600" />
    } else if (diferencia > 1) {
      return <TrendingUp className="h-3.5 w-3.5 text-amber-600" />
    }
    return <Minus className="h-3.5 w-3.5 text-slate-400" />
  }

  const extraerDiagnosticoPrincipal = (texto: string): string => {
    if (!texto) return "Sin diagnóstico"
    // Tomar primeras 3-4 palabras significativas
    const palabras = texto.split(' ').filter(p => p.length > 2)
    return palabras.slice(0, 4).join(' ') + (palabras.length > 4 ? '...' : '')
  }

  const aplicarFiltros = (pacientes: PacienteConEvaluaciones[]): PacienteConEvaluaciones[] => {
    return pacientes
      .map(paciente => {
        // Filtrar evaluaciones del paciente según los criterios
        let evaluacionesFiltradas = paciente.evaluaciones.filter(evaluacion => {
          // Filtro de búsqueda por nombre
          const cumpleBusqueda = paciente.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase())
          if (!cumpleBusqueda && searchTerm) return false
          
          // Filtro de estado (con plan / sin plan / activas)
          if (filtroEstado === 'con-plan' && !evaluacion.tiene_plan) return false
          if (filtroEstado === 'sin-plan' && evaluacion.tiene_plan) return false
          if (filtroEstado === 'activas' && !evaluacion.es_activa) return false
          
          return true
        })
        
        return {
          ...paciente,
          evaluaciones: evaluacionesFiltradas
        }
      })
      // Filtrar pacientes que no tengan evaluaciones después del filtrado
      .filter(paciente => paciente.evaluaciones.length > 0)
  }

  const pacientesFiltrados = aplicarFiltros(pacientes)

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
                    Evaluaciones Fisioterapéuticas
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {pacientesFiltrados.length} {pacientesFiltrados.length === 1 ? 'paciente' : 'pacientes'}
                    {' '}({pacientesFiltrados.reduce((acc, p) => acc + p.evaluaciones.length, 0)} {pacientesFiltrados.reduce((acc, p) => acc + p.evaluaciones.length, 0) === 1 ? 'evaluación' : 'evaluaciones'})
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/evaluaciones/nueva")}
                  className="gap-2 h-10 bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Evaluación
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
                      variant={filtroEstado === 'todas' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('todas')}
                      className={filtroEstado === 'todas' ? 'bg-cyan-600 hover:bg-cyan-700' : 'hover:bg-slate-50'}
                    >
                      Todas
                    </Button>
                    <Button
                      variant={filtroEstado === 'con-plan' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('con-plan')}
                      className={filtroEstado === 'con-plan' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50'}
                    >
                      Con Plan
                    </Button>
                    <Button
                      variant={filtroEstado === 'sin-plan' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('sin-plan')}
                      className={filtroEstado === 'sin-plan' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50'}
                    >
                      Sin Plan
                    </Button>
                    <Button
                      variant={filtroEstado === 'activas' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFiltroEstado('activas')}
                      className={filtroEstado === 'activas' ? 'bg-cyan-600 hover:bg-cyan-700' : 'hover:bg-cyan-50'}
                    >
                      Activas
                    </Button>
                  </div>
                </div>

                {(filtroEstado !== 'todas' || searchTerm) && (
                  <>
                    <div className="h-6 w-px bg-slate-200"></div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFiltroEstado('todas')
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
                <div className="text-slate-500">Cargando evaluaciones...</div>
              </div>
            )}

            {/* Empty State */}
            {!loading && pacientesFiltrados.length === 0 && (
              <div className="bg-white border border-slate-200 rounded p-12 text-center">
                <div className="text-slate-400 mb-2">Sin evaluaciones</div>
                <p className="text-sm text-slate-500">
                  {searchTerm ? 'No se encontraron pacientes con ese nombre' : 'Crea la primera evaluación para comenzar'}
                </p>
              </div>
            )}

            {/* Lista de Pacientes */}
            <div className="space-y-3">
              {pacientesFiltrados.map((paciente) => {
                const isExpanded = expandedPacientes.has(paciente.paciente_id)
                const evaluacionReciente = paciente.evaluaciones[0]
                const evaScores = paciente.evaluaciones.map(e => e.eva_score).reverse()
                
                return (
                  <div
                    key={paciente.paciente_id}
                    className="bg-white border border-slate-200 rounded overflow-hidden transition-all"
                  >
                    {/* Header del Paciente */}
                    <div
                      onClick={() => togglePaciente(paciente.paciente_id)}
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
                                {paciente.evaluaciones.length} {paciente.evaluaciones.length === 1 ? 'evaluación' : 'evaluaciones'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {formatearFecha(evaluacionReciente.fecha_creacion, "EEEE d 'de' MMMM 'de' yyyy")}
                              </span>
                              <span className="text-slate-400">•</span>
                              <span className="truncate max-w-xs">
                                {extraerDiagnosticoPrincipal(evaluacionReciente.diagnostico_fisio)}
                              </span>
                            </div>
                          </div>

                          {/* Sparkline y Tendencia */}
                          <div className="flex items-center gap-4">
                            {evaScores.length > 1 && (
                              <div className="flex items-center gap-2">
                                <Sparkline scores={evaScores} />
                                {getTendenciaIcon(paciente.evaluaciones)}
                              </div>
                            )}
                            {getEvaScoreBadge(evaluacionReciente.eva_score)}
                          </div>

                          {/* Botón Nueva Evaluación (visible al hover) */}
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/evaluaciones/nueva?pacienteId=${paciente.paciente_id}`)
                            }}
                            variant="outline"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 text-xs border-cyan-600 text-cyan-600 hover:bg-cyan-600/5"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Nueva
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline de Evaluaciones (expandible) */}
                    {isExpanded && (
                      <div className="border-t border-slate-100 bg-slate-50/30 px-4 py-4">
                        <div className="pl-9">
                          <div className="space-y-3">
                            {paciente.evaluaciones.map((evaluacion, index) => {
                              const isLast = index === paciente.evaluaciones.length - 1
                              
                              return (
                                <div
                                  key={evaluacion.id}
                                  className="relative pl-6 pb-3 group"
                                >
                                  {/* Línea vertical timeline */}
                                  {!isLast && (
                                    <div className="absolute left-2 top-6 bottom-0 w-px bg-slate-200"></div>
                                  )}
                                  
                                  {/* Punto timeline */}
                                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-cyan-600 bg-white"></div>

                                  {/* Contenido Evaluación */}
                                  <div className="bg-white border border-slate-200 rounded p-3 hover:border-slate-300 transition-all">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                          <span className="text-xs font-medium text-cyan-600">
                                            v{evaluacion.version_numero}
                                          </span>
                                          {evaluacion.es_activa && (
                                            <Badge className="h-4 px-1.5 text-[10px] bg-cyan-50 text-cyan-700 border-cyan-200">
                                              Activa
                                            </Badge>
                                          )}
                                          {evaluacion.tiene_plan && (
                                            <Badge className="h-4 px-1.5 text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                                              Con Plan
                                            </Badge>
                                          )}
                                          <span className="text-xs text-slate-500">
                                            {formatearFecha(evaluacion.fecha_creacion, "EEEE d 'de' MMMM 'de' yyyy, HH:mm")}
                                          </span>
                                        </div>
                                        <p className="text-sm text-slate-700 line-clamp-2 mb-2">
                                          {evaluacion.diagnostico_fisio}
                                        </p>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-slate-500">EVA:</span>
                                          {getEvaScoreBadge(evaluacion.eva_score)}
                                        </div>
                                      </div>

                                      {/* Acciones (visibles al hover) */}
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                          onClick={() => router.push(`/evaluaciones/${evaluacion.id}`)}
                                          className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                          title="Ver detalles"
                                        >
                                          <Eye className="h-4 w-4 text-slate-600" />
                                        </button>
                                        {evaluacion.es_activa && (
                                          <button
                                            onClick={() => router.push(`/evaluaciones/${evaluacion.id}/editar`)}
                                            className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                                            title="Editar"
                                          >
                                            <Edit className="h-4 w-4 text-slate-600" />
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleDelete(evaluacion.id)}
                                          className="p-1.5 hover:bg-red-50 rounded transition-colors"
                                          title="Eliminar"
                                        >
                                          <Trash2 className="h-4 w-4 text-red-600" />
                                        </button>
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

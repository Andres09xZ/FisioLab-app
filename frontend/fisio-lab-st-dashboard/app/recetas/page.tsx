"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Download, Edit, Trash2, FileText, Search, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Receta {
  id: string
  codigo_receta: string
  paciente_nombre_completo: string
  diagnostico_principal: string
  fecha_emision: string
  fecha_vencimiento: string
  estado: string
}

export default function RecetasPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [recetas, setRecetas] = useState<Receta[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sidebar-collapsed")
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Filtros
  const [filters, setFilters] = useState({
    search: "",
    estado: "all",
    fechaDesde: "",
    fechaHasta: "",
  })

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    delMes: 0
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidebar-collapsed", JSON.stringify(sidebarCollapsed))
    }
  }, [sidebarCollapsed])

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    const token = localStorage.getItem("fisiolab_token")

    if (!userData || !token) {
      router.push("/login")
    } else {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      fetchRecetas()
    }
  }, [router])

  const fetchRecetas = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem("fisiolab_token")
      const params = new URLSearchParams()
      
      if (filters.search) params.append("search", filters.search)
      if (filters.estado !== "all") params.append("status", filters.estado)

      const response = await fetch(`http://localhost:3001/api/recetas?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      
      if (data.success && data.data) {
        setRecetas(data.data)
        
        // Calcular estadísticas
        const total = data.data.length
        const activas = data.data.filter((r: Receta) => r.estado === 'activa').length
        const mesActual = new Date().getMonth()
        const delMes = data.data.filter((r: Receta) => {
          const fechaEmision = new Date(r.fecha_emision)
          return fechaEmision.getMonth() === mesActual
        }).length
        
        setStats({ total, activas, delMes })
      }
    } catch (error) {
      console.error("Error al cargar recetas:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las recetas",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro que desea anular esta receta?")) return
    
    try {
      const token = localStorage.getItem("fisiolab_token")
      const response = await fetch(`http://localhost:3001/api/recetas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "Éxito",
          description: "Receta anulada correctamente",
        })
        fetchRecetas()
      }
    } catch (error) {
      console.error("Error al anular receta:", error)
      toast({
        title: "Error",
        description: "No se pudo anular la receta",
        variant: "destructive",
      })
    }
  }

  const handleDownloadPDF = (id: string) => {
    toast({
      title: "Función pendiente",
      description: "La descarga de PDF estará disponible pronto",
    })
  }

  const getEstadoBadge = (estado: string) => {
    const badges = {
      activa: { label: "Activa", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300" },
      vencida: { label: "Vencida", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-300" },
      anulada: { label: "Anulada", bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-300" },
    }
    const badge = badges[estado as keyof typeof badges] || badges.activa
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
        {badge.label}
      </span>
    )
  }

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-EC', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Registro de Recetas Médicas</h1>
                  <p className="text-sm text-slate-600 mt-1">Prescripciones con código CIE-10</p>
                </div>
                <Button
                  onClick={() => router.push("/recetas/nueva")}
                  className="gap-2 h-10 bg-cyan-600 hover:bg-cyan-700 border border-cyan-600"
                >
                  <FileText className="h-4 w-4" />
                  Nueva Receta
                </Button>
              </div>
            </div>

            {/* Filtros */}
            <Card className="mb-6 border border-slate-300 rounded">
              <CardContent className="p-6 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Búsqueda */}
                  <div className="md:col-span-1">
                    <Label htmlFor="search" className="text-sm font-medium text-slate-700 mb-2 block">
                      Buscar
                    </Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="search"
                        placeholder="Código, paciente o dx..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="pl-10 h-10 border-slate-300 bg-white focus:border-cyan-600"
                      />
                    </div>
                  </div>

                  {/* Filtro por estado */}
                  <div>
                    <Label htmlFor="estado" className="text-sm font-medium text-slate-700 mb-2 block">
                      Estado
                    </Label>
                    <Select
                      value={filters.estado}
                      onValueChange={(value) => setFilters(prev => ({ ...prev, estado: value }))}
                    >
                      <SelectTrigger id="estado" className="h-10 border-slate-300 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="activa">Activa</SelectItem>
                        <SelectItem value="vencida">Vencida</SelectItem>
                        <SelectItem value="anulada">Anulada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Rango de fechas */}
                  <div>
                    <Label htmlFor="fechaDesde" className="text-sm font-medium text-slate-700 mb-2 block">
                      Desde
                    </Label>
                    <Input
                      id="fechaDesde"
                      type="date"
                      value={filters.fechaDesde}
                      onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value }))}
                      className="h-10 border-slate-300 bg-white focus:border-cyan-600"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fechaHasta" className="text-sm font-medium text-slate-700 mb-2 block">
                      Hasta
                    </Label>
                    <Input
                      id="fechaHasta"
                      type="date"
                      value={filters.fechaHasta}
                      onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value }))}
                      className="h-10 border-slate-300 bg-white focus:border-cyan-600"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Button 
                    onClick={fetchRecetas} 
                    variant="outline" 
                    className="gap-2 h-10 border-slate-300 hover:border-cyan-600 hover:bg-cyan-50"
                  >
                    <Search className="h-4 w-4" />
                    Aplicar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de Recetas */}
            <Card className="border border-slate-300 rounded">
              <CardContent className="p-0 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-300 bg-slate-50">
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Diagnóstico CIE-10
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Emisión
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Vencimiento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {isLoading ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                            Cargando recetas...
                          </td>
                        </tr>
                      ) : recetas.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-sm text-slate-500">
                            No se encontraron recetas
                          </td>
                        </tr>
                      ) : (
                        recetas.map((receta) => (
                          <tr key={receta.id} className="hover:bg-slate-50 transition-colors border-b border-slate-200 last:border-0">
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm font-mono font-semibold text-cyan-700">{receta.codigo_receta}</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-sm font-medium text-slate-900">{receta.paciente_nombre_completo}</span>
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="text-sm text-slate-700">{receta.diagnostico_principal}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm text-slate-600">{formatFecha(receta.fecha_emision)}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm text-slate-600">{formatFecha(receta.fecha_vencimiento)}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              {getEstadoBadge(receta.estado)}
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/recetas/${receta.id}`)}
                                  title="Ver receta"
                                  className="h-8 w-8 p-0 hover:bg-slate-100"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDownloadPDF(receta.id)}
                                  title="Descargar PDF"
                                  className="h-8 w-8 p-0 hover:bg-slate-100"
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => router.push(`/recetas/${receta.id}/editar`)}
                                  title="Editar"
                                  disabled={receta.estado !== 'activa'}
                                  className="h-8 w-8 p-0 hover:bg-slate-100 disabled:opacity-40"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(receta.id)}
                                  title="Anular receta"
                                  disabled={receta.estado === 'anulada'}
                                  className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <Card className="border border-slate-300 rounded">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Emitidas</p>
                      <p className="text-3xl font-semibold text-slate-900 mt-2 font-mono">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center border border-slate-200">
                      <FileText className="h-6 w-6 text-slate-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-300 rounded">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Activas</p>
                      <p className="text-3xl font-semibold text-emerald-700 mt-2 font-mono">{stats.activas}</p>
                    </div>
                    <div className="w-12 h-12 rounded bg-emerald-50 flex items-center justify-center border border-emerald-200">
                      <FileText className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-slate-300 rounded">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Mes Actual</p>
                      <p className="text-3xl font-semibold text-slate-900 mt-2 font-mono">{stats.delMes}</p>
                    </div>
                    <div className="w-12 h-12 rounded bg-cyan-50 flex items-center justify-center border border-cyan-200">
                      <Calendar className="h-6 w-6 text-cyan-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

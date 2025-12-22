"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  Plus, ClipboardList, User, Calendar, FileText, Search, 
  Edit, Trash2, CheckCircle2, Clock, AlertCircle, Filter,
  ChevronDown, ChevronUp, Eye
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { actualizarSesion, Sesion } from "@/lib/api/citas"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

interface SesionExtendida extends Sesion {
  paciente_nombre?: string
  profesional_nombre?: string
  plan_objetivo?: string
}

export default function SesionesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [sesiones, setSesiones] = useState<SesionExtendida[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroEstado, setFiltroEstado] = useState<string>("todos")
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSesion, setSelectedSesion] = useState<SesionExtendida | null>(null)
  const [editForm, setEditForm] = useState({
    estado: "",
    notas_sesion: "",
    ejercicios: "",
    observaciones: ""
  })
  const [saving, setSaving] = useState(false)

  // Stats
  const [stats, setStats] = useState({
    hoy: 0,
    semana: 0,
    completadas: 0,
    pendientes: 0
  })

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchSesiones()
    }
  }, [router])

  const fetchSesiones = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/sesiones`)
      const json = await res.json()
      
      if (res.ok) {
        const data = json.data || json || []
        setSesiones(data)
        calculateStats(data)
      }
    } catch (error) {
      console.error('Error fetching sesiones:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las sesiones",
        variant: "destructive"
      })
    }
    setLoading(false)
  }

  const calculateStats = (data: SesionExtendida[]) => {
    const hoy = new Date()
    const inicioSemana = new Date(hoy)
    inicioSemana.setDate(hoy.getDate() - hoy.getDay())

    const newStats = {
      hoy: data.filter(s => {
        const fecha = new Date(s.fecha_programada || s.created_at || '')
        return fecha.toDateString() === hoy.toDateString()
      }).length,
      semana: data.filter(s => {
        const fecha = new Date(s.fecha_programada || s.created_at || '')
        return fecha >= inicioSemana
      }).length,
      completadas: data.filter(s => s.estado === 'completada').length,
      pendientes: data.filter(s => s.estado === 'pendiente' || s.estado === 'programada').length
    }
    setStats(newStats)
  }

  const handleEdit = (sesion: SesionExtendida) => {
    setSelectedSesion(sesion)
    setEditForm({
      estado: sesion.estado || "",
      notas_sesion: sesion.notas_sesion || "",
      ejercicios: sesion.ejercicios || "",
      observaciones: sesion.observaciones || ""
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedSesion) return
    
    setSaving(true)
    const result = await actualizarSesion(selectedSesion.id, editForm)
    
    if (result.success) {
      toast({
        title: "✅ Sesión actualizada",
        description: "Los cambios se guardaron correctamente"
      })
      fetchSesiones()
      setShowEditModal(false)
    } else {
      toast({
        title: "Error",
        description: result.error || "No se pudo actualizar la sesión",
        variant: "destructive"
      })
    }
    setSaving(false)
  }

  const handleDelete = (sesion: SesionExtendida) => {
    setSelectedSesion(sesion)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedSesion) return
    
    setSaving(true)
    try {
      const res = await fetch(`${API_BASE_URL}/sesiones/${selectedSesion.id}`, {
        method: 'DELETE'
      })
      
      if (res.ok) {
        toast({
          title: "Sesión eliminada",
          description: "La sesión se eliminó correctamente"
        })
        fetchSesiones()
        setShowDeleteModal(false)
      } else {
        const json = await res.json()
        toast({
          title: "Error",
          description: json.message || "No se pudo eliminar la sesión",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error de conexión",
        variant: "destructive"
      })
    }
    setSaving(false)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "completada":
        return "bg-[#E6FFF5] text-[#0AA640] border-[#0AA640]/30"
      case "en_progreso":
        return "bg-[#EBF5FF] text-[#056CF2] border-[#4BA4F2]/30"
      case "cancelada":
        return "bg-red-100 text-red-700 border-red-200"
      case "pendiente":
      case "programada":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "completada":
        return <CheckCircle2 className="h-4 w-4" />
      case "en_progreso":
        return <Clock className="h-4 w-4" />
      case "cancelada":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Filtrar sesiones
  const sesionesFiltradas = sesiones.filter(sesion => {
    const matchSearch = 
      (sesion.paciente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sesion.plan_objetivo?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sesion.notas_sesion?.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchEstado = filtroEstado === "todos" || sesion.estado === filtroEstado
    
    return (searchTerm === "" || matchSearch) && matchEstado
  })

  // Agrupar por paciente
  const sesionesPorPaciente = sesionesFiltradas.reduce((acc, sesion) => {
    const key = sesion.paciente_id || 'sin_paciente'
    if (!acc[key]) {
      acc[key] = {
        paciente_nombre: sesion.paciente_nombre || 'Paciente desconocido',
        paciente_id: sesion.paciente_id,
        sesiones: []
      }
    }
    acc[key].sesiones.push(sesion)
    return acc
  }, {} as Record<string, { paciente_nombre: string; paciente_id?: string; sesiones: SesionExtendida[] }>)

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sesiones</h1>
              <p className="text-gray-600 mt-1">
                Gestión de sesiones de tratamiento por paciente
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Hoy</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.hoy}</p>
                  </div>
                  <div className="p-3 bg-[#EBF5FF] rounded-full">
                    <Calendar className="h-6 w-6 text-[#056CF2]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Esta Semana</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.semana}</p>
                  </div>
                  <div className="p-3 bg-[#F5E6FF] rounded-full">
                    <ClipboardList className="h-6 w-6 text-[#D466F2]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completadas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completadas}</p>
                  </div>
                  <div className="p-3 bg-[#E6FFF5] rounded-full">
                    <CheckCircle2 className="h-6 w-6 text-[#0AA640]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-full">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card className="mb-6">
            <CardContent className="py-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por paciente, plan u observaciones..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="programada">Programada</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_progreso">En progreso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                      <SelectItem value="cancelada">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sesiones por Paciente */}
          {loading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#056CF2]"></div>
              </CardContent>
            </Card>
          ) : Object.keys(sesionesPorPaciente).length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClipboardList className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-2">No hay sesiones registradas</p>
                <p className="text-sm text-gray-500">
                  Las sesiones se crean automáticamente al agendar citas con un plan de tratamiento
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.values(sesionesPorPaciente).map((grupo) => (
                <PacienteSesionesCard
                  key={grupo.paciente_id || 'sin_paciente'}
                  pacienteNombre={grupo.paciente_nombre}
                  pacienteId={grupo.paciente_id}
                  sesiones={grupo.sesiones}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getEstadoColor={getEstadoColor}
                  getEstadoIcon={getEstadoIcon}
                  router={router}
                />
              ))}
            </div>
          )}
        </main>

        {/* Modal de Edición */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-[#056CF2]" />
                Editar Sesión
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select 
                  value={editForm.estado} 
                  onValueChange={(v) => setEditForm(prev => ({ ...prev, estado: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="programada">Programada</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="en_progreso">En progreso</SelectItem>
                    <SelectItem value="completada">Completada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Notas de la sesión</Label>
                <Textarea
                  value={editForm.notas_sesion}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notas_sesion: e.target.value }))}
                  placeholder="Describe el desarrollo de la sesión..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Ejercicios realizados</Label>
                <Textarea
                  value={editForm.ejercicios}
                  onChange={(e) => setEditForm(prev => ({ ...prev, ejercicios: e.target.value }))}
                  placeholder="Lista de ejercicios..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Observaciones</Label>
                <Textarea
                  value={editForm.observaciones}
                  onChange={(e) => setEditForm(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Observaciones adicionales..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModal(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveEdit} 
                disabled={saving}
                className="bg-[#056CF2] hover:bg-[#0558C9]"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Confirmación de Eliminación */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Eliminar Sesión
              </DialogTitle>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar esta sesión? Esta acción no se puede deshacer.
              </p>
              {selectedSesion && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
                  <p><strong>Paciente:</strong> {selectedSesion.paciente_nombre}</p>
                  <p><strong>Estado:</strong> {selectedSesion.estado}</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete} 
                disabled={saving}
              >
                {saving ? "Eliminando..." : "Sí, Eliminar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

// Componente de tarjeta de sesiones por paciente
function PacienteSesionesCard({
  pacienteNombre,
  pacienteId,
  sesiones,
  onEdit,
  onDelete,
  getEstadoColor,
  getEstadoIcon,
  router
}: {
  pacienteNombre: string
  pacienteId?: string
  sesiones: SesionExtendida[]
  onEdit: (sesion: SesionExtendida) => void
  onDelete: (sesion: SesionExtendida) => void
  getEstadoColor: (estado: string) => string
  getEstadoIcon: (estado: string) => React.ReactNode
  router: any
}) {
  const [expanded, setExpanded] = useState(true)
  
  const completadas = sesiones.filter(s => s.estado === 'completada').length
  const pendientes = sesiones.filter(s => s.estado === 'pendiente' || s.estado === 'programada').length

  return (
    <Card>
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#D466F2] to-[#056CF2] flex items-center justify-center text-white font-semibold">
              {pacienteNombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-lg">{pacienteNombre}</CardTitle>
              <p className="text-sm text-gray-500">
                {sesiones.length} sesiones • {completadas} completadas • {pendientes} pendientes
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {pacienteId && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/pacientes/${pacienteId}`)
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                Ver Paciente
              </Button>
            )}
            {expanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400" />
            )}
          </div>
        </div>
      </CardHeader>
      
      {expanded && (
        <CardContent>
          <div className="space-y-3">
            {sesiones.map((sesion) => (
              <div
                key={sesion.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-[#4BA4F2] transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className={`${getEstadoColor(sesion.estado)} flex items-center gap-1`}>
                        {getEstadoIcon(sesion.estado)}
                        {sesion.estado}
                      </Badge>
                      {sesion.numero_sesion && (
                        <span className="text-sm text-gray-500">
                          Sesión #{sesion.numero_sesion}
                        </span>
                      )}
                      {sesion.plan_objetivo && (
                        <span className="text-xs bg-[#F5E6FF] text-[#D466F2] px-2 py-1 rounded">
                          {sesion.plan_objetivo}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      {sesion.fecha_programada && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(sesion.fecha_programada), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })}
                        </div>
                      )}
                      {sesion.profesional_nombre && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {sesion.profesional_nombre}
                        </div>
                      )}
                      {sesion.notas_sesion && (
                        <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                          {sesion.notas_sesion}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onEdit(sesion)}
                      className="hover:bg-[#EBF5FF] hover:border-[#056CF2]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onDelete(sesion)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Search, 
  UserPlus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Award,
  Users,
  UserCheck,
  UserX,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { 
  fetchProfesionales, 
  crearProfesional, 
  actualizarProfesional, 
  eliminarProfesional,
  type CrearProfesionalData,
  type Profesional
} from "@/lib/api/citas"

// Colores predefinidos para la agenda
const COLORES_AGENDA = [
  { nombre: "Púrpura", valor: "#D466F2" },
  { nombre: "Azul", valor: "#056CF2" },
  { nombre: "Celeste", valor: "#4BA4F2" },
  { nombre: "Cyan", valor: "#04D9D9" },
  { nombre: "Verde", valor: "#0AA640" },
  { nombre: "Naranja", valor: "#F59E0B" },
  { nombre: "Rojo", valor: "#EF4444" },
  { nombre: "Rosa", valor: "#EC4899" },
  { nombre: "Índigo", valor: "#6366F1" },
  { nombre: "Teal", valor: "#14B8A6" },
]

interface ProfesionalExtendido extends Profesional {
  documento?: string;
  telefono?: string;
  color_agenda?: string;
  comision_porcentaje?: number;
}

const initialFormState: CrearProfesionalData = {
  nombre: "",
  apellido: "",
  documento: "",
  telefono: "",
  email: "",
  especialidad: "",
  color_agenda: "#D466F2",
  comision_porcentaje: 0,
  activo: true
}

export default function ProfesionalesPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActivo, setFilterActivo] = useState<boolean | null>(null)
  
  // Modales
  const [showModal, setShowModal] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingProfesional, setEditingProfesional] = useState<ProfesionalExtendido | null>(null)
  const [profesionalToDelete, setProfesionalToDelete] = useState<ProfesionalExtendido | null>(null)
  
  // Formulario
  const [formData, setFormData] = useState<CrearProfesionalData>(initialFormState)

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
    }
  }, [router])

  // Query de profesionales
  const { data: profesionalesData, isLoading } = useQuery({
    queryKey: ['profesionales'],
    queryFn: async () => {
      const result = await fetchProfesionales()
      if (!result.success) throw new Error(result.error)
      return result.data || []
    },
    enabled: !!user
  })

  const profesionales = profesionalesData || []

  // Filtrar profesionales
  const filteredProfesionales = profesionales.filter((prof: ProfesionalExtendido) => {
    // Filtro por estado activo
    if (filterActivo !== null && prof.activo !== filterActivo) {
      return false
    }
    
    // Filtro por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchNombre = prof.nombre?.toLowerCase().includes(term)
      const matchApellido = prof.apellido?.toLowerCase().includes(term)
      const matchDocumento = prof.documento?.includes(term)
      const matchEspecialidad = prof.especialidad?.toLowerCase().includes(term)
      
      if (!matchNombre && !matchApellido && !matchDocumento && !matchEspecialidad) {
        return false
      }
    }
    
    return true
  })

  // Estadísticas
  const stats = {
    total: profesionales.length,
    activos: profesionales.filter((p: ProfesionalExtendido) => p.activo).length,
    inactivos: profesionales.filter((p: ProfesionalExtendido) => !p.activo).length
  }

  // Mutación para crear
  const crearMutation = useMutation({
    mutationFn: crearProfesional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesionales'] })
      toast.success("Profesional creado exitosamente")
      handleCloseModal()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al crear profesional")
    }
  })

  // Mutación para actualizar
  const actualizarMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrearProfesionalData> }) => 
      actualizarProfesional(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesionales'] })
      toast.success("Profesional actualizado exitosamente")
      handleCloseModal()
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al actualizar profesional")
    }
  })

  // Mutación para eliminar
  const eliminarMutation = useMutation({
    mutationFn: eliminarProfesional,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profesionales'] })
      toast.success("Profesional eliminado exitosamente")
      setShowDeleteDialog(false)
      setProfesionalToDelete(null)
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al eliminar profesional")
    }
  })

  // Handlers
  const handleOpenCreate = () => {
    setEditingProfesional(null)
    setFormData(initialFormState)
    setShowModal(true)
  }

  const handleOpenEdit = (profesional: ProfesionalExtendido) => {
    setEditingProfesional(profesional)
    setFormData({
      nombre: profesional.nombre || "",
      apellido: profesional.apellido || "",
      documento: profesional.documento || "",
      telefono: profesional.telefono || "",
      email: profesional.email || "",
      especialidad: profesional.especialidad || "",
      color_agenda: profesional.color_agenda || "#D466F2",
      comision_porcentaje: profesional.comision_porcentaje || 0,
      activo: profesional.activo ?? true
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProfesional(null)
    setFormData(initialFormState)
  }

  const handleOpenDelete = (profesional: ProfesionalExtendido) => {
    setProfesionalToDelete(profesional)
    setShowDeleteDialog(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      toast.error("Nombre y apellido son requeridos")
      return
    }

    if (editingProfesional) {
      actualizarMutation.mutate({ id: editingProfesional.id, data: formData })
    } else {
      crearMutation.mutate(formData)
    }
  }

  const handleConfirmDelete = () => {
    if (profesionalToDelete) {
      eliminarMutation.mutate(profesionalToDelete.id)
    }
  }

  const isSubmitting = crearMutation.isPending || actualizarMutation.isPending

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
              <h1 className="text-2xl font-bold text-gray-900">Profesionales</h1>
              <p className="text-gray-600 mt-1">
                Gestiona el equipo de profesionales de la clínica
              </p>
            </div>
            <Button 
              onClick={handleOpenCreate}
              className="bg-[#D466F2] hover:bg-[#C050E0]"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Profesional
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#D466F2]/10 rounded-full">
                    <Users className="h-6 w-6 text-[#D466F2]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0AA640]/10 rounded-full">
                    <UserCheck className="h-6 w-6 text-[#0AA640]" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-[#0AA640]">{stats.activos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-100 rounded-full">
                    <UserX className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Inactivos</p>
                    <p className="text-2xl font-bold text-gray-500">{stats.inactivos}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por nombre, documento o especialidad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterActivo === null ? "default" : "outline"}
                    onClick={() => setFilterActivo(null)}
                    className={filterActivo === null ? "bg-[#056CF2] hover:bg-[#0458D9]" : ""}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filterActivo === true ? "default" : "outline"}
                    onClick={() => setFilterActivo(true)}
                    className={filterActivo === true ? "bg-[#0AA640] hover:bg-[#098A38]" : ""}
                  >
                    Activos
                  </Button>
                  <Button
                    variant={filterActivo === false ? "default" : "outline"}
                    onClick={() => setFilterActivo(false)}
                  >
                    Inactivos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profesionales List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#D466F2]" />
            </div>
          ) : filteredProfesionales.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">No se encontraron profesionales</p>
                <Button onClick={handleOpenCreate} variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear primer profesional
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfesionales.map((profesional: ProfesionalExtendido) => (
                <Card key={profesional.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar con color de agenda */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md"
                          style={{ backgroundColor: profesional.color_agenda || "#D466F2" }}
                        >
                          {profesional.nombre?.charAt(0) || ""}{profesional.apellido?.charAt(0) || ""}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {profesional.nombre} {profesional.apellido}
                          </h3>
                          <Badge 
                            variant={profesional.activo ? "default" : "secondary"} 
                            className={profesional.activo ? "bg-[#0AA640]/10 text-[#0AA640] hover:bg-[#0AA640]/20" : ""}
                          >
                            {profesional.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {profesional.especialidad && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-[#D466F2]" />
                          {profesional.especialidad}
                        </div>
                      )}
                      {profesional.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-[#056CF2]" />
                          {profesional.telefono}
                        </div>
                      )}
                      {profesional.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#4BA4F2]" />
                          <span className="truncate">{profesional.email}</span>
                        </div>
                      )}
                      {profesional.comision_porcentaje !== undefined && profesional.comision_porcentaje > 0 && (
                        <div className="text-xs bg-[#04D9D9]/10 text-[#04D9D9] px-2 py-1 rounded inline-block">
                          Comisión: {profesional.comision_porcentaje}%
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleOpenEdit(profesional)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                        onClick={() => handleOpenDelete(profesional)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Modal Crear/Editar */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProfesional ? "Editar Profesional" : "Nuevo Profesional"}
            </DialogTitle>
            <DialogDescription>
              {editingProfesional 
                ? "Actualiza la información del profesional" 
                : "Completa los datos para registrar un nuevo profesional"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: María"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellido">Apellido *</Label>
                <Input
                  id="apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  placeholder="Ej: García"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="documento">Documento</Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                  placeholder="Ej: 12345678"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Ej: 3001234567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Ej: maria@fisiolab.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialidad">Especialidad</Label>
              <Input
                id="especialidad"
                value={formData.especialidad}
                onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                placeholder="Ej: Fisioterapia Deportiva"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="comision">Comisión (%)</Label>
                <Input
                  id="comision"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.comision_porcentaje}
                  onChange={(e) => setFormData({ ...formData, comision_porcentaje: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Color en Agenda</Label>
                <div className="flex gap-1 flex-wrap">
                  {COLORES_AGENDA.map((color) => (
                    <button
                      key={color.valor}
                      type="button"
                      className={`w-7 h-7 rounded-full border-2 transition-all ${
                        formData.color_agenda === color.valor 
                          ? "border-gray-800 scale-110" 
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.valor }}
                      onClick={() => setFormData({ ...formData, color_agenda: color.valor })}
                      title={color.nombre}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="activo">Estado activo</Label>
              <Switch
                id="activo"
                checked={formData.activo}
                onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-[#D466F2] hover:bg-[#C050E0]"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingProfesional ? "Guardar Cambios" : "Crear Profesional"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirmar Eliminación */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar profesional?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar a <strong>{profesionalToDelete?.nombre} {profesionalToDelete?.apellido}</strong>.
              Esta acción no se puede deshacer. Las citas asociadas a este profesional podrían verse afectadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={eliminarMutation.isPending}
            >
              {eliminarMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

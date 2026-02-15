"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Eye, Edit, Trash2, Users, MoreHorizontal, FilePlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  tipo_documento: string
  documento: string
  celular: string
  email: string
  fecha_nacimiento: string
  sexo: string
  edad: number
  activo: boolean
}

export default function PacientesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [pacientesConHC, setPacientesConHC] = useState<Set<string>>(new Set())
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
      fetchPacientes(token)
      fetchHistoriasClinicas(token)
    }
  }, [router])

  const fetchPacientes = async (token: string) => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:3001/api/pacientes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar pacientes")

      const data = await response.json()
      if (data.success && data.data) {
        setPacientes(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pacientes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchHistoriasClinicas = async (token: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/historias-clinicas", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!response.ok) return
      const data = await response.json()
      if (data.success && data.data) {
        const ids = new Set<string>(data.data.map((hc: any) => String(hc.paciente_id)))
        setPacientesConHC(ids)
      }
    } catch (error) {
      console.error("Error fetching historias clínicas:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este paciente? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const token = localStorage.getItem("fisiolab_token")
      const response = await fetch(`http://localhost:3001/api/pacientes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Error al eliminar paciente")
      }

      toast({
        title: "Paciente eliminado",
        description: "El paciente se eliminó correctamente",
      })

      // Recargar lista
      if (token) fetchPacientes(token)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el paciente",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<Paciente>[] = [
    {
      accessorKey: "nombres",
      header: "Nombre Completo",
      cell: ({ row }) => {
        const nombres = row.getValue("nombres") as string
        const apellidos = row.original.apellidos
        return (
          <div className="font-medium text-slate-900">
            {nombres} {apellidos}
          </div>
        )
      },
    },
    {
      accessorKey: "documento",
      header: "Documento",
      cell: ({ row }) => {
        const tipo = row.original.tipo_documento
        const documento = row.getValue("documento") as string
        return (
          <div className="text-slate-600">
            {tipo} {documento}
          </div>
        )
      },
    },
    {
      accessorKey: "celular",
      header: "Celular",
      cell: ({ row }) => {
        const celular = row.getValue("celular") as string
        return <div className="text-slate-600">{celular}</div>
      },
    },
    {
      accessorKey: "edad",
      header: "Edad",
      cell: ({ row }) => {
        const edad = row.getValue("edad") as number
        return <div className="text-slate-600">{edad} años</div>
      },
    },
    {
      accessorKey: "sexo",
      header: "Sexo",
      cell: ({ row }) => {
        const sexo = row.getValue("sexo") as string
        return (
          <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
            {sexo === "M" ? "Masculino" : "Femenino"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => {
        const activo = row.getValue("activo") as boolean
        return activo ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
            Activo
          </Badge>
        ) : (
          <Badge className="bg-slate-100 text-slate-600 border-slate-300">
            Inactivo
          </Badge>
        )
      },
    },
    {
      id: "historia",
      header: "Historia Clínica",
      cell: ({ row }) => {
        const paciente = row.original
        const tieneHC = pacientesConHC.has(String(paciente.id))
        return tieneHC ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/historias-clinicas?paciente=${paciente.id}`)}
            className="h-8 hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-200"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/historias-clinicas/nueva?paciente_id=${paciente.id}`)}
            className="h-8 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
          >
            <FilePlus className="h-3 w-3 mr-1" />
            Agregar Historia Clínica
          </Button>
        )
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const paciente = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/pacientes/${paciente.id}`)}>
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/pacientes/${paciente.id}/editar`)}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(paciente.id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (!user) return null

  return (
    <div className="flex h-screen bg-white">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

        <main className="flex-1 overflow-auto bg-slate-50">
          <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 pb-4 border-b border-slate-300">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                    Pacientes
                  </h1>
                  <p className="text-sm text-slate-600 mt-1">
                    {pacientes.length} paciente{pacientes.length !== 1 ? "s" : ""} registrado{pacientes.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <Button
                  onClick={() => router.push("/pacientes/nuevo")}
                  className="gap-2 h-10 bg-cyan-600 hover:bg-cyan-700 border border-cyan-600"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Paciente
                </Button>
              </div>
            </div>

            {/* Data Table */}
            <Card className="border border-slate-300 rounded">
              <CardContent className="p-6">
                <DataTable
                  columns={columns}
                  data={pacientes}
                  searchKey="nombres"
                  searchPlaceholder="Buscar por nombre..."
                  isLoading={loading}
                  emptyMessage="No se encontraron pacientes. Crea el primer paciente."
                />
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 border border-slate-300 rounded bg-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-100 rounded border border-cyan-200">
                    <Users className="h-5 w-5 text-cyan-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Gestión de Pacientes</h3>
                    <p className="text-sm text-slate-600">
                      En la vista detallada de cada paciente podrás acceder al historial completo de historias clínicas,
                      evaluaciones fisioterapéuticas y planes de tratamiento.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

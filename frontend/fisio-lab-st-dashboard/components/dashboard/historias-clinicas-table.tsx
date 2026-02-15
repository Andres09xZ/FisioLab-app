"use client"

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, Download } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface HistoriaClinica {
  id: string
  codigo_unico: string
  paciente_nombres: string
  paciente_apellidos: string
  fecha_consulta: string
  diagnostico_principal: string
  estado: string
}

interface HistoriasClinicasTableProps {
  historias: HistoriaClinica[]
  isLoading: boolean
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onDownloadPDF: (id: string) => void
}

export function HistoriasClinicasTable({
  historias,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onDownloadPDF,
}: HistoriasClinicasTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`http://localhost:3001/api/historias-clinicas/${deleteId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("fisiolab_token")}`,
        },
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast({
        title: "Éxito",
        description: "Historia clínica eliminada correctamente",
      })

      onDelete(deleteId)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la historia clínica",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (historias.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay historias clínicas registradas</p>
      </div>
    )
  }

  return (
    <>
      <div className="border border-slate-200 rounded overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Paciente</TableHead>
              <TableHead className="font-semibold">Fecha Consulta</TableHead>
              <TableHead className="font-semibold">Diagnóstico Principal</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
              <TableHead className="font-semibold text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {historias.map((historia) => (
              <TableRow key={historia.id} className="hover:bg-gray-50">
                <TableCell className="font-mono text-sm font-semibold text-cyan-700">
                  {historia.codigo_unico}
                </TableCell>
                <TableCell>
                  {historia.paciente_nombres} {historia.paciente_apellidos}
                </TableCell>
                <TableCell>
                  {new Date(historia.fecha_consulta).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {historia.diagnostico_principal}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {historia.estado === "activo" ? "Activa" : "Inactiva"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(historia.id)}
                      title="Ver"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(historia.id)}
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownloadPDF(historia.id)}
                      title="Descargar PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(historia.id)}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Alert Dialog for Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className="bg-white rounded border border-slate-200 p-6 max-w-sm mx-4">
            <h2 className="text-lg font-semibold mb-2">Eliminar Historia Clínica</h2>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta historia clínica? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteId(null)}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

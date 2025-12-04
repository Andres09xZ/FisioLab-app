"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Eye, Edit, Trash2, FileText, ClipboardList, CheckCircle2 } from "lucide-react"
import { NewPatientModal } from "@/components/dashboard/new-patient-modal"
import { EvaluacionModal } from "@/components/dashboard/evaluacion-modal"
import { ViewHistoriaClinicaModal } from "@/components/dashboard/view-historia-clinica-modal"
import { useToast } from "@/components/ui/use-toast"

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  tipo_documento: string
  documento: string
  celular: string
  email: string
  sexo: string
  edad: number
  emergencia_nombre: string
  emergencia_telefono: string
  activo: boolean
  has_historia: boolean
  historia_estado: string
}

export default function PacientesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)
  const [showEvaluacionModal, setShowEvaluacionModal] = useState(false)
  const [showViewHistoriaModal, setShowViewHistoriaModal] = useState(false)
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(null)
  const [historiaClinicaData, setHistoriaClinicaData] = useState<any>(null)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchPacientes()
    }
  }, [router])

  const fetchPacientes = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/pacientes")
      const result = await response.json()
      
      if (result.success && result.data) {
        // Ordenar por los más recientes primero (asumiendo que tienen un id incremental o fecha)
        const sortedData = [...result.data].sort((a, b) => {
          // Si tienen created_at, usarlo, si no, usar el id
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          }
          // Si no hay created_at, ordenar por ID descendente (más recientes primero)
          return b.id.localeCompare(a.id)
        })
        
        setPacientes(sortedData)
        setFilteredPacientes(sortedData)
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const cargarHistoriaClinica = async (paciente: Paciente) => {
    try {
      const response = await fetch(`http://localhost:3001/api/historia-clinica?documento=${paciente.documento}`)
      const result = await response.json()
      
      if (result.success && result.data) {
        setHistoriaClinicaData(result.data)
        setSelectedPaciente(paciente)
        setShowViewHistoriaModal(true)
      } else {
        toast({
          title: "No hay historia clínica",
          description: "Este paciente aún no tiene historia clínica registrada",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error al cargar historia clínica:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la historia clínica",
        variant: "destructive",
      })
    }
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setCurrentPage(1) // Reset a la primera página al buscar
    
    if (!term.trim()) {
      setFilteredPacientes(pacientes)
      return
    }

    const filtered = pacientes.filter(
      (paciente) =>
        paciente.nombres.toLowerCase().includes(term.toLowerCase()) ||
        paciente.apellidos.toLowerCase().includes(term.toLowerCase()) ||
        paciente.documento.includes(term) ||
        paciente.email.toLowerCase().includes(term.toLowerCase())
    )
    setFilteredPacientes(filtered)
  }

  // Cálculos de paginación
  const totalPages = Math.ceil(filteredPacientes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPacientes = filteredPacientes.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePatientCreated = () => {
    fetchPacientes() // Recargar la lista después de crear un paciente
  }

  const handleViewHistoria = async (paciente: Paciente) => {
    // Solo permitir ver historia clínica si ya existe
    if (paciente.has_historia) {
      await cargarHistoriaClinica(paciente)
    }
  }

  const handleOpenEvaluacion = (paciente: Paciente) => {
    setSelectedPaciente(paciente)
    setShowEvaluacionModal(true)
  }

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
              <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
              <p className="text-gray-600 mt-1">
                {filteredPacientes.length} paciente{filteredPacientes.length !== 1 ? "s" : ""} registrado
                {filteredPacientes.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              onClick={() => setShowNewPatientModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Paciente
            </Button>
          </div>

          {/* Search Bar */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nombre, apellido, documento o email..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Patients List */}
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                  <p className="mt-4 text-gray-600">Cargando pacientes...</p>
                </div>
              </CardContent>
            </Card>
          ) : filteredPacientes.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <p className="text-gray-600">
                    {searchTerm ? "No se encontraron pacientes con ese criterio de búsqueda" : "No hay pacientes registrados"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
            <div className="grid gap-4">
              {currentPacientes.map((paciente) => (
                <Card key={paciente.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div 
                        className={`flex items-center gap-4 flex-1 ${
                          paciente.has_historia 
                            ? "cursor-pointer hover:bg-blue-50 rounded-lg -m-2 p-2 transition-colors" 
                            : ""
                        }`}
                        onClick={() => paciente.has_historia && cargarHistoriaClinica(paciente)}
                        title={paciente.has_historia ? "Click para ver historia clínica" : ""}
                      >
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-700 font-semibold text-lg">
                            {paciente.nombres.charAt(0)}
                            {paciente.apellidos.charAt(0)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {paciente.nombres} {paciente.apellidos}
                            </h3>
                            <Badge variant={paciente.activo ? "default" : "secondary"} className={paciente.activo ? "bg-emerald-100 text-emerald-700" : ""}>
                              {paciente.activo ? "Activo" : "Inactivo"}
                            </Badge>
                            <Badge variant="outline">
                              {paciente.sexo === "M" ? "Masculino" : "Femenino"}
                            </Badge>
                            <Badge variant="outline">{paciente.edad} años</Badge>
                            {paciente.has_historia && (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Historia Clínica
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-6 text-sm text-gray-600">
                            <span>
                              <strong>{paciente.tipo_documento}:</strong> {paciente.documento}
                            </span>
                            <span>
                              <strong>Celular:</strong> {paciente.celular}
                            </span>
                            {paciente.email && (
                              <span>
                                <strong>Email:</strong> {paciente.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                            onClick={() => router.push(`/pacientes/${paciente.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200">
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          {paciente.has_historia && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                              onClick={() => handleViewHistoria(paciente)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              Ver Historia
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50"
                            onClick={() => handleOpenEvaluacion(paciente)}
                          >
                            <ClipboardList className="h-4 w-4 mr-1" />
                            Evaluación
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} - {Math.min(endIndex, filteredPacientes.length)} de {filteredPacientes.length} pacientes
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Mostrar solo páginas cercanas a la actual
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                            className={currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                          >
                            {page}
                          </Button>
                        )
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-2 text-gray-400">...</span>
                      }
                      return null
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </main>
      </div>

      <NewPatientModal 
        open={showNewPatientModal} 
        onOpenChange={(open) => {
          setShowNewPatientModal(open)
          if (!open) {
            handlePatientCreated()
          }
        }} 
      />

      {selectedPaciente && (
        <>
          <EvaluacionModal
            open={showEvaluacionModal}
            onOpenChange={setShowEvaluacionModal}
            pacienteId={selectedPaciente.id}
            pacienteNombre={`${selectedPaciente.nombres} ${selectedPaciente.apellidos}`}
          />

          <ViewHistoriaClinicaModal
            open={showViewHistoriaModal}
            onOpenChange={setShowViewHistoriaModal}
            historiaData={historiaClinicaData}
            pacienteNombre={`${selectedPaciente.nombres} ${selectedPaciente.apellidos}`}
          />
        </>
      )}
    </div>
  )
}

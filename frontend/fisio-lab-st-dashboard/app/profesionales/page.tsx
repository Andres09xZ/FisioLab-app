"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Edit, Trash2, Phone, Mail, Award } from "lucide-react"

interface Profesional {
  id: string
  nombre: string
  apellido: string
  documento?: string
  telefono?: string
  email?: string
  especialidad?: string
  color_agenda?: string
  comision_porcentaje?: number
  activo: boolean
}

export default function ProfesionalesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profesionales, setProfesionales] = useState<Profesional[]>([])
  const [filteredProfesionales, setFilteredProfesionales] = useState<Profesional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterActivo, setFilterActivo] = useState<boolean | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchProfesionales()
    }
  }, [router])

  const fetchProfesionales = async () => {
    try {
      const params = new URLSearchParams()
      if (filterActivo !== null) {
        params.append("activo", String(filterActivo))
      }
      
      const response = await fetch(`http://localhost:3001/api/profesionales?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setProfesionales(data.data || [])
        setFilteredProfesionales(data.data || [])
      }
    } catch (error) {
      console.error("Error al cargar profesionales:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (filterActivo !== null) {
      fetchProfesionales()
    }
  }, [filterActivo])

  useEffect(() => {
    handleSearch(searchTerm)
  }, [searchTerm, profesionales])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    
    if (!term) {
      setFilteredProfesionales(profesionales)
      return
    }

    const filtered = profesionales.filter(
      (prof) =>
        prof.nombre.toLowerCase().includes(term.toLowerCase()) ||
        prof.apellido.toLowerCase().includes(term.toLowerCase()) ||
        (prof.documento && prof.documento.includes(term)) ||
        (prof.especialidad && prof.especialidad.toLowerCase().includes(term.toLowerCase()))
    )
    setFilteredProfesionales(filtered)
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
              <h1 className="text-2xl font-bold text-gray-900">Profesionales</h1>
              <p className="text-gray-600 mt-1">
                {filteredProfesionales.length} profesional{filteredProfesionales.length !== 1 ? "es" : ""} registrado{filteredProfesionales.length !== 1 ? "s" : ""}
              </p>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Nuevo Profesional
            </Button>
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
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterActivo === null ? "default" : "outline"}
                    onClick={() => setFilterActivo(null)}
                  >
                    Todos
                  </Button>
                  <Button
                    variant={filterActivo === true ? "default" : "outline"}
                    onClick={() => setFilterActivo(true)}
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
          ) : filteredProfesionales.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <UserPlus className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600">No se encontraron profesionales</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfesionales.map((profesional) => (
                <Card key={profesional.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar con color de agenda */}
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                          style={{ backgroundColor: profesional.color_agenda || "#10b981" }}
                        >
                          {profesional.nombre.charAt(0)}{profesional.apellido.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {profesional.nombre} {profesional.apellido}
                          </h3>
                          <Badge variant={profesional.activo ? "default" : "secondary"} className={profesional.activo ? "bg-emerald-100 text-emerald-700" : ""}>
                            {profesional.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      {profesional.especialidad && (
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4" />
                          {profesional.especialidad}
                        </div>
                      )}
                      {profesional.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {profesional.telefono}
                        </div>
                      )}
                      {profesional.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {profesional.email}
                        </div>
                      )}
                      {profesional.comision_porcentaje && (
                        <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          Comisión: {profesional.comision_porcentaje}%
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600">
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
    </div>
  )
}

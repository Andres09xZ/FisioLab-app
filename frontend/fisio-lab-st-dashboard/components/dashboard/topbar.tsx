"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Bell, LogOut, Search, User, Phone, FileText, X, Plus, UserPlus, Calendar, FileCheck, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"

interface TopbarProps {
  user: {
    name: string
    role: string
  } | null
  onToggleSidebar?: () => void
}

interface Paciente {
  id: string
  nombres: string
  apellidos: string
  documento?: string
  telefono?: string
  email?: string
}

export function DashboardTopbar({ user, onToggleSidebar }: TopbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [filteredPacientes, setFilteredPacientes] = useState<Paciente[]>([])
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Cargar pacientes al montar el componente
  useEffect(() => {
    fetchPacientes()
  }, [])

  // Filtrar pacientes cuando cambia la búsqueda
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase()
      const filtered = pacientes.filter((p) => {
        const nombreCompleto = `${p.nombres} ${p.apellidos}`.toLowerCase()
        const documento = p.documento?.toLowerCase() || ""
        const telefono = p.telefono?.toLowerCase() || ""
        
        return (
          nombreCompleto.includes(query) ||
          documento.includes(query) ||
          telefono.includes(query)
        )
      })
      setFilteredPacientes(filtered)
      setShowResults(true)
    } else {
      setFilteredPacientes([])
      setShowResults(false)
    }
  }, [searchQuery, pacientes])

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchPacientes = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://localhost:3001/api/pacientes")
      const data = await response.json()
      
      if (data.success && data.data) {
        setPacientes(data.data)
        console.log("🔍 Pacientes cargados para búsqueda:", data.data.length)
      }
    } catch (error) {
      console.error("❌ Error al cargar pacientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePacienteClick = (pacienteId: string) => {
    router.push(`/pacientes/${pacienteId}`)
    setSearchQuery("")
    setShowResults(false)
  }

  const clearSearch = () => {
    setSearchQuery("")
    setShowResults(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("fisiolab_user")
    router.push("/login")
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "US"

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3">
      <div className="flex items-center justify-between gap-4 max-w-screen-2xl mx-auto">
        {/* Left Section - Toggle Button, Logo and Title */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Toggle Sidebar Button */}
          {onToggleSidebar && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onToggleSidebar}
              className="h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors duration-150"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          
          <div className="flex items-center gap-2">
            <Image 
              src="/fisiolab-logo.png" 
              alt="FisioLab" 
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-2xl relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar paciente por nombre, cédula o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowResults(true)}
              className="pl-9 pr-10 h-9 w-full bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-cyan-600 focus:ring-cyan-600/20 focus:ring-2 rounded transition-[background-color,border-color,box-shadow] duration-150"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Results Dropdown */}
          {showResults && (
            <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded max-h-96 overflow-y-auto z-50">
              {loading ? (
                <div className="p-6 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-cyan-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-3 text-sm text-gray-600">Buscando pacientes...</p>
                </div>
              ) : filteredPacientes.length > 0 ? (
                <div className="py-1">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    {filteredPacientes.length} {filteredPacientes.length === 1 ? 'Resultado' : 'Resultados'}
                  </div>
                  {filteredPacientes.map((paciente) => (
                    <button
                      key={paciente.id}
                      onClick={() => handlePacienteClick(paciente.id)}
                      className="w-full px-3 py-2.5 hover:bg-cyan-50 transition-colors border-b border-slate-100 last:border-b-0 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="shrink-0">
                          <div className="h-9 w-9 rounded-full bg-cyan-600 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate group-hover:text-cyan-700">
                            {paciente.nombres} {paciente.apellidos}
                          </p>
                          <div className="flex flex-wrap gap-3 mt-0.5">
                            {paciente.documento && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <FileText className="h-3 w-3" />
                                {paciente.documento}
                              </span>
                            )}
                            {paciente.telefono && (
                              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                <Phone className="h-3 w-3" />
                                {paciente.telefono}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-cyan-600 text-xs font-medium">
                            Ver →
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Search className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No se encontraron pacientes</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Intenta con otro término de búsqueda
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="bg-cyan-600 hover:bg-cyan-700 text-white h-8 w-8 rounded transition-colors duration-150"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 bg-white border-gray-200">
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Acciones Rápidas
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={() => router.push('/pacientes')}
                className="cursor-pointer py-3 focus:bg-cyan-50 focus:text-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Crear Paciente</p>
                    <p className="text-xs text-gray-500">Registrar nuevo paciente</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/agenda')}
                className="cursor-pointer py-3 focus:bg-emerald-50 focus:text-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Crear Cita</p>
                    <p className="text-xs text-gray-500">Agendar nueva cita</p>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push('/certificados')}
                className="cursor-pointer py-3 focus:bg-slate-50 focus:text-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                    <FileCheck className="h-4 w-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">Generar Certificados</p>
                    <p className="text-xs text-gray-500">Crear certificado médico</p>
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-6 w-px bg-gray-200"></div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 h-8 w-8 rounded"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-cyan-600 rounded-full ring-2 ring-white"></span>
          </Button>

          <div className="h-6 w-px bg-gray-200"></div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-100 rounded-md px-2 py-1.5 transition-colors">
                <Avatar className="h-7 w-7 bg-cyan-600 text-white ring-2 ring-slate-100">
                  <AvatarFallback className="bg-transparent text-xs font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-medium text-gray-900 leading-tight">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{user?.role || "Rol"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200">
              <DropdownMenuLabel className="text-gray-500">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-gray-900">{user?.name || "Usuario"}</p>
                  <p className="text-xs text-gray-500">{user?.role || "Cargando..."}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={() => router.push('/perfil')}
                className="cursor-pointer focus:bg-gray-100 focus:text-gray-900"
              >
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span className="text-gray-900">Mi Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer focus:bg-red-50 focus:text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-600">Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

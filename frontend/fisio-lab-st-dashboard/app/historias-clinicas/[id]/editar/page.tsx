"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { HistoriaClinicaForm } from "@/components/dashboard/historia-clinica-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function EditarHistoriaClinicaPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const historiaId = params?.id as string
  
  const [user, setUser] = useState<any>(null)
  const [historia, setHistoria] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
      if (historiaId) {
        fetchHistoria(token)
      }
    }
  }, [router, historiaId])

  const fetchHistoria = async (token: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`http://localhost:3001/api/historias-clinicas/${historiaId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Error al cargar historia clínica")

      const data = await response.json()
      if (data.success && data.data) {
        setHistoria(data.data)
      }
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo cargar la historia clínica",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    router.push(`/historias-clinicas/${historiaId}`)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <DashboardSidebar
          isCollapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopbar user={user} />
          <main className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

        <main className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Editar Historia Clínica</h1>
              <p className="text-gray-600 mt-2">{historia?.codigo_unico}</p>
            </div>

            {/* Form Container */}
            <div className="bg-white rounded p-8">
              {user && historia && (
                <HistoriaClinicaForm
                  doctorId={user.id}
                  pacienteId={historia.paciente_id}
                  historiaId={historiaId}
                  onSuccess={() => {
                    router.push(`/historias-clinicas/${historiaId}`)
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

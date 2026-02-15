"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Bone, HeartPulse } from "lucide-react"

export default function NuevaHistoriaClinicaPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
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
    }
  }, [router])

  if (!user) return null

  return (
    <div className="flex h-screen bg-[#fafafa]">
      <DashboardSidebar
        isCollapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-auto">
          <div className="p-8 max-w-3xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => router.push("/historias-clinicas")}
              className="mb-6 text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Historias Clinicas
            </Button>

            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                Nueva Historia Clinica
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Selecciona el tipo de historia clinica que deseas crear
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Traumatologica */}
              <Card
                className="border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => router.push("/historias-clinicas/nueva/traumatologica")}
              >
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="p-4 bg-blue-100 rounded-full mb-4 group-hover:bg-blue-200 transition-colors">
                    <Bone className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Traumatologica</h3>
                  <p className="text-sm text-slate-500">
                    Fracturas, luxaciones, esguinces, lesiones musculoesqueleticas y evaluacion ortopedica
                  </p>
                </CardContent>
              </Card>

              {/* Fisioterapeutica */}
              <Card
                className="border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => router.push("/historias-clinicas/nueva/fisioterapeutica")}
              >
                <CardContent className="p-8 flex flex-col items-center text-center">
                  <div className="p-4 bg-emerald-100 rounded-full mb-4 group-hover:bg-emerald-200 transition-colors">
                    <HeartPulse className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">Fisioterapeutica</h3>
                  <p className="text-sm text-slate-500">
                    Evaluacion funcional, diagnostico fisioterapeutico, plan de rehabilitacion y seguimiento
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

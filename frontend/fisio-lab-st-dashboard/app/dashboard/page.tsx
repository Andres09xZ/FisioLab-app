"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/dashboard/stat-card"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { SesionesDelDia } from "@/components/dashboard/sesiones-del-dia"
import { TrendingUp, UserCheck, Activity, CalendarCheck } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [ingresosData, setIngresosData] = useState<any[]>([])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })

  // Guardar estado del sidebar en localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const userData = localStorage.getItem("fisiolab_user")
    if (!userData) {
      router.push("/login")
    } else {
      setUser(JSON.parse(userData))
      fetchDashboardData()
      fetchIngresosData()
    }
  }, [router])

  const fetchDashboardData = async () => {
    try {
      const hoy = new Date().toISOString().split('T')[0]
      const enUnaSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      // Obtener citas de hoy desde /api/agenda
      const citasHoyRes = await fetch(`http://localhost:3001/api/agenda?fecha=${hoy}&vista=dia`)
      const citasHoyData = await citasHoyRes.json()
      const citasHoy = citasHoyData.success ? citasHoyData.data?.eventos?.length || 0 : 0
      
      // Obtener citas de la semana desde /api/citas/calendario
      const citasSemanaRes = await fetch(`http://localhost:3001/api/citas/calendario?desde=${hoy}&hasta=${enUnaSemana}`)
      const citasSemanaData = await citasSemanaRes.json()
      const citasSemana = citasSemanaData.success ? citasSemanaData.data?.length || 0 : 0
      
      // Obtener pacientes activos
      const pacientesRes = await fetch('http://localhost:3001/api/pacientes')
      const pacientesData = await pacientesRes.json()
      const pacientes = pacientesData.success ? pacientesData.data?.length || 0 : 0
      
      setDashboardData({
        citas_hoy: citasHoy,
        citas_semana: citasSemana,
        pacientes: pacientes,
        ingresos: 0 // Por ahora lo dejamos en 0
      })
      
      console.log('📊 Estadísticas calculadas:', {
        citasHoy,
        citasSemana,
        pacientes
      })
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error)
    }
  }

  const fetchIngresosData = async () => {
    try {
      const year = new Date().getFullYear()
      const response = await fetch(`http://localhost:3001/api/dashboard/ingresos-mes?year=${year}`)
      if (!response.ok) {
        console.warn("Error en API dashboard/ingresos-mes:", response.status)
        return
      }
      const data = await response.json()
      if (data.success) {
        setIngresosData(data.data || [])
      }
    } catch (error) {
      console.error("Error al cargar ingresos:", error)
    }
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar 
          user={user} 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard
              title="Ingresos del Mes"
              value={dashboardData?.ingresos ? `S/ ${dashboardData.ingresos.toLocaleString()}` : "S/ 0"}
              change="+18% vs mes pasado"
              icon={TrendingUp}
              color="#10B981"
            />
            <StatCard
              title="Pacientes Activos"
              value={dashboardData?.pacientes?.toString() || "0"}
              change="+12% vs mes pasado"
              icon={UserCheck}
              color="#3B82F6"
            />
            <StatCard
              title="Citas del Día"
              value={dashboardData?.citas_hoy?.toString() || "0"}
              change="Para hoy"
              icon={Activity}
              color="#8B5CF6"
            />
            <StatCard
              title="Citas Esta Semana"
              value={dashboardData?.citas_semana?.toString() || "0"}
              change="Próximos 7 días"
              icon={CalendarCheck}
              color="#F59E0B"
            />
          </div>

          {/* Main Content Grid */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Today's Sessions (Priority View) */}
            <div className="flex-1 min-w-0">
              <SesionesDelDia />
            </div>

            {/* Quick Actions */}
            <div className="w-full lg:w-[30%] lg:min-w-[380px] lg:max-w-[420px] shrink-0">
              <QuickActions />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

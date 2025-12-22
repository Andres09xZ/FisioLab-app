"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardTopbar } from "@/components/dashboard/topbar"
import { StatCard } from "@/components/dashboard/stat-card"
import { UpcomingAppointments } from "@/components/dashboard/upcoming-appointments"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { PendingTasks } from "@/components/dashboard/pending-tasks"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { TrendingUp, UserCheck, Activity, CalendarCheck } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [ingresosData, setIngresosData] = useState<any[]>([])

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
      const response = await fetch("http://localhost:3001/api/dashboard/resumen")
      if (!response.ok) {
        console.warn("Error en API dashboard/resumen:", response.status)
        return
      }
      const data = await response.json()
      if (data.success) {
        setDashboardData(data.data)
      }
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
      <DashboardSidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardTopbar user={user} />

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Quick Actions */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>

            {/* Right Column - Appointments and Chart */}
            <div className="lg:col-span-2 space-y-6">
              <UpcomingAppointments />
              <MonthlyChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

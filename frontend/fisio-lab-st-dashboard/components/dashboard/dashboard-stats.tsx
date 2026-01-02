"use client"

import { useEffect, useState } from "react"
import { StatCard } from "./stat-card"
import { TrendingUp, UserCheck, Activity, CalendarCheck } from "lucide-react"
import { format, addDays } from "date-fns"

export function DashboardStats() {
  const [stats, setStats] = useState({
    citasHoy: 0,
    citasSemana: 0,
    pacientesActivos: 0,
    ingresos: 0
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const hoy = format(new Date(), 'yyyy-MM-dd')
      const enUnaSemana = format(addDays(new Date(), 7), 'yyyy-MM-dd')
      
      // Obtener citas de hoy
      const citasHoyRes = await fetch(`http://localhost:3001/api/agenda?fecha=${hoy}&vista=dia`)
      const citasHoyData = await citasHoyRes.json()
      const citasHoy = citasHoyData.success ? citasHoyData.data?.eventos?.length || 0 : 0
      
      // Obtener citas de la semana
      const citasSemanaRes = await fetch(`http://localhost:3001/api/citas/calendario?desde=${hoy}&hasta=${enUnaSemana}`)
      const citasSemanaData = await citasSemanaRes.json()
      const citasSemana = citasSemanaData.success ? citasSemanaData.data?.length || 0 : 0
      
      // Obtener pacientes activos
      const pacientesRes = await fetch('http://localhost:3001/api/pacientes')
      const pacientesData = await pacientesRes.json()
      const pacientesActivos = pacientesData.success ? pacientesData.data?.length || 0 : 0
      
      setStats({
        citasHoy,
        citasSemana,
        pacientesActivos,
        ingresos: 0 // Por ahora dejamos en 0, se puede calcular después
      })
      
      console.log('📊 Estadísticas calculadas:', {
        citasHoy,
        citasSemana,
        pacientesActivos
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <StatCard
        title="Ingresos del Mes"
        value={stats.ingresos ? `S/ ${stats.ingresos.toLocaleString()}` : "S/ 0"}
        change="+18% vs mes pasado"
        icon={TrendingUp}
        color="#10B981"
      />
      <StatCard
        title="Pacientes Activos"
        value={stats.pacientesActivos.toString()}
        change="+12% vs mes pasado"
        icon={UserCheck}
        color="#3B82F6"
      />
      <StatCard
        title="Citas del Día"
        value={stats.citasHoy.toString()}
        change="Para hoy"
        icon={Activity}
        color="#8B5CF6"
      />
      <StatCard
        title="Citas Esta Semana"
        value={stats.citasSemana.toString()}
        change="Próximos 7 días"
        icon={CalendarCheck}
        color="#F59E0B"
      />
    </div>
  )
}

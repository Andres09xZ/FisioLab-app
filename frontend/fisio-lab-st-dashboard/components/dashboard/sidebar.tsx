"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Users, UserPlus, ClipboardList, BarChart3, DollarSign, Settings } from "lucide-react"

const menuItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Agenda", badge: "Hoy", href: "/agenda" },
  { icon: Users, label: "Pacientes", badge: 8, href: "/pacientes" },
  { icon: UserPlus, label: "Nuevo Paciente", href: "/nuevo-paciente" },
  { icon: ClipboardList, label: "Sesiones", href: "/sesiones" },
  { icon: BarChart3, label: "Reportes", href: "/reportes" },
  { icon: DollarSign, label: "Finanzas", href: "/finanzas" },
  { icon: Settings, label: "Configuración", href: "/configuracion" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-emerald-600">FisioLab ST</h1>
        <p className="text-sm text-gray-500 mt-1">Gestión Profesional</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <button
              key={item.label}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                isActive ? "bg-emerald-50 text-emerald-700 font-semibold shadow-sm" : "text-gray-600 hover:bg-gray-50",
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn("h-5 w-5", isActive ? "text-emerald-600" : "text-gray-400")} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold",
                    typeof item.badge === "number" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700",
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
          <p className="text-sm font-semibold mb-1">¿Necesitas ayuda?</p>
          <p className="text-xs opacity-90 mb-3">Contacta a soporte técnico</p>
          <button className="w-full bg-white text-emerald-600 text-sm font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors">
            Soporte
          </button>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, Calendar, Users, ClipboardList, BarChart3, DollarSign, Settings, Stethoscope, BookOpen, ChevronLeft, ChevronRight, FileText, Pill, Activity, Target } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"

type MenuItem = {
  icon: typeof Home
  label: string
  href: string
  badge?: string | number
}

type MenuGroup = {
  label: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    label: "Principal",
    items: [
      { icon: Home, label: "Dashboard", href: "/dashboard" },
      { icon: Calendar, label: "Agenda", badge: "Hoy", href: "/agenda" },
    ],
  },
  {
    label: "Clínico",
    items: [
      { icon: Users, label: "Pacientes", badge: 8, href: "/pacientes" },
      { icon: Activity, label: "Evaluaciones", href: "/evaluaciones" },
      { icon: Target, label: "Planes de Tratamiento", href: "/planes" },
      { icon: FileText, label: "Historias Clínicas", href: "/historias-clinicas" },
      { icon: Pill, label: "Recetas Médicas", href: "/recetas" },
      { icon: ClipboardList, label: "Sesiones", href: "/sesiones" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { icon: Stethoscope, label: "Profesionales", href: "/profesionales" },
      { icon: BookOpen, label: "Biblioteca", href: "/biblioteca" },
    ],
  },
  {
    label: "Sistema",
    items: [
      { icon: Settings, label: "Configuración", href: "/configuracion" },
    ],
  },
]

interface DashboardSidebarProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export function DashboardSidebar({ isCollapsed = false, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const userRole = useMemo(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("fisiolab_user")
      if (user) {
        const parsedUser = JSON.parse(user)
        return parsedUser.role
      }
    }
    return null
  }, [])

  // Filter and flatten for DOCTOR, preserve groups for others
  const filteredGroups = useMemo(() => {
    if (userRole === "DOCTOR") {
      const doctorLabels = ["Pacientes", "Historias Clínicas", "Recetas Médicas"]
      const doctorItems = menuGroups
        .flatMap((g) => g.items)
        .filter((item) => doctorLabels.includes(item.label))
      return [{ label: "Clínico", items: doctorItems }]
    }
    return menuGroups
  }, [userRole])

  return (
    <div
      className={cn(
        "bg-white border-r border-slate-200 flex flex-col transition-all duration-200 relative",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle */}
      <Button
        onClick={onToggle}
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 transition-colors duration-150"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5 text-slate-500" />
        )}
      </Button>

      {/* Logo */}
      <div
        className={cn(
          "border-b border-slate-200 transition-all duration-200",
          isCollapsed ? "px-3 py-4" : "px-5 py-5"
        )}
      >
        {!isCollapsed ? (
          <>
            <div className="flex items-center justify-center">
              <Image
                src="/fisiolab-logo.png"
                alt="FisioLab"
                width={160}
                height={44}
                className="object-contain"
                priority
              />
            </div>
            <div className="flex justify-center mt-2">
              <Image
                src="/st-logo.png"
                alt="ST Logo"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </>
        ) : (
          <div className="flex justify-center">
            <div className="h-10 w-10 rounded bg-cyan-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">FL</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {filteredGroups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-2")}>
            {/* Section label */}
            {!isCollapsed && (
              <span className="block px-5 py-1.5 text-[11px] font-medium tracking-wide uppercase text-slate-400">
                {group.label}
              </span>
            )}
            {isCollapsed && gi > 0 && (
              <div className="mx-4 border-t border-slate-100" />
            )}

            <div className="space-y-0.5 px-2 mt-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "w-full flex items-center rounded transition-colors duration-150 group relative",
                      isCollapsed
                        ? "justify-center px-2 py-2.5"
                        : "justify-between px-3 py-2.5",
                      isActive
                        ? "bg-cyan-50 text-cyan-700 border-l-[3px] border-l-cyan-600"
                        : "text-slate-600 hover:bg-slate-50 border-l-[3px] border-l-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center",
                        isCollapsed ? "justify-center" : "gap-3"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px] shrink-0 transition-colors duration-150",
                          isActive
                            ? "text-cyan-600"
                            : "text-slate-400 group-hover:text-slate-500"
                        )}
                      />
                      {!isCollapsed && (
                        <span
                          className={cn(
                            "text-sm",
                            isActive ? "font-semibold" : "font-normal"
                          )}
                        >
                          {item.label}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-medium",
                          typeof item.badge === "number"
                            ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && item.badge && (
                      <span className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 bg-cyan-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-[9px] font-semibold">
                          {typeof item.badge === "number" ? item.badge : "!"}
                        </span>
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

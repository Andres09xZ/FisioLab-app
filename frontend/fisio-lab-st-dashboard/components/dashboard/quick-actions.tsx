"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, UserPlus, ClipboardList, FileText, Zap } from "lucide-react"
import { CitaModal } from "@/components/agenda/CitaModal"

const actions = [
  { id: "nueva-cita", label: "Nueva Cita", icon: Plus, color: "#10B981" },
  { id: "nuevo-paciente", label: "Nuevo Paciente", icon: UserPlus, color: "#3B82F6" },
  { id: "nuevo-plan", label: "Nuevo Plan de Tratamiento", icon: ClipboardList, color: "#8B5CF6" },
  { id: "generar-certificado", label: "Generar Certificado", icon: FileText, color: "#F59E0B" },
]

export function QuickActions() {
  const router = useRouter()
  const [showNewCitaModal, setShowNewCitaModal] = useState(false)

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case "nuevo-paciente":
        router.push("/pacientes/nuevo")
        break
      case "nueva-cita":
        setShowNewCitaModal(true)
        break
      case "nuevo-plan":
        router.push("/planes/crear")
        break
      case "generar-certificado":
        router.push("/certificados")
        break
    }
  }

  return (
    <>
      <Card className="border-gray-200 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="h-4 w-4 text-emerald-600" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => handleAction(action.id)}
                  className="flex items-center gap-3 p-3 rounded border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50 transition-colors group w-full"
                >
                  <div className="p-2 rounded shrink-0" style={{ backgroundColor: `${action.color}15` }}>
                    <Icon className="h-4 w-4" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-cyan-700 text-left">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <CitaModal 
        open={showNewCitaModal} 
        onClose={() => setShowNewCitaModal(false)}
        onSuccess={() => {
          setShowNewCitaModal(false)
          // Disparar evento personalizado para recargar la agenda
          window.dispatchEvent(new Event('reloadAgenda'))
        }}
      />
    </>
  )
}

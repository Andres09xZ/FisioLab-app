"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, UserPlus, DollarSign, FileText, Zap } from "lucide-react"
import { NewPatientModal } from "./new-patient-modal"

const actions = [
  { id: "nueva-cita", label: "Nueva Cita", icon: Plus, color: "#10B981" },
  { id: "nuevo-paciente", label: "Nuevo Paciente", icon: UserPlus, color: "#3B82F6" },
  { id: "registrar-pago", label: "Registrar Pago", icon: DollarSign, color: "#8B5CF6" },
  { id: "generar-certificado", label: "Generar Certificado", icon: FileText, color: "#F59E0B" },
]

export function QuickActions() {
  const [showNewPatientModal, setShowNewPatientModal] = useState(false)

  const handleAction = (actionId: string) => {
    switch (actionId) {
      case "nuevo-paciente":
        setShowNewPatientModal(true)
        break
      case "nueva-cita":
        // TODO: Implementar modal de nueva cita
        console.log("Nueva cita")
        break
      case "registrar-pago":
        // TODO: Implementar modal de registrar pago
        console.log("Registrar pago")
        break
      case "generar-certificado":
        // TODO: Implementar modal de generar certificado
        console.log("Generar certificado")
        break
    }
  }

  return (
    <>
      <Card className="border-gray-200 h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-emerald-600" />
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
                  className="flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group w-full"
                >
                  <div className="p-3 rounded-xl shrink-0" style={{ backgroundColor: `${action.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: action.color }} />
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 text-left">
                    {action.label}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <NewPatientModal open={showNewPatientModal} onOpenChange={setShowNewPatientModal} />
    </>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"

const appointments = [
  { time: "09:00", patient: "María González", treatment: "Rodilla post-operatoria", color: "#10B981" },
  { time: "10:30", patient: "Carlos Ruiz", treatment: "Lumbalgia crónica", color: "#3B82F6" },
  { time: "11:00", patient: "Ana Martínez", treatment: "Valoración inicial", color: "#F59E0B" },
  { time: "14:00", patient: "Pedro Sánchez", treatment: "Cervicalgia", color: "#EF4444" },
]

export function UpcomingAppointments() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-600" />
          Próximas Citas de Hoy
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {appointments.map((apt, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <div className="w-1 h-12 rounded-full" style={{ backgroundColor: apt.color }} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{apt.patient}</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                    {apt.time}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{apt.treatment}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

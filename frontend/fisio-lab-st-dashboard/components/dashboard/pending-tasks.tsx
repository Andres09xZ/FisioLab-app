import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, AlertCircle } from "lucide-react"

const tasks = [
  { task: "Firmar 3 certificados de incapacidad", urgent: true },
  { task: "Subir resonancia de José Ramírez", urgent: false },
  { task: "Cobrar paquete a Sofia Herrera", urgent: true },
  { task: "Actualizar plan de tratamiento de Luis Mora", urgent: false },
]

export function PendingTasks() {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5 text-emerald-600" />
          Pendientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tasks.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <div className="flex-1">
                <p className="text-sm text-gray-700 group-hover:text-gray-900">{item.task}</p>
              </div>
              {item.urgent && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

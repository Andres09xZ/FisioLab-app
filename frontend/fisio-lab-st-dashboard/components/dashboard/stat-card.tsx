import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface StatCardProps {
  title: string
  value: string
  change?: string
  subtitle?: string
  progress?: number
  icon: LucideIcon
  color: string
}

export function StatCard({ title, value, change, subtitle, progress, icon: Icon, color }: StatCardProps) {
  return (
    <Card className="relative overflow-hidden border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            {change && <p className="text-sm text-emerald-600 font-medium">{change}</p>}
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
            {progress !== undefined && <Progress value={progress} className="mt-3" />}
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: `${color}15` }}>
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

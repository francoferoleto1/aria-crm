import { TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

const kpis = [
  {
    label: "Pipeline Total",
    value: "$548k",
    trend: "+12.4%",
    up: true,
    sub: "vs. mes anterior",
  },
  {
    label: "Oportunidades",
    value: "14",
    trend: "+3",
    up: true,
    sub: "activas este mes",
  },
  {
    label: "Contratos",
    value: "3",
    trend: "-1",
    up: false,
    sub: "pendientes firma",
  },
  {
    label: "Tareas Críticas",
    value: "9",
    trend: "+4",
    up: false,
    sub: "requieren atención",
  },
]

export function KPIRow() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-card rounded-2xl border border-border p-5 hover:border-primary/20 hover:shadow-sm transition-all duration-200"
        >
          <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">
            {kpi.label}
          </p>
          <div className="flex items-end justify-between">
            <span className="text-3xl font-semibold tracking-tight text-foreground">
              {kpi.value}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full",
                kpi.up
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-500"
              )}
            >
              {kpi.up ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {kpi.trend}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{kpi.sub}</p>
        </div>
      ))}
    </div>
  )
}

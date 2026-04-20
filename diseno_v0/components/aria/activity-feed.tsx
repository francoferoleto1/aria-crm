import { Sparkles, Mail, RefreshCw, FileText, Bell, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const activities = [
  {
    icon: RefreshCw,
    title: "ARIA actualizó el deal de Acme Corp",
    sub: "Cambió el stage de Propuesta → Negociación",
    time: "hace 12 min",
    type: "update",
  },
  {
    icon: Mail,
    title: "ARIA redactó un email para Carlos M.",
    sub: "Seguimiento de propuesta — listo para enviar",
    time: "hace 38 min",
    type: "email",
  },
  {
    icon: Bell,
    title: "Alerta: contrato Meridian vence en 4 días",
    sub: "Se requiere acción antes del 22 abr",
    time: "hace 1h",
    type: "alert",
  },
  {
    icon: FileText,
    title: "ARIA generó resumen de llamada con Nova",
    sub: "Puntos clave y próximos pasos extraídos",
    time: "hace 2h",
    type: "doc",
  },
  {
    icon: CheckCircle,
    title: "Tarea completada: enviar caso de uso a Solaris",
    sub: "Marcada automáticamente tras email confirmado",
    time: "hace 3h",
    type: "done",
  },
  {
    icon: Sparkles,
    title: "ARIA identificó oportunidad cross-sell en Acme",
    sub: "Potencial $32k adicional — módulo Analytics",
    time: "ayer",
    type: "insight",
  },
]

const typeStyles: Record<string, { bg: string; icon: string }> = {
  update: { bg: "bg-blue-50", icon: "text-blue-500" },
  email: { bg: "bg-violet-50", icon: "text-primary" },
  alert: { bg: "bg-red-50", icon: "text-red-500" },
  doc: { bg: "bg-amber-50", icon: "text-amber-500" },
  done: { bg: "bg-green-50", icon: "text-green-600" },
  insight: { bg: "bg-accent", icon: "text-primary" },
}

export function ActivityFeed() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Actividad Inteligente</h2>
        <span
          className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{
            background: "oklch(0.93 0.04 290)",
            color: "oklch(0.42 0.18 290)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: "oklch(0.52 0.22 290)" }}
          />
          En vivo
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {activities.map((a, i) => {
          const style = typeStyles[a.type]
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors duration-150 cursor-pointer group"
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                  style.bg
                )}
              >
                <a.icon className={cn("w-3.5 h-3.5", style.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground leading-snug">{a.title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{a.sub}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">{a.time}</span>
            </div>
          )
        })}
      </div>

      <button className="w-full py-2 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary border border-dashed border-border transition-all duration-150">
        Ver toda la actividad
      </button>
    </div>
  )
}

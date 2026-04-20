import { Sparkles, Mail, RefreshCw, FileText, Bell, CheckCircle } from "lucide-react"

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

const typeStyles = {
  update: { bg: "#EFF6FF", icon: "#3B82F6" },
  email: { bg: "#F3E8FF", icon: "#9333EA" },
  alert: { bg: "#FEF2F2", icon: "#EF4444" },
  doc: { bg: "#FFFBEB", icon: "#F59E0B" },
  done: { bg: "#ECFDF5", icon: "#10B981" },
  insight: { bg: "#EEF2FF", icon: "#2563EB" },
}

export function ActivityFeed() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #E2E8F0",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#0F172A",
        }}>
          Actividad Inteligente
        </h2>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "10px",
            fontWeight: 600,
            paddingX: "8px",
            paddingY: "2px",
            borderRadius: "9999px",
            background: "oklch(0.93 0.04 290)",
            color: "oklch(0.42 0.18 290)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "oklch(0.52 0.22 290)",
              animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            }}
          />
          En vivo
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        {activities.map((a, i) => {
          const style = typeStyles[a.type]
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                paddingX: "10px",
                paddingY: "10px",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 150ms",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#F8FAFC"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
              }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: style.bg,
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                <a.icon size={14} color={style.icon} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0F172A",
                  lineHeight: 1.4,
                }}>
                  {a.title}
                </p>
                <p style={{
                  fontSize: "11px",
                  color: "#94A3B8",
                  marginTop: "2px",
                  lineHeight: 1.4,
                }}>
                  {a.sub}
                </p>
              </div>
              <span style={{
                fontSize: "10px",
                color: "#94A3B8",
                flexShrink: 0,
                marginTop: "2px",
                whiteSpace: "nowrap",
              }}>
                {a.time}
              </span>
            </div>
          )
        })}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

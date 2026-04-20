import { useState } from "react"
import { Sparkles, X, ArrowRight, FileWarning, TrendingUp, Clock } from "lucide-react"

const priorities = [
  {
    icon: FileWarning,
    text: "1 contrato vence en 4 días — Renovación Acme Corp.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  {
    icon: TrendingUp,
    text: "2 oportunidades sin seguimiento en más de 7 días.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: Clock,
    text: "Propuesta para Meridian pendiente de aprobación interna.",
    color: "#2563EB",
    bg: "#EEF2FF",
  },
]

export function AIHeroCard() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "16px",
        border: "1px solid oklch(0.52 0.22 290 / 0.2)",
        background: "linear-gradient(135deg, oklch(0.97 0.015 290) 0%, oklch(0.99 0.005 260) 50%, oklch(0.97 0.01 200) 100%)",
        boxShadow: "0 1px 20px oklch(0.52 0.22 290 / 0.07)",
        marginBottom: "24px",
        overflow: "hidden",
      }}
    >
      {/* Subtle mesh dots */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.3,
          backgroundImage: "radial-gradient(circle, oklch(0.52 0.22 290 / 0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div style={{ position: "relative", padding: "20px" }}>
        {/* Header row */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "oklch(0.52 0.22 290)",
                boxShadow: "0 2px 8px oklch(0.52 0.22 290 / 0.35)",
                flexShrink: 0,
              }}
            >
              <Sparkles size={16} color="#fff" />
            </div>
            <div>
              <p style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "#94A3B8",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "2px",
              }}>
                ARIA Copilot
              </p>
              <h2 style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#0F172A",
                lineHeight: 1.2,
              }}>
                ✨ ARIA detectó 3 prioridades para hoy
              </h2>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 150ms",
            }}
            onMouseEnter={(e) => {
              e.target.style.color = "#0F172A"
              e.target.style.background = "rgba(255, 255, 255, 0.6)"
            }}
            onMouseLeave={(e) => {
              e.target.style.color = "#94A3B8"
              e.target.style.background = "transparent"
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Priority list */}
        <ul style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "20px",
          listStyle: "none",
          paddingLeft: 0,
        }}>
          {priorities.map((p, i) => (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: p.bg,
                  flexShrink: 0,
                }}
              >
                <p.icon size={14} color={p.color} />
              </span>
              <span style={{
                fontSize: "14px",
                color: "rgba(15, 23, 42, 0.8)",
              }}>
                {p.text}
              </span>
            </li>
          ))}
        </ul>

        {/* Action buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              paddingX: "16px",
              paddingY: "8px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#fff",
              background: "oklch(0.52 0.22 290)",
              border: "none",
              cursor: "pointer",
              transition: "all 200ms",
            }}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            onMouseDown={(e) => (e.target.style.transform = "scale(1)")}
          >
            <Sparkles size={14} />
            <span>Ver todos</span>
          </button>
          <button
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              paddingX: "16px",
              paddingY: "8px",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 600,
              color: "#2563EB",
              background: "rgba(37, 99, 235, 0.1)",
              border: "1px solid rgba(37, 99, 235, 0.2)",
              cursor: "pointer",
              transition: "all 200ms",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "rgba(37, 99, 235, 0.15)"
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "rgba(37, 99, 235, 0.1)"
            }}
          >
            <span>Resolver</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

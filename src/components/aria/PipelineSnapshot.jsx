const stages = [
  { label: "Prospección", count: 5, value: "$124k", pct: 100, color: "#6366F1" },
  { label: "Calificación", count: 4, value: "$98k", pct: 79, color: "#3B82F6" },
  { label: "Propuesta", count: 3, value: "$187k", pct: 62, color: "#F97316" },
  { label: "Negociación", count: 1, value: "$85k", pct: 30, color: "#8B5CF6" },
  { label: "Cierre", count: 1, value: "$54k", pct: 15, color: "#10B981" },
]

const deals = [
  { name: "Acme Corp", stage: "Negociación", value: "$85k", avatar: "AC", days: 4 },
  { name: "Meridian Inc", stage: "Propuesta", value: "$62k", avatar: "MI", days: 12 },
  { name: "Solaris AI", stage: "Calificación", value: "$34k", avatar: "SA", days: 7 },
  { name: "Nova Systems", stage: "Prospección", value: "$28k", avatar: "NS", days: 2 },
]

export function PipelineSnapshot() {
  return (
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      border: "1px solid #E2E8F0",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      height: "100%",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{
          fontSize: "14px",
          fontWeight: 600,
          color: "#0F172A",
        }}>Pipeline Snapshot</h2>
        <span style={{
          fontSize: "12px",
          color: "#94A3B8",
        }}>$548k total</span>
      </div>

      {/* Stage bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {stages.map((s) => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{
              fontSize: "12px",
              color: "#94A3B8",
              width: "96px",
              flexShrink: 0,
            }}>
              {s.label}
            </span>
            <div style={{
              flex: 1,
              height: "8px",
              borderRadius: "9999px",
              background: "#F1F5F9",
              overflow: "hidden",
            }}>
              <div
                style={{
                  height: "100%",
                  borderRadius: "9999px",
                  background: s.color,
                  transition: "all 500ms",
                  width: `${s.pct}%`,
                }}
              />
            </div>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: "12px",
                fontWeight: 600,
                color: "#0F172A",
              }}>
                {s.value}
              </span>
              <span style={{
                fontSize: "10px",
                color: "#94A3B8",
              }}>
                ({s.count})
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid #E2E8F0" }} />

      {/* Top deals */}
      <div>
        <p style={{
          fontSize: "12px",
          fontWeight: 500,
          color: "#94A3B8",
          marginBottom: "12px",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}>
          Deals principales
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {deals.map((d) => (
            <div
              key={d.name}
              style={{
                display: "flex",
                alignItems: "center",
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
              <div style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "#EEF2FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "#4F46E5",
                flexShrink: 0,
              }}>
                {d.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0F172A",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {d.name}
                </p>
                <p style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                }}>
                  {d.stage}
                </p>
              </div>
              <div style={{
                textAlign: "right",
                flexShrink: 0,
              }}>
                <p style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#0F172A",
                }}>
                  {d.value}
                </p>
                <p style={{
                  fontSize: "10px",
                  color: "#94A3B8",
                }}>
                  {d.days}d
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

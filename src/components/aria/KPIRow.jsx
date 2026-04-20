import { TrendingUp, TrendingDown } from "lucide-react"

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
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    }}>
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E2E8F0",
            padding: "20px",
            transition: "all 200ms",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(37, 99, 235, 0.2)"
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.05)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0"
            e.currentTarget.style.boxShadow = "none"
          }}
        >
          <p style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "#94A3B8",
            marginBottom: "12px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            {kpi.label}
          </p>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <span style={{
              fontSize: "32px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              color: "#0F172A",
            }}>
              {kpi.value}
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 600,
                paddingX: "8px",
                paddingY: "2px",
                borderRadius: "9999px",
                background: kpi.up ? "#ECFDF5" : "#FEF2F2",
                color: kpi.up ? "#047857" : "#B91C1C",
              }}
            >
              {kpi.up ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {kpi.trend}
            </span>
          </div>
          <p style={{
            fontSize: "12px",
            color: "#94A3B8",
            marginTop: "6px",
          }}>
            {kpi.sub}
          </p>
        </div>
      ))}
    </div>
  )
}

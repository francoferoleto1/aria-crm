import { useState } from "react"
import { TopHeader, AIHeroCard, KPIRow, PipelineSnapshot, ActivityFeed } from "."

export function ResumenPage() {
  const [askARIAOpen, setAskARIAOpen] = useState(false)

  return (
    <div style={{
      maxWidth: "1280px",
      marginX: "auto",
      paddingX: "16px",
      paddingY: "24px",
      "@media (min-width: 640px)": {
        paddingX: "24px",
      },
      "@media (min-width: 768px)": {
        paddingX: "32px",
        paddingY: "32px",
      },
    }}>
      {/* Top header */}
      <TopHeader onAskARIA={() => setAskARIAOpen(true)} />

      {/* AI Hero insight block */}
      <AIHeroCard />

      {/* KPI row */}
      <KPIRow />

      {/* Split: Pipeline + Activity - Responsive grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        "@media (min-width: 1024px)": {
          gridTemplateColumns: "1fr 1fr",
        },
        gap: "16px",
        "@media (min-width: 768px)": {
          gap: "24px",
        },
      }}>
        <PipelineSnapshot />
        <ActivityFeed />
      </div>
    </div>
  )
}

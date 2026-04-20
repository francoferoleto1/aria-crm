import { Sidebar } from "@/components/aria/sidebar"
import { TopHeader } from "@/components/aria/top-header"
import { AIHeroCard } from "@/components/aria/ai-hero-card"
import { KPIRow } from "@/components/aria/kpi-row"
import { PipelineSnapshot } from "@/components/aria/pipeline-snapshot"
import { ActivityFeed } from "@/components/aria/activity-feed"
import { CopilotFAB } from "@/components/aria/copilot-fab"

export default function DashboardPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Slim sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 ml-14 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          {/* Top header */}
          <TopHeader />

          {/* AI Hero insight block */}
          <AIHeroCard />

          {/* KPI row */}
          <KPIRow />

          {/* Split: Pipeline + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <PipelineSnapshot />
            <ActivityFeed />
          </div>
        </div>
      </main>

      {/* Floating AI Copilot FAB */}
      <CopilotFAB />
    </div>
  )
}

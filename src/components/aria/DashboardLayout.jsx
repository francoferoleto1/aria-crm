import { Sidebar } from "./Sidebar"
import { MobileNav } from "./MobileNav"
import { CopilotFAB } from "./CopilotFAB"

export function DashboardLayout({ children }) {
  return (
    <div style={{
      display: "flex",
      height: "100vh",
      overflow: "hidden",
      background: "#F8FAFC",
    }}>
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        marginLeft: "56px",
        overflowY: "auto",
        paddingTop: "0px",
      }}>
        {/* Mobile Navigation */}
        <MobileNav />

        {/* Content */}
        <div style={{
          flex: 1,
          paddingX: "16px",
          paddingY: "24px",
        }}>
          {children}
        </div>
      </main>

      {/* Floating Copilot FAB */}
      <CopilotFAB />
    </div>
  )
}

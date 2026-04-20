import { useState } from "react"
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  ScrollText,
  CheckSquare,
  Settings,
  Sparkles,
  LogOut,
} from "lucide-react"

const navItems = [
  { id: "overview", icon: LayoutDashboard, label: "Resumen", href: "/dashboard" },
  { id: "pipeline", icon: GitBranch, label: "Pipeline", href: "/dashboard/pipeline" },
  { id: "tenders", icon: FileText, label: "Licitaciones", href: "/dashboard/tenders" },
  { id: "contracts", icon: ScrollText, label: "Contratos", href: "/dashboard/contracts" },
  { id: "tasks", icon: CheckSquare, label: "Tareas", href: "/dashboard/tasks" },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("overview")

  return (
    <aside style={{
      position: "fixed",
      left: 0,
      top: 0,
      height: "100vh",
      width: "56px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      borderRight: "1px solid #E2E8F0",
      background: "#fff",
      padding: "16px 0",
      zIndex: 40,
    }}>
      {/* Top section: Logo + Nav */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "24px", width: "100%" }}>
        {/* Logo */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          background: "linear-gradient(135deg, #2563EB, #7C3AED)",
          boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
        }}>
          <Sparkles size={20} color="#fff" />
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", width: "100%", paddingX: "8px" }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveItem(item.id)}
              title={item.label}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 200ms",
                position: "relative",
                group: "relative",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: activeItem === item.id ? "#2563EB" : "#94A3B8",
              }}
              onMouseEnter={(e) => {
                if (activeItem !== item.id) e.target.style.color = "#0F172A"
              }}
              onMouseLeave={(e) => {
                if (activeItem !== item.id) e.target.style.color = "#94A3B8"
              }}
            >
              <item.icon size={16} style={{ position: "relative", zIndex: 1 }} />
              
              {/* Subtle left indicator for active state */}
              {activeItem === item.id && (
                <div style={{
                  position: "absolute",
                  left: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "4px",
                  height: "20px",
                  background: "#2563EB",
                  borderRadius: "0 4px 4px 0",
                }}/>
              )}

              {/* Tooltip on hover */}
              <span style={{
                position: "absolute",
                left: "100%",
                marginLeft: "8px",
                paddingX: "8px",
                paddingY: "4px",
                background: "#0F172A",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 500,
                borderRadius: "4px",
                whiteSpace: "nowrap",
                opacity: 0,
                transition: "opacity 200ms",
                pointerEvents: "none",
              }} 
              onMouseEnter={(e) => e.style.opacity = 1}
              onMouseLeave={(e) => e.style.opacity = 0}
              className="tooltip">
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom section: Settings + Logout */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", width: "100%", paddingX: "8px" }}>
        <button style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#94A3B8",
          transition: "all 150ms",
        }}
        onMouseEnter={(e) => e.target.style.color = "#0F172A"}
        onMouseLeave={(e) => e.target.style.color = "#94A3B8"}>
          <Settings size={16} />
        </button>
        <button style={{
          width: "36px",
          height: "36px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#94A3B8",
          transition: "all 150ms",
        }}
        onMouseEnter={(e) => e.target.style.color = "#0F172A"}
        onMouseLeave={(e) => e.target.style.color = "#94A3B8"}>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}

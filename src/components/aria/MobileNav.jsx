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
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { id: "overview", icon: LayoutDashboard, label: "Resumen", href: "/dashboard" },
  { id: "pipeline", icon: GitBranch, label: "Pipeline", href: "/dashboard/pipeline" },
  { id: "tenders", icon: FileText, label: "Licitaciones", href: "/dashboard/tenders" },
  { id: "contracts", icon: ScrollText, label: "Contratos", href: "/dashboard/contracts" },
  { id: "tasks", icon: CheckSquare, label: "Tareas", href: "/dashboard/tasks" },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const [activeItem, setActiveItem] = useState("overview")

  const handleNavClick = (id) => {
    setActiveItem(id)
    setOpen(false)
  }

  return (
    <>
      {/* Hamburger button - only visible on mobile */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "none",
          "@media (max-width: 768px)": { display: "flex" },
          position: "fixed",
          top: "16px",
          left: "16px",
          zIndex: 40,
          width: "40px",
          height: "40px",
          borderRadius: "8px",
          alignItems: "center",
          justifyContent: "center",
          background: "#2563EB",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        <Menu size={20} />
      </button>

      {/* Mobile drawer backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            zIndex: 39,
          }}
        />
      )}

      {/* Mobile drawer */}
      <div
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          height: "100vh",
          width: "256px",
          background: "#fff",
          borderRight: "1px solid #E2E8F0",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms",
          paddingX: "0px",
          paddingY: "16px",
        }}
      >
        {/* Header */}
        <div style={{ paddingX: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "#2563EB",
                  color: "#fff",
                }}
              >
                <Sparkles size={16} />
              </div>
              <span style={{ fontSize: "16px", fontWeight: 600, color: "#0F172A" }}>ARIA</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "#0F172A",
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Mobile nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px", paddingX: "8px" }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                paddingX: "16px",
                paddingY: "10px",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 500,
                transition: "all 200ms",
                background:
                  activeItem === item.id
                    ? "rgba(37, 99, 235, 0.1)"
                    : "transparent",
                color:
                  activeItem === item.id
                    ? "#2563EB"
                    : "rgba(15, 23, 42, 0.7)",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                if (activeItem !== item.id) {
                  e.target.style.background = "#F1F5F9"
                  e.target.style.color = "#0F172A"
                }
              }}
              onMouseLeave={(e) => {
                if (activeItem !== item.id) {
                  e.target.style.background = "transparent"
                  e.target.style.color = "rgba(15, 23, 42, 0.7)"
                }
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Mobile bottom actions */}
        <div style={{
          position: "absolute",
          bottom: "24px",
          left: 0,
          right: 0,
          paddingX: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <button style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingX: "16px",
            paddingY: "10px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(15, 23, 42, 0.7)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#F1F5F9"
            e.target.style.color = "#0F172A"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent"
            e.target.style.color = "rgba(15, 23, 42, 0.7)"
          }}>
            <Settings size={16} />
            Configuración
          </button>
          <button style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            paddingX: "16px",
            paddingY: "10px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "rgba(15, 23, 42, 0.7)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 150ms",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#F1F5F9"
            e.target.style.color = "#0F172A"
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent"
            e.target.style.color = "rgba(15, 23, 42, 0.7)"
          }}>
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  )
}

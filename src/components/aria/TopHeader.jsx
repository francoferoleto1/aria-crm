import { Search, Sparkles, Bell, ChevronDown } from "lucide-react"

export function TopHeader({ onAskARIA }) {
  return (
    <header style={{
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      marginBottom: "32px",
    }}>
      {/* Left: Title */}
      <div>
        <h1 style={{
          fontSize: "24px",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "#0F172A",
        }}>Resumen</h1>
        <p style={{
          fontSize: "14px",
          color: "#94A3B8",
          marginTop: "4px",
          fontWeight: 500,
        }}>Viernes, 18 de abril 2026</p>
      </div>

      {/* Right: search + AI button + avatar */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "12px",
      }}>
        {/* Search bar */}
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          paddingX: "14px",
          paddingY: "8px",
          borderRadius: "12px",
          border: "1px solid #E2E8F0",
          background: "#fff",
          color: "#94A3B8",
          fontSize: "14px",
          cursor: "pointer",
          transition: "all 150ms",
          minWidth: "220px",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#93C5FD"
          e.currentTarget.style.background = "#F0F4FF"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#E2E8F0"
          e.currentTarget.style.background = "#fff"
        }}>
          <Search size={14} />
          <span style={{ flex: 1, textAlign: "left", fontSize: "12px" }}>Buscar...</span>
          <kbd style={{
            fontSize: "10px",
            fontFamily: "monospace",
            background: "#F1F5F9",
            paddingX: "6px",
            paddingY: "2px",
            borderRadius: "4px",
            color: "#94A3B8",
            border: "1px solid #E2E8F0",
          }}>⌘K</kbd>
        </button>

        {/* Ask ARIA button */}
        <button
          onClick={onAskARIA}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            paddingX: "16px",
            paddingY: "8px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: 600,
            color: "#fff",
            background: "oklch(0.52 0.22 290)",
            boxShadow: "0 0 0 1px oklch(0.52 0.22 290 / 0.3), 0 4px 20px oklch(0.52 0.22 290 / 0.25), 0 1px 3px oklch(0.52 0.22 290 / 0.2)",
            border: "none",
            cursor: "pointer",
            transition: "all 200ms",
          }}
          onMouseEnter={(e) => e.target.style.transform = "scale(1.02)"}
          onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
          onMouseDown={(e) => e.target.style.transform = "scale(1)"}
        >
          <Sparkles size={14} />
          <span>Ask ARIA (AI)</span>
        </button>

        {/* Bell */}
        <button style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94A3B8",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "all 150ms",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#0F172A"
          e.currentTarget.style.background = "#F1F5F9"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#94A3B8"
          e.currentTarget.style.background = "transparent"
        }}>
          <Bell size={16} />
          <span style={{
            position: "absolute",
            top: "4px",
            right: "4px",
            width: "6px",
            height: "6px",
            background: "#2563EB",
            borderRadius: "50%",
          }} />
        </button>

        {/* Avatar */}
        <button style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          borderRadius: "12px",
          paddingX: "8px",
          paddingY: "4px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          transition: "all 150ms",
        }}
        onMouseEnter={(e) => e.target.style.background = "#F1F5F9"}
        onMouseLeave={(e) => e.target.style.background = "transparent"}>
          <div style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "#EEF2FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: "#4F46E5",
          }}>
            JM
          </div>
          <ChevronDown size={12} color="#94A3B8" />
        </button>
      </div>
    </header>
  )
}

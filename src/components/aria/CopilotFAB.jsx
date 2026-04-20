import { useState } from "react"
import { Sparkles } from "lucide-react"
import { ChatPanel } from "./ChatPanel"

export function CopilotFAB({ contacts = [], opportunities = [], contracts = [], tasks = [] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <ChatPanel 
        open={open} 
        onOpenChange={setOpen}
        contacts={contacts}
        opportunities={opportunities}
        contracts={contracts}
        tasks={tasks}
      />

      {/* FAB button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 50,
          width: "48px",
          height: "48px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 200ms",
          background: "oklch(0.52 0.22 290)",
          boxShadow: "0 0 0 1px oklch(0.52 0.22 290 / 0.3), 0 8px 24px oklch(0.52 0.22 290 / 0.4)",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
        title="Abrir ARIA Copilot"
      >
        <Sparkles size={20} color="#fff" />
      </button>
    </>
  )
}

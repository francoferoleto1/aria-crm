"use client"

import { useState } from "react"
import { Sparkles, X, Send, MessageSquare } from "lucide-react"

const suggestions = [
  "¿Cuáles son mis prioridades hoy?",
  "Redactar seguimiento para Acme Corp",
  "Mostrar pipeline en riesgo",
]

export function CopilotFAB() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 rounded-2xl border overflow-hidden"
          style={{
            borderColor: "oklch(0.52 0.22 290 / 0.2)",
            background: "oklch(1 0 0)",
            boxShadow:
              "0 8px 40px oklch(0.52 0.22 290 / 0.12), 0 2px 8px oklch(0 0 0 / 0.06)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.52 0.22 290) 0%, oklch(0.55 0.18 260) 100%)",
            }}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="text-sm font-semibold text-white">ARIA Copilot</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Suggestions */}
          <div className="p-3 flex flex-col gap-1.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1 mb-1">
              Sugerencias rápidas
            </p>
            {suggestions.map((s, i) => (
              <button
                key={i}
                className="flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-xs text-foreground hover:bg-accent transition-colors duration-150"
              >
                <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0" />
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-3 pb-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-secondary">
              <input
                type="text"
                placeholder="Pregunta algo a ARIA..."
                className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground text-foreground"
              />
              <button
                className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "oklch(0.52 0.22 290)" }}
              >
                <Send className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
        style={{
          background: "oklch(0.52 0.22 290)",
          boxShadow:
            "0 0 0 1px oklch(0.52 0.22 290 / 0.3), 0 8px 24px oklch(0.52 0.22 290 / 0.4)",
        }}
      >
        <Sparkles className="w-5 h-5 text-white" />
        <span className="sr-only">Abrir ARIA Copilot</span>
      </button>
    </>
  )
}

"use client"

import { useState } from "react"
import { Sparkles, X, ArrowRight, FileWarning, TrendingUp, Clock } from "lucide-react"

const priorities = [
  {
    icon: FileWarning,
    text: "1 contrato vence en 4 días — Renovación Acme Corp.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: TrendingUp,
    text: "2 oportunidades sin seguimiento en más de 7 días.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Clock,
    text: "Propuesta para Meridian pendiente de aprobación interna.",
    color: "text-primary",
    bg: "bg-accent",
  },
]

export function AIHeroCard() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="relative rounded-2xl border overflow-hidden mb-6"
      style={{
        borderColor: "oklch(0.52 0.22 290 / 0.2)",
        background:
          "linear-gradient(135deg, oklch(0.97 0.015 290) 0%, oklch(0.99 0.005 260) 50%, oklch(0.97 0.01 200) 100%)",
        boxShadow: "0 1px 20px oklch(0.52 0.22 290 / 0.07)",
      }}
    >
      {/* Subtle mesh dots */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(circle, oklch(0.52 0.22 290 / 0.12) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative p-5">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "oklch(0.52 0.22 290)",
                boxShadow: "0 2px 8px oklch(0.52 0.22 290 / 0.35)",
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                ARIA Copilot
              </p>
              <h2 className="text-sm font-semibold text-foreground leading-tight">
                ✨ ARIA detectó 3 prioridades para hoy
              </h2>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/60 transition-all duration-150"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Priority list */}
        <ul className="flex flex-col gap-2 mb-5">
          {priorities.map((p, i) => (
            <li key={i} className="flex items-center gap-2.5">
              <span
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${p.bg}`}
              >
                <p.icon className={`w-3.5 h-3.5 ${p.color}`} />
              </span>
              <span className="text-sm text-foreground/80">{p.text}</span>
            </li>
          ))}
        </ul>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-all duration-150 hover:scale-[1.02] active:scale-100"
            style={{
              background: "oklch(0.52 0.22 290)",
              boxShadow: "0 2px 10px oklch(0.52 0.22 290 / 0.3)",
            }}
          >
            Resolver prioridades
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/60 transition-all duration-150"
          >
            Descartar
          </button>
        </div>
      </div>
    </div>
  )
}

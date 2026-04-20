"use client"

import { Search, Sparkles, Bell, ChevronDown } from "lucide-react"

export function TopHeader() {
  return (
    <header className="flex items-center justify-between mb-8">
      {/* Left: Title */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Resumen</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Viernes, 18 de abril 2026</p>
      </div>

      {/* Right: search + AI button + avatar */}
      <div className="flex items-center gap-3">
        {/* Search bar */}
        <button className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-border bg-card text-muted-foreground text-sm hover:border-primary/30 hover:bg-accent/30 transition-all duration-150 min-w-[220px]">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left text-xs">Buscar...</span>
          <kbd className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground border border-border">
            ⌘K
          </kbd>
        </button>

        {/* Ask ARIA button */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground transition-all duration-200 hover:scale-[1.02] active:scale-100"
          style={{
            background: "oklch(0.52 0.22 290)",
            boxShadow:
              "0 0 0 1px oklch(0.52 0.22 290 / 0.3), 0 4px 20px oklch(0.52 0.22 290 / 0.25), 0 1px 3px oklch(0.52 0.22 290 / 0.2)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Ask ARIA (AI)
        </button>

        {/* Bell */}
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150 relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 rounded-xl px-2 py-1 hover:bg-secondary transition-all duration-150">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-xs font-semibold text-accent-foreground">
            JM
          </div>
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>
    </header>
  )
}

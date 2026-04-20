"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  ScrollText,
  CheckSquare,
  Settings,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Inicio", active: true },
  { icon: GitBranch, label: "Pipeline" },
  { icon: FileText, label: "Tenders" },
  { icon: ScrollText, label: "Contratos" },
  { icon: CheckSquare, label: "Tareas" },
]

export function Sidebar() {
  const [activeItem, setActiveItem] = useState(0)

  return (
    <aside className="fixed left-0 top-0 h-screen w-14 flex flex-col items-center border-r border-border bg-card py-4 gap-1 z-40">
      {/* Logo */}
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary mb-4">
        <Sparkles className="w-4 h-4 text-primary-foreground" />
      </div>

      {/* Nav items */}
      <nav className="flex flex-col items-center gap-1 flex-1">
        {navItems.map((item, index) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(index)}
            title={item.label}
            className={cn(
              "w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150",
              activeItem === index
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            <item.icon className="w-4 h-4" />
            <span className="sr-only">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Settings at bottom */}
      <button
        title="Configuración"
        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all duration-150"
      >
        <Settings className="w-4 h-4" />
        <span className="sr-only">Configuración</span>
      </button>
    </aside>
  )
}

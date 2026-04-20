const stages = [
  { label: "Prospección", count: 5, value: "$124k", pct: 100, color: "bg-chart-1/20", bar: "bg-chart-1" },
  { label: "Calificación", count: 4, value: "$98k", pct: 79, color: "bg-chart-2/20", bar: "bg-chart-2" },
  { label: "Propuesta", count: 3, value: "$187k", pct: 62, color: "bg-chart-4/20", bar: "bg-chart-4" },
  { label: "Negociación", count: 1, value: "$85k", pct: 30, color: "bg-chart-5/20", bar: "bg-chart-5" },
  { label: "Cierre", count: 1, value: "$54k", pct: 15, color: "bg-green-100", bar: "bg-green-500" },
]

const deals = [
  { name: "Acme Corp", stage: "Negociación", value: "$85k", avatar: "AC", days: 4 },
  { name: "Meridian Inc", stage: "Propuesta", value: "$62k", avatar: "MI", days: 12 },
  { name: "Solaris AI", stage: "Calificación", value: "$34k", avatar: "SA", days: 7 },
  { name: "Nova Systems", stage: "Prospección", value: "$28k", avatar: "NS", days: 2 },
]

export function PipelineSnapshot() {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-5 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Pipeline Snapshot</h2>
        <span className="text-xs text-muted-foreground">$548k total</span>
      </div>

      {/* Stage bars */}
      <div className="flex flex-col gap-3">
        {stages.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-24 shrink-0">{s.label}</span>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full ${s.bar} transition-all duration-500`}
                style={{ width: `${s.pct}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-medium text-foreground">{s.value}</span>
              <span className="text-[10px] text-muted-foreground">({s.count})</span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* Top deals */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-3">Deals principales</p>
        <div className="flex flex-col gap-2">
          {deals.map((d) => (
            <div
              key={d.name}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-secondary transition-colors duration-150 cursor-pointer"
            >
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground shrink-0">
                {d.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">{d.name}</p>
                <p className="text-[10px] text-muted-foreground">{d.stage}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-semibold text-foreground">{d.value}</p>
                <p className="text-[10px] text-muted-foreground">{d.days}d</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

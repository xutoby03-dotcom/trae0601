interface SeatIndicatorProps {
  total: number
  taken: number
}

export default function SeatIndicator({ total, taken }: SeatIndicatorProps) {
  const remaining = total - taken
  const pct = total > 0 ? (taken / total) * 100 : 0

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          座位 <span className="font-semibold text-slate-700">{taken}/{total}</span>
        </span>
        <span className={`text-xs font-bold ${remaining > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
          {remaining > 0 ? `剩${remaining}座` : '已满'}
        </span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pct >= 100 ? 'bg-amber-400' : pct >= 60 ? 'bg-orange-400' : 'bg-emerald-400'
          }`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
    </div>
  )
}

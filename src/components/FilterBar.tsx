import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

export interface FilterState {
  destination: string
  timePeriod: 'all' | 'today' | 'tomorrow' | 'thisWeek'
  minSeats: number
}

interface FilterBarProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [expanded, setExpanded] = useState(false)
  const hasActiveFilters = filters.destination || filters.timePeriod !== 'all' || filters.minSeats > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.destination}
            onChange={(e) => onChange({ ...filters, destination: e.target.value })}
            placeholder="搜索目的地..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
          />
          {filters.destination && (
            <button
              onClick={() => onChange({ ...filters, destination: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-slate-300 hover:text-slate-500" />
            </button>
          )}
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            hasActiveFilters
              ? 'bg-orange-50 border-orange-200 text-orange-600'
              : 'bg-white border-slate-200 text-slate-500 hover:border-orange-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          筛选
        </button>
      </div>

      {expanded && (
        <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4 shadow-sm">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">时间段</label>
            <div className="flex gap-2">
              {([
                { value: 'all', label: '全部' },
                { value: 'today', label: '今天' },
                { value: 'tomorrow', label: '明天' },
                { value: 'thisWeek', label: '本周' },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onChange({ ...filters, timePeriod: opt.value })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.timePeriod === opt.value
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-orange-50 hover:text-orange-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">
              最少剩余座位: <span className="text-orange-600 font-bold">{filters.minSeats}</span>
            </label>
            <input
              type="range"
              min="0"
              max="6"
              value={filters.minSeats}
              onChange={(e) => onChange({ ...filters, minSeats: Number(e.target.value) })}
              className="w-full accent-orange-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>不限</span>
              <span>6座</span>
            </div>
          </div>

          {hasActiveFilters && (
            <button
              onClick={() => onChange({ destination: '', timePeriod: 'all', minSeats: 0 })}
              className="text-xs text-orange-600 hover:text-orange-700 font-medium"
            >
              清除所有筛选
            </button>
          )}
        </div>
      )}
    </div>
  )
}

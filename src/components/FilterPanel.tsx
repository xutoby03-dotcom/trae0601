import { X, Search, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QuoteFilter, EMOTIONS, EMOTION_COLORS } from '@/types'

interface FilterPanelProps {
  open: boolean
  onClose: () => void
  filter: QuoteFilter
  onFilterChange: (filter: QuoteFilter) => void
}

export default function FilterPanel({ open, onClose, filter, onFilterChange }: FilterPanelProps) {
  const toggleEmotion = (emotion: string) => {
    const emotions = filter.emotions.includes(emotion)
      ? filter.emotions.filter((e) => e !== emotion)
      : [...filter.emotions, emotion]
    onFilterChange({ ...filter, emotions })
  }

  const clearFilter = () => {
    onFilterChange({
      keyword: '',
      emotions: [],
      character: '',
      yearFrom: null,
      yearTo: null,
    })
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/60 transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-[320px] flex-col border-l border-amber-primary/30 bg-cinema-800 transition-transform duration-300',
          open ? 'animate-slide-in-right' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-cinema-600 px-4 py-4">
          <h2 className="font-display text-lg text-white">筛选</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-cinema-500 transition-colors hover:bg-cinema-700 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cinema-500">关键词搜索</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-500" />
              <input
                type="text"
                value={filter.keyword}
                onChange={(e) => onFilterChange({ ...filter, keyword: e.target.value })}
                placeholder="搜索台词..."
                className="w-full rounded-lg border border-cinema-600 bg-cinema-700 py-2 pl-9 pr-3 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-cinema-500">情绪标签</label>
            <div className="grid grid-cols-2 gap-2">
              {EMOTIONS.map((emotion) => {
                const selected = filter.emotions.includes(emotion)
                const colorClass = EMOTION_COLORS[emotion] ?? ''
                return (
                  <button
                    key={emotion}
                    onClick={() => toggleEmotion(emotion)}
                    className={cn(
                      'flex items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-xs transition-all',
                      selected
                        ? cn(colorClass, 'border-solid ring-1 ring-current')
                        : 'border-cinema-600 text-cinema-500 hover:border-cinema-500'
                    )}
                  >
                    {selected && <span>✓</span>}
                    {emotion}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-cinema-500">角色搜索</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-cinema-500" />
              <input
                type="text"
                value={filter.character}
                onChange={(e) => onFilterChange({ ...filter, character: e.target.value })}
                placeholder="搜索角色..."
                className="w-full rounded-lg border border-cinema-600 bg-cinema-700 py-2 pl-9 pr-3 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-cinema-500">
              <Calendar size={14} />
              年份范围
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={filter.yearFrom ?? ''}
                onChange={(e) =>
                  onFilterChange({ ...filter, yearFrom: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="从"
                className="w-full rounded-lg border border-cinema-600 bg-cinema-700 py-2 px-3 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary"
              />
              <span className="text-cinema-500">—</span>
              <input
                type="number"
                value={filter.yearTo ?? ''}
                onChange={(e) =>
                  onFilterChange({ ...filter, yearTo: e.target.value ? Number(e.target.value) : null })
                }
                placeholder="到"
                className="w-full rounded-lg border border-cinema-600 bg-cinema-700 py-2 px-3 text-sm text-white placeholder-cinema-500 outline-none focus:border-amber-primary focus:ring-1 focus:ring-amber-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-cinema-600 px-4 py-4">
          <button
            onClick={clearFilter}
            className="flex-1 rounded-lg border border-cinema-600 py-2 text-sm text-cinema-500 transition-colors hover:border-cinema-500 hover:text-white"
          >
            清除筛选
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-amber-primary py-2 text-sm font-medium text-cinema-900 transition-colors hover:bg-amber-light"
          >
            确定
          </button>
        </div>
      </div>
    </>
  )
}

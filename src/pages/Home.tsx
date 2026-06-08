import { useState, useMemo } from 'react'
import { useToolStore, type ToolFilters } from '@/store/toolStore'
import ToolCard from '@/components/ToolCard'
import { Search, SlidersHorizontal, Wrench, X } from 'lucide-react'
import type { ToolCategory, ToolStatus } from '@/types'
import { CATEGORY_LABELS, STATUS_LABELS } from '@/types'

export default function Home() {
  const tools = useToolStore(s => s.tools)
  const getFilteredTools = useToolStore(s => s.getFilteredTools)
  const [filters, setFilters] = useState<ToolFilters>({
    search: '',
    category: 'all',
    status: 'all',
  })
  const [showFilters, setShowFilters] = useState(false)

  const filteredTools = useMemo(() => getFilteredTools(filters), [filters, tools])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { available: 0, borrowed: 0, maintenance: 0, all: tools.length }
    tools.forEach(t => { counts[t.status]++ })
    return counts
  }, [tools])

  return (
    <div className="min-h-screen pb-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-wood-800 via-wood-700 to-grass-800 pb-20 pt-8 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 left-8 w-32 h-32 rounded-full bg-grass-400 blur-3xl" />
          <div className="absolute bottom-4 right-12 w-40 h-40 rounded-full bg-wood-400 blur-3xl" />
        </div>
        <div className="container mx-auto relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-grass-600/20 backdrop-blur-sm border border-grass-500/30 flex items-center justify-center">
              <Wrench size={24} className="text-grass-300" />
            </div>
            <div>
              <h1 className="font-serif-sc text-2xl font-bold text-wood-50">邻里工具借还柜</h1>
              <p className="text-wood-200 text-sm">共享工具，温暖邻里</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-wood-400" />
              <input
                type="text"
                placeholder="搜索工具名称..."
                value={filters.search}
                onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/95 backdrop-blur-sm text-sm text-wood-800 placeholder-wood-400 border-0 focus:ring-2 focus:ring-grass-400 outline-none"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters(f => ({ ...f, search: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-wood-400 hover:text-wood-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 rounded-xl border transition-colors ${
                showFilters
                  ? 'bg-grass-600 border-grass-500 text-white'
                  : 'bg-white/95 border-wood-200 text-wood-600'
              }`}
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12">
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-wood-md border border-wood-100 p-4 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-wood-600 mb-2 block">工具分类</label>
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    active={filters.category === 'all'}
                    onClick={() => setFilters(f => ({ ...f, category: 'all' }))}
                  >
                    全部
                  </FilterPill>
                  {(Object.entries(CATEGORY_LABELS) as [ToolCategory, string][]).map(([key, label]) => (
                    <FilterPill
                      key={key}
                      active={filters.category === key}
                      onClick={() => setFilters(f => ({ ...f, category: key }))}
                    >
                      {label}
                    </FilterPill>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-wood-600 mb-2 block">工具状态</label>
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    active={filters.status === 'all'}
                    onClick={() => setFilters(f => ({ ...f, status: 'all' }))}
                  >
                    全部 ({statusCounts.all})
                  </FilterPill>
                  {(Object.entries(STATUS_LABELS) as [ToolStatus, string][]).map(([key, label]) => (
                    <FilterPill
                      key={key}
                      active={filters.status === key}
                      onClick={() => setFilters(f => ({ ...f, status: key }))}
                    >
                      {label} ({statusCounts[key] || 0})
                    </FilterPill>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-wood-500">
            共 <span className="font-semibold text-wood-700">{filteredTools.length}</span> 件工具
          </p>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-20">
            <Wrench size={48} className="mx-auto text-wood-300 mb-4" />
            <p className="text-wood-500">暂无符合条件的工具</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredTools.map(tool => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
        active
          ? 'bg-grass-600 text-white border-grass-600'
          : 'bg-wood-50 text-wood-600 border-wood-200 hover:border-grass-400'
      }`}
    >
      {children}
    </button>
  )
}

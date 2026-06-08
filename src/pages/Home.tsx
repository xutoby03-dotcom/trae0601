import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, GitCompareArrows, Clock, Star, AlertTriangle, Home as HomeIcon, MapPin } from 'lucide-react'
import { usePropertyStore } from '@/lib/store'
import { calculateTotalScore, RISK_TAG_LABELS } from '@/lib/types'
import { cn } from '@/lib/utils'

type SortKey = 'score' | 'rent' | 'commute' | 'risk'

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'score', label: '总分' },
  { key: 'rent', label: '租金' },
  { key: 'commute', label: '通勤' },
  { key: 'risk', label: '风险提醒' },
]

export default function Home() {
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const navigate = useNavigate()
  const { properties, compareIds, toggleCompare } = usePropertyStore()

  const sorted = useMemo(() => {
    return [...properties].sort((a, b) => {
      switch (sortKey) {
        case 'score':
          return calculateTotalScore(b.inspections) - calculateTotalScore(a.inspections)
        case 'rent':
          return a.rent - b.rent
        case 'commute':
          return a.commuteMinutes - b.commuteMinutes
        case 'risk':
          return b.riskTags.length - a.riskTags.length
        default:
          return 0
      }
    })
  }, [properties, sortKey])

  return (
    <div className="min-h-screen bg-[#1C1917] text-[#F5F5F4]">
      <header className="sticky top-0 z-10 bg-[#1C1917]/95 backdrop-blur border-b border-stone-800">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">租房看房清单</h1>
              <p className="text-sm text-[#78716C] mt-0.5">记录·评分·对比，找到最合适的家</p>
            </div>
            <div className="flex gap-2">
              <Link
                to="/add"
                className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={16} />
                添加房源
              </Link>
              <Link
                to="/compare"
                className={cn(
                  'inline-flex items-center gap-1.5 border px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  compareIds.length >= 2
                    ? 'border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10'
                    : 'border-stone-700 text-stone-600 pointer-events-none'
                )}
              >
                <GitCompareArrows size={16} />
                对比房源
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full bg-stone-800 flex items-center justify-center mb-6">
              <HomeIcon size={40} className="text-[#78716C]" />
            </div>
            <h2 className="text-xl font-semibold text-[#F5F5F4] mb-2">还没有添加房源</h2>
            <p className="text-[#78716C] mb-6 max-w-xs">
              点击「添加房源」按钮，开始记录你看过的每一套房子
            </p>
            <Link
              to="/add"
              className="inline-flex items-center gap-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              <Plus size={18} />
              添加第一套房源
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                    sortKey === opt.key
                      ? 'bg-[#F97316] text-white'
                      : 'bg-stone-800 text-[#78716C] hover:text-[#F5F5F4]'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sorted.map((property) => {
                const score = calculateTotalScore(property.inspections)
                const isChecked = compareIds.includes(property.id)

                return (
                  <div
                    key={property.id}
                    onClick={() => navigate(`/property/${property.id}`)}
                    className="bg-[#292524] rounded-xl shadow-lg hover:scale-[1.02] transition-transform cursor-pointer overflow-hidden"
                  >
                    <div className="h-36 bg-stone-700 relative">
                      {property.photos.length > 0 ? (
                        <img
                          src={property.photos[0]}
                          alt={property.community}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HomeIcon size={36} className="text-stone-500" />
                        </div>
                      )}
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleCompare(property.id)
                        }}
                        className="absolute top-3 right-3"
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
                            isChecked
                              ? 'bg-[#F97316] border-[#F97316]'
                              : 'border-stone-400 bg-stone-900/60'
                          )}
                        >
                          {isChecked && (
                            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-[#F5F5F4] truncate flex-1 mr-2">
                          {property.community}
                        </h3>
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-mono text-sm font-bold',
                            score >= 4
                              ? 'bg-green-500/20 text-green-400'
                              : score >= 2.5
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : score > 0
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-stone-700 text-stone-500'
                          )}
                          style={{ fontFamily: '"DM Mono", monospace' }}
                        >
                          {score > 0 ? score.toFixed(1) : '-'}
                        </div>
                      </div>

                      <p
                        className="text-xl font-bold text-[#F97316] mb-2"
                        style={{ fontFamily: '"DM Mono", monospace' }}
                      >
                        ¥{property.rent}
                        <span className="text-sm font-normal text-[#78716C]">/月</span>
                      </p>

                      <div className="flex flex-wrap gap-1.5 mb-3">
                        <span className="px-2 py-0.5 bg-stone-700 rounded text-xs text-[#A8A29E]">
                          {property.depositType}
                        </span>
                        <span className="px-2 py-0.5 bg-stone-700 rounded text-xs text-[#A8A29E]">
                          {property.area}m²
                        </span>
                        <span className="px-2 py-0.5 bg-stone-700 rounded text-xs text-[#A8A29E]">
                          {property.floor}
                        </span>
                        <span className="px-2 py-0.5 bg-stone-700 rounded text-xs text-[#A8A29E]">
                          {property.orientation}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-[#78716C] mb-2">
                        <Clock size={14} />
                        <span style={{ fontFamily: '"DM Mono", monospace' }}>{property.commuteMinutes}</span>
                        <span>分钟</span>
                      </div>

                      {property.riskTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {property.riskTags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-500/15 text-red-400 rounded text-xs"
                            >
                              <AlertTriangle size={10} />
                              {RISK_TAG_LABELS[tag]}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

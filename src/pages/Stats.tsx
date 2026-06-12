import { useState, useMemo } from 'react'
import { Palette, Clock, TrendingUp, Calendar, Coffee, Briefcase, Heart, Dumbbell, Building, Music } from 'lucide-react'
import type { ClothingColor, Occasion, OutfitRecord, Clothing } from '@/types'
import { COLOR_LABELS, COLOR_HEX, CATEGORY_LABELS, OCCASION_LABELS } from '@/types'
import { useWardrobeStore, getDaysSince } from '@/store/wardrobeStore'

const OCCASION_ICONS: Record<Occasion | 'none', typeof Coffee> = {
  casual: Coffee,
  work: Briefcase,
  date: Heart,
  sport: Dumbbell,
  formal: Building,
  party: Music,
  none: Calendar,
}

function getWeekNumber(dateStr: string): string {
  const d = new Date(dateStr)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${week.toString().padStart(2, '0')}`
}

const ALL_OCCASIONS_WITH_NONE: (Occasion | 'none')[] = ['casual', 'work', 'date', 'sport', 'formal', 'party', 'none']

export default function Stats() {
  const clothing = useWardrobeStore((s) => s.clothing)
  const outfitRecords = useWardrobeStore((s) => s.outfitRecords)
  const [activeOccasion, setActiveOccasion] = useState<Occasion | 'none' | 'all'>('all')

  const filteredRecords = useMemo(() => {
    if (activeOccasion === 'all') return outfitRecords
    if (activeOccasion === 'none') return outfitRecords.filter((r) => !r.occasion)
    return outfitRecords.filter((r) => r.occasion === activeOccasion)
  }, [outfitRecords, activeOccasion])

  const colorStats = useMemo(() => {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    const monthRecords = filteredRecords.filter((r) => r.date.startsWith(prefix))
    if (monthRecords.length === 0) return []

    const countMap: Partial<Record<ClothingColor, number>> = {}
    const idSet = new Set<string>()

    for (const record of monthRecords) {
      for (const id of [record.topId, record.bottomId, record.outerwearId, record.shoesId]) {
        if (id && !idSet.has(id)) {
          idSet.add(id)
          const item = clothing.find((c) => c.id === id)
          if (item) {
            countMap[item.color] = (countMap[item.color] || 0) + 1
          }
        }
      }
    }

    return (Object.entries(countMap) as [ClothingColor, number][])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
  }, [clothing, filteredRecords])

  const idleItems = useMemo(() => {
    if (clothing.length === 0) return []
    return [...clothing]
      .sort((a, b) => getDaysSince(b.lastWornDate, b.createdAt) - getDaysSince(a.lastWornDate, a.createdAt))
      .slice(0, 5)
  }, [clothing])

  const weeklyStats = useMemo(() => {
    if (filteredRecords.length === 0) return []
    const weekCount: Record<string, number> = {}
    for (const record of filteredRecords) {
      const week = getWeekNumber(record.date)
      weekCount[week] = (weekCount[week] || 0) + 1
    }
    const sorted = Object.entries(weekCount).sort((a, b) => a[0].localeCompare(b[0]))
    const last8 = sorted.slice(-8)
    return last8.map(([week, count], i) => ({
      label: `W${i + 1}`,
      count,
      week,
    }))
  }, [filteredRecords])

  const maxColorCount = colorStats.length > 0 ? colorStats[0][1] : 0
  const maxWeeklyCount = weeklyStats.length > 0 ? Math.max(...weeklyStats.map((w) => w.count)) : 0

  const occasionStats = useMemo(() => {
    if (outfitRecords.length === 0) return []
    const countMap: Record<string, number> = {}
    for (const record of outfitRecords) {
      const key = record.occasion || 'none'
      countMap[key] = (countMap[key] || 0) + 1
    }
    return Object.entries(countMap)
      .map(([key, count]) => ({ key: key as Occasion | 'none', count }))
      .sort((a, b) => b.count - a.count)
  }, [outfitRecords])

  const maxOccasionCount = occasionStats.length > 0 ? Math.max(...occasionStats.map((o) => o.count)) : 0

  const recentOutfits = useMemo(() => {
    const clothingMap = new Map<string, Clothing>(clothing.map((c) => [c.id, c]))
    return [...filteredRecords]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 6)
      .map((record) => ({
        record,
        items: [record.topId, record.bottomId, record.outerwearId, record.shoesId]
          .map((id) => clothingMap.get(id))
          .filter(Boolean) as Clothing[],
      }))
  }, [filteredRecords, clothing])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-charcoal">穿搭统计</h1>
        <p className="mt-1 text-sm text-charcoal/50">了解你的穿搭习惯与衣物使用情况</p>

        <div className="mt-5">
          <p className="text-xs font-medium text-charcoal/40 uppercase tracking-wider mb-2">按场合筛选</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveOccasion('all')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                activeOccasion === 'all'
                  ? 'bg-warm-500 text-white shadow-sm'
                  : 'bg-white text-charcoal/60 hover:bg-warm-100 border border-warm-200'
              }`}
            >
              全部场合
              <span className="ml-1.5 text-[10px] opacity-70">
                {outfitRecords.length}
              </span>
            </button>
            {ALL_OCCASIONS_WITH_NONE.map((occ) => {
              const Icon = OCCASION_ICONS[occ]
              const label = occ === 'none' ? '未选择' : OCCASION_LABELS[occ]
              const count = occasionStats.find((s) => s.key === occ)?.count ?? 0
              return (
                <button
                  key={occ}
                  onClick={() => setActiveOccasion(occ)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    activeOccasion === occ
                      ? 'bg-sand text-white shadow-sm'
                      : 'bg-white text-charcoal/60 hover:bg-warm-100 border border-warm-200'
                  }`}
                >
                  <Icon size={13} />
                  {label}
                  <span
                    className={`ml-1 text-[10px] ${
                      activeOccasion === occ ? 'opacity-80' : 'text-charcoal/30'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-warm-500" />
              <h2 className="font-display font-semibold text-lg">本月颜色偏好</h2>
            </div>
            {activeOccasion !== 'all' && (
              <span className="text-[11px] px-2 py-1 rounded-full bg-sand/10 text-sand-700 font-medium">
                {activeOccasion === 'none'
                  ? '未选择场合'
                  : OCCASION_LABELS[activeOccasion]}
              </span>
            )}
          </div>
          {colorStats.length === 0 ? (
            <p className="text-charcoal/30 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {colorStats.map(([color, count]) => (
                <div key={color} className="flex items-center gap-3">
                  <span className="text-sm text-charcoal/60 w-12 shrink-0">{COLOR_LABELS[color]}</span>
                  <span
                    className="w-4 h-4 rounded-full shrink-0 border border-warm-200"
                    style={{ backgroundColor: COLOR_HEX[color] }}
                  />
                  <div className="flex-1 h-6 bg-warm-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(count / maxColorCount) * 100}%`,
                        backgroundColor: COLOR_HEX[color],
                      }}
                    />
                  </div>
                  <span className="text-sm text-charcoal/50 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warm-500" />
              <h2 className="font-display font-semibold text-lg">场合分布</h2>
            </div>
            {activeOccasion !== 'all' && (
              <button
                onClick={() => setActiveOccasion('all')}
                className="text-[10px] text-charcoal/40 hover:text-warm-500 transition-colors px-2 py-1"
              >
                清除筛选
              </button>
            )}
          </div>
          {occasionStats.length === 0 ? (
            <p className="text-charcoal/30 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-2">
              {occasionStats.map(({ key, count }) => {
                const Icon = OCCASION_ICONS[key]
                const label = key === 'none' ? '未选择' : OCCASION_LABELS[key]
                const isActive = activeOccasion === key
                return (
                  <button
                    key={key}
                    onClick={() => setActiveOccasion(key)}
                    className={`w-full flex items-center gap-3 p-2.5 rounded-xl transition-all text-left ${
                      isActive
                        ? 'bg-sand/10 ring-1 ring-sand'
                        : 'hover:bg-warm-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-sand/20' : 'bg-warm-100'
                      }`}
                    >
                      <Icon
                        size={14}
                        className={isActive ? 'text-sand' : 'text-warm-500'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-xs font-medium ${
                            isActive ? 'text-sand' : 'text-charcoal/70'
                          }`}
                        >
                          {label}
                        </span>
                        <span
                          className={`text-xs ${
                            isActive ? 'text-sand/70' : 'text-charcoal/40'
                          }`}
                        >
                          {count}次
                        </span>
                      </div>
                      <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isActive ? 'bg-sand' : 'bg-warm-500'
                          }`}
                          style={{ width: `${(count / maxOccasionCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-warm-500" />
            <h2 className="font-display font-semibold text-lg">闲置最长</h2>
          </div>
          {idleItems.length === 0 ? (
            <p className="text-charcoal/30 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {idleItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.photoUrl ? (
                    <img
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <span
                      className="w-10 h-10 rounded-full shrink-0 border border-warm-200"
                      style={{ backgroundColor: COLOR_HEX[item.color] }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal truncate">{item.name}</p>
                    <p className="text-xs text-charcoal/40">{CATEGORY_LABELS[item.category]}</p>
                  </div>
                  <span className="text-sm text-warm-500 font-medium shrink-0">
                    {getDaysSince(item.lastWornDate, item.createdAt)}天
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-warm-500" />
              <h2 className="font-display font-semibold text-lg">每周搭配</h2>
            </div>
            {activeOccasion !== 'all' && (
              <span className="text-[11px] px-2 py-1 rounded-full bg-sand/10 text-sand-700 font-medium">
                {activeOccasion === 'none'
                  ? '未选择场合'
                  : OCCASION_LABELS[activeOccasion]}
              </span>
            )}
          </div>
          {weeklyStats.length === 0 ? (
            <p className="text-charcoal/30 text-sm">暂无数据</p>
          ) : (
            <div className="flex items-end gap-2 h-[140px]">
              {weeklyStats.map((week) => (
                <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-md bg-warm-500 transition-all duration-500"
                    style={{
                      height: `${maxWeeklyCount > 0 ? (week.count / maxWeeklyCount) * 120 : 0}px`,
                    }}
                  />
                  <span className="text-xs text-charcoal/40">{week.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-warm-500" />
              <h2 className="font-display font-semibold text-lg">最近搭配</h2>
            </div>
            {activeOccasion !== 'all' && (
              <span className="text-[11px] px-2 py-1 rounded-full bg-sand/10 text-sand-700 font-medium">
                {activeOccasion === 'none'
                  ? '未选择场合'
                  : OCCASION_LABELS[activeOccasion]}
              </span>
            )}
          </div>
          {recentOutfits.length === 0 ? (
            <p className="text-charcoal/30 text-sm">暂无数据</p>
          ) : (
            <div className="space-y-3">
              {recentOutfits.map(({ record, items }) => {
                const OccasionIcon = OCCASION_ICONS[record.occasion || 'none']
                const occasionLabel = record.occasion ? OCCASION_LABELS[record.occasion] : '未选择'
                return (
                  <div key={record.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-warm-50 transition-colors">
                    <div className="flex flex-col items-center w-12 shrink-0">
                      <span className="text-lg font-display font-bold text-warm-500">
                        {record.date.slice(8, 10)}
                      </span>
                      <span className="text-[10px] text-charcoal/40">
                        {record.date.slice(5, 7)}月
                      </span>
                    </div>
                    <div className="flex -space-x-2 shrink-0">
                      {items.slice(0, 4).map((item) =>
                        item.photoUrl ? (
                          <img
                            key={item.id}
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-9 h-9 rounded-lg object-cover border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div
                            key={item.id}
                            className="w-9 h-9 rounded-lg border-2 border-white shadow-sm"
                            style={{ backgroundColor: COLOR_HEX[item.color] }}
                          />
                        )
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal truncate">
                        {items.map((i) => i.name).join(' + ')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <OccasionIcon size={12} className="text-warm-500" />
                      <span className="text-xs text-charcoal/60">{occasionLabel}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { Palette, Clock, TrendingUp } from 'lucide-react'
import type { ClothingColor } from '@/types'
import { COLOR_LABELS, COLOR_HEX, CATEGORY_LABELS } from '@/types'
import { useWardrobeStore, getDaysSince } from '@/store/wardrobeStore'

function getWeekNumber(dateStr: string): string {
  const d = new Date(dateStr)
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${week.toString().padStart(2, '0')}`
}

export default function Stats() {
  const clothing = useWardrobeStore((s) => s.clothing)
  const outfitRecords = useWardrobeStore((s) => s.outfitRecords)

  const colorStats = useMemo(() => {
    const now = new Date()
    const prefix = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
    const monthRecords = outfitRecords.filter((r) => r.date.startsWith(prefix))
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
  }, [clothing, outfitRecords])

  const idleItems = useMemo(() => {
    if (clothing.length === 0) return []
    return [...clothing]
      .sort((a, b) => getDaysSince(b.lastWornDate) - getDaysSince(a.lastWornDate))
      .slice(0, 5)
  }, [clothing])

  const weeklyStats = useMemo(() => {
    if (outfitRecords.length === 0) return []
    const weekCount: Record<string, number> = {}
    for (const record of outfitRecords) {
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
  }, [outfitRecords])

  const maxColorCount = colorStats.length > 0 ? colorStats[0][1] : 0
  const maxWeeklyCount = weeklyStats.length > 0 ? Math.max(...weeklyStats.map((w) => w.count)) : 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-charcoal">穿搭统计</h1>
        <p className="mt-1 text-sm text-charcoal/50">了解你的穿搭习惯与衣物使用情况</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-5 h-5 text-warm-500" />
            <h2 className="font-display font-semibold text-lg">本月颜色偏好</h2>
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
                    {getDaysSince(item.lastWornDate)}天
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-warm-500" />
            <h2 className="font-display font-semibold text-lg">每周搭配</h2>
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
      </div>
    </div>
  )
}

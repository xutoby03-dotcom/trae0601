import { useMemo } from 'react'
import { differenceInDays } from 'date-fns'
import { BarChart3, Leaf, Droplets, Skull, AlertTriangle, Trophy, TrendingUp, Heart } from 'lucide-react'
import { usePlantStore } from '@/store/plantStore'
import { MOCK_EMPLOYEES } from '@/data/mockData'

const AREAS = ['A区', 'B区', 'C区'] as const

const AVATAR_MAP = Object.fromEntries(MOCK_EMPLOYEES.map((e) => [e.id, e.avatar]))

const RANK_STYLES: Record<number, string> = {
  0: 'bg-amber-100 border-amber-400 text-amber-800',
  1: 'bg-stone-100 border-stone-400 text-stone-600',
  2: 'bg-orange-100 border-orange-400 text-orange-700',
}

const RANK_ICONS: Record<number, string> = {
  0: '🥇',
  1: '🥈',
  2: '🥉',
}

export default function Stats() {
  const plants = usePlantStore((s) => s.plants)
  const adoptions = usePlantStore((s) => s.adoptions)
  const observations = usePlantStore((s) => s.observations)
  const alerts = usePlantStore((s) => s.alerts)

  const totalPlants = plants.length
  const totalAdoptions = adoptions.filter((a) => !a.endDate).length
  const totalObservations = observations.length
  const unresolvedAlerts = alerts.filter((a) => !a.resolved).length

  const areaStats = useMemo(() => {
    const stats = AREAS.map((area) => {
      const areaPlants = plants.filter((p) => p.area === area)
      const total = areaPlants.length
      const healthy = areaPlants.filter((p) => p.status === 'healthy' && !p.isDead).length
      const pct = total > 0 ? Math.round((healthy / total) * 100) : 0
      return { area, total, healthy, pct }
    })
    const bestPct = Math.max(...stats.map((s) => s.pct))
    return stats.map((s) => ({ ...s, isBest: s.pct === bestPct && s.total > 0 }))
  }, [plants])

  const topCaretakers = useMemo(() => {
    const countMap: Record<string, { userId: string; userName: string; count: number }> = {}
    for (const obs of observations) {
      if (!countMap[obs.userId]) {
        countMap[obs.userId] = { userId: obs.userId, userName: obs.userName, count: 0 }
      }
      countMap[obs.userId].count++
    }
    return Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }, [observations])

  const deadPlants = useMemo(() => plants.filter((p) => p.isDead), [plants])
  const alivePlants = useMemo(() => plants.filter((p) => !p.isDead), [plants])
  const survivalRate = totalPlants > 0 ? Math.round((alivePlants.length / totalPlants) * 100) : 100

  const hardestTypes = useMemo(() => {
    const typeMap: Record<string, { total: number; dead: number }> = {}
    for (const p of plants) {
      if (!typeMap[p.name]) typeMap[p.name] = { total: 0, dead: 0 }
      typeMap[p.name].total++
      if (p.isDead) typeMap[p.name].dead++
    }
    return Object.entries(typeMap)
      .filter(([, v]) => v.dead > 0)
      .map(([name, v]) => ({ name, dead: v.dead, total: v.total, rate: Math.round((v.dead / v.total) * 100) }))
      .sort((a, b) => b.rate - a.rate || b.dead - a.dead)
  }, [plants])

  const avgDaysSinceWater = useMemo(() => {
    if (alivePlants.length === 0) return 0
    const total = alivePlants.reduce((sum, p) => sum + differenceInDays(new Date(), new Date(p.lastWateredAt)), 0)
    return Math.round(total / alivePlants.length)
  }, [alivePlants])

  const summaryCards = [
    { label: '植物总数', value: totalPlants, icon: Leaf, color: 'bg-emerald-500' },
    { label: '领养中', value: totalAdoptions, icon: Heart, color: 'bg-rose-500' },
    { label: '观察记录', value: totalObservations, icon: BarChart3, color: 'bg-stone-500' },
    { label: '未处理警报', value: unresolvedAlerts, icon: AlertTriangle, color: 'bg-amber-500' },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-500 text-white px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8" />
            <h1 className="text-2xl font-bold">数据统计</h1>
          </div>
          <p className="text-emerald-100">绿植养护全景一览</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
              <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-stone-800">{card.value}</div>
                <div className="text-sm text-stone-500">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            区域健康统计
          </h2>
          <div className="space-y-4">
            {areaStats.map((s) => (
              <div
                key={s.area}
                className={`p-4 rounded-lg border-2 transition-all ${
                  s.isBest ? 'border-emerald-400 bg-emerald-50' : 'border-stone-200 bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-800">{s.area}</span>
                    <span className="text-sm text-stone-500">共 {s.total} 株</span>
                    {s.isBest && (
                      <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full">最佳</span>
                    )}
                  </div>
                  <span className={`text-lg font-bold ${s.isBest ? 'text-emerald-600' : 'text-stone-700'}`}>
                    {s.pct}%
                  </span>
                </div>
                <div className="w-full bg-stone-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      s.isBest ? 'bg-emerald-500' : 'bg-emerald-300'
                    }`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-stone-400">
                  <span>健康率</span>
                  <span>{s.healthy}/{s.total} 株健康</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            看护达人榜
          </h2>
          <div className="space-y-3">
            {topCaretakers.map((c, i) => (
              <div
                key={c.userId}
                className={`flex items-center gap-4 p-3 rounded-lg border-2 ${
                  RANK_STYLES[i] || 'border-stone-200 bg-white'
                }`}
              >
                <span className="text-xl w-8 text-center">{RANK_ICONS[i] || `${i + 1}`}</span>
                <span className="text-2xl">{AVATAR_MAP[c.userId] || '🧑'}</span>
                <span className="font-medium flex-1">{c.userName}</span>
                <div className="text-right">
                  <span className="text-lg font-bold">{c.count}</span>
                  <span className="text-sm text-stone-500 ml-1">次观察</span>
                </div>
              </div>
            ))}
            {topCaretakers.length === 0 && (
              <p className="text-stone-400 text-center py-4">暂无观察记录</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-500" />
            植物存活率
          </h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="flex-1">
              <div className="w-full bg-stone-200 rounded-full h-6 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 flex items-center justify-end pr-2 transition-all duration-500"
                  style={{ width: `${survivalRate}%` }}
                >
                  {survivalRate >= 20 && <span className="text-xs text-white font-bold">{survivalRate}%</span>}
                </div>
              </div>
            </div>
            <div className="text-sm text-stone-500 whitespace-nowrap">
              存活 <span className="font-bold text-emerald-600">{alivePlants.length}</span> / {totalPlants}
            </div>
          </div>

          {deadPlants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-stone-600 mb-2">已离世植物</h3>
              <div className="space-y-2">
                {deadPlants.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <Skull className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-stone-700">{p.name}</span>
                    <span className="text-sm text-stone-400">{p.area} · {p.desk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hardestTypes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-stone-600 mb-2">最难养活的品种</h3>
              <div className="space-y-2">
                {hardestTypes.map((t) => (
                  <div key={t.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                    <span className="font-medium text-stone-700">{t.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-stone-500">死亡 {t.dead}/{t.total}</span>
                      <span className="text-sm font-bold text-red-500">{t.rate}% 死亡率</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            浇水概况
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-stone-800">{avgDaysSinceWater}</div>
              <div className="text-sm text-stone-500 mt-1">平均浇水间隔（天）</div>
            </div>
            <div className="bg-stone-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-emerald-600">
                {alivePlants.filter((p) => p.status === 'healthy').length}
              </div>
              <div className="text-sm text-stone-500 mt-1">健康植物</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

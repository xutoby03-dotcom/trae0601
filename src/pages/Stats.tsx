import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGardenStore } from '@/store/useGardenStore'
import { VARIETY_PRESETS, OBSERVATION_TYPE_CONFIG, type ObservationType } from '@/types'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Trophy, AlertTriangle, TrendingUp, Leaf, Bug } from 'lucide-react'

const CHART_COLORS = ['#4A7C59', '#D4573B', '#E8854A', '#7FB5C4', '#C4A35A', '#98D4A8', '#D06A2E', '#5A9DB0']

export default function Stats() {
  const { plants, observations, harvests } = useGardenStore()

  const varietyStats = useMemo(() => {
    const map = new Map<string, {
      count: number
      harvests: number
      totalWeight: number
      issueCount: number
      plantsWithIssues: number
      emoji: string
    }>()

    plants.forEach((p) => {
      const existing = map.get(p.variety) || { count: 0, harvests: 0, totalWeight: 0, issueCount: 0, plantsWithIssues: 0, emoji: '🌱' }
      existing.count++
      const preset = VARIETY_PRESETS.find((v) => v.name === p.variety)
      if (preset) existing.emoji = preset.emoji

      const plantHarvests = harvests.filter((h) => h.plantId === p.id)
      existing.harvests += plantHarvests.length
      existing.totalWeight += plantHarvests.reduce((s, h) => s + h.weightGrams, 0)

      const plantObs = observations.filter((o) => o.plantId === p.id)
      const issues = plantObs.filter((o) => ['pest', 'yellowing'].includes(o.type))
      existing.issueCount += issues.length
      if (issues.length > 0) existing.plantsWithIssues++

      map.set(p.variety, existing)
    })

    return Array.from(map.entries()).map(([variety, stats]) => ({
      variety,
      ...stats,
      healthyRate: stats.count > 0
        ? Math.round(((stats.count - stats.plantsWithIssues) / stats.count) * 100)
        : 100,
      avgHarvest: stats.count > 0 ? Math.round(stats.totalWeight / stats.count) : 0,
    }))
  }, [plants, observations, harvests])

  const thisYearHarvests = useMemo(() => {
    const year = new Date().getFullYear()
    return harvests.filter((h) => new Date(h.harvestDate).getFullYear() === year)
  }, [harvests])

  const totalThisYear = thisYearHarvests.reduce((s, h) => s + h.weightGrams, 0)

  const harvestByVariety = useMemo(() => {
    const map = new Map<string, number>()
    thisYearHarvests.forEach((h) => {
      const plant = plants.find((p) => p.id === h.plantId)
      if (plant) {
        map.set(plant.variety, (map.get(plant.variety) || 0) + h.weightGrams)
      }
    })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [thisYearHarvests, plants])

  const problemPlants = useMemo(() => {
    return plants
      .map((p) => {
        const plantObs = observations.filter((o) => o.plantId === p.id)
        const issues = plantObs.filter((o) => ['pest', 'yellowing'].includes(o.type))
        const issueTypes = issues.reduce((acc, o) => {
          acc[o.type] = (acc[o.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        return { ...p, issueCount: issues.length, issueTypes }
      })
      .filter((p) => p.issueCount > 0)
      .sort((a, b) => b.issueCount - a.issueCount)
  }, [plants, observations])

  const monthlyHarvest = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => i)
    const year = new Date().getFullYear()
    return months.map((m) => {
      const monthHarvests = thisYearHarvests.filter(
        (h) => new Date(h.harvestDate).getMonth() === m
      )
      return {
        month: format(new Date(year, m), 'M月', { locale: zhCN }),
        weight: monthHarvests.reduce((s, h) => s + h.weightGrams, 0),
      }
    })
  }, [thisYearHarvests])

  const hasData = plants.length > 0

  return (
    <div className="animate-fade-in">
      <h2 className="section-title flex items-center gap-2 mb-6">
        📊 菜园统计
      </h2>

      {!hasData ? (
        <div className="card-wood p-12 text-center">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="font-handwriting text-2xl text-earth-700 mb-2">
            还没有数据
          </h3>
          <p className="font-serif text-earth-500 mb-6">
            添加一些植物后，这里会显示你的菜园统计
          </p>
          <Link to="/add" className="btn-primary">开始种植</Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card-paper p-4 text-center">
              <div className="font-mono text-3xl font-bold text-leaf-600">{plants.length}</div>
              <div className="text-xs font-serif text-earth-500 mt-1">盆植物</div>
            </div>
            <div className="card-paper p-4 text-center">
              <div className="font-mono text-3xl font-bold text-chili-600">{totalThisYear}</div>
              <div className="text-xs font-serif text-earth-500 mt-1">克今年收获</div>
            </div>
            <div className="card-paper p-4 text-center">
              <div className="font-mono text-3xl font-bold text-dew-600">{thisYearHarvests.length}</div>
              <div className="text-xs font-serif text-earth-500 mt-1">次收获</div>
            </div>
            <div className="card-paper p-4 text-center">
              <div className="font-mono text-3xl font-bold text-tomato-600">{problemPlants.length}</div>
              <div className="text-xs font-serif text-earth-500 mt-1">盆有问题</div>
            </div>
          </div>

          <div className="card-paper p-5">
            <div className="tape-decoration pt-2">
              <h3 className="font-handwriting text-lg text-earth-700 mb-4 flex items-center gap-2">
                <Trophy size={18} className="text-earth-400" />
                品种分析
              </h3>
            </div>

            {varietyStats.length === 0 ? (
              <p className="font-serif text-earth-400 text-center py-4">暂无品种数据</p>
            ) : (
              <div className="space-y-3">
                {varietyStats.map((vs, i) => (
                  <div key={vs.variety} className="flex items-center gap-3 p-3 rounded-xl bg-earth-50/50">
                    <span className="text-2xl">{vs.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-semibold text-earth-800">{vs.variety}</span>
                        <span className="text-xs font-serif text-earth-500">
                          {vs.count}盆 · {vs.harvests}次收获 · {vs.totalWeight}g
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-earth-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${vs.healthyRate >= 80 ? 'bg-leaf-400' : vs.healthyRate >= 50 ? 'bg-earth-400' : 'bg-tomato-400'}`}
                              style={{ width: `${Math.max(vs.healthyRate, 5)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-serif text-earth-500">
                            好养率 {vs.healthyRate}% · {vs.count - vs.plantsWithIssues}/{vs.count}盆无异常
                          </span>
                        </div>
                        {vs.issueCount > 0 && (
                          <span className="tag bg-tomato-50 text-tomato-600 border border-tomato-200">
                            ⚠️ {vs.issueCount}次异常
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {harvestByVariety.length > 0 && (
            <div className="card-paper p-5">
              <div className="tape-decoration pt-2">
                <h3 className="font-handwriting text-lg text-earth-700 mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-leaf-500" />
                  今年收获品种分布
                </h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={harvestByVariety}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}g`}
                    >
                      {harvestByVariety.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}克`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {thisYearHarvests.length > 0 && (
            <div className="card-paper p-5">
              <h3 className="font-handwriting text-lg text-earth-700 mb-4 flex items-center gap-2">
                📅 月度收获趋势
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyHarvest}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E0D0A0" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: '"Noto Serif SC"' }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value: number) => `${value}克`} />
                    <Bar dataKey="weight" fill="#4A7C59" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {problemPlants.length > 0 && (
            <div className="card-paper p-5">
              <div className="tape-decoration pt-2">
                <h3 className="font-handwriting text-lg text-earth-700 mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-tomato-500" />
                  问题花盆排行
                </h3>
              </div>
              <div className="space-y-2">
                {problemPlants.map((p, i) => (
                  <Link
                    key={p.id}
                    to={`/plant/${p.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-tomato-50/50 transition-colors"
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-mono font-bold ${
                      i === 0 ? 'bg-tomato-500 text-white' :
                      i === 1 ? 'bg-chili-400 text-white' :
                      i === 2 ? 'bg-earth-400 text-white' :
                      'bg-earth-200 text-earth-600'
                    }`}>
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-serif font-semibold text-earth-800">{p.name}</span>
                      <span className="text-xs font-serif text-earth-500 ml-2">({p.variety})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {Object.entries(p.issueTypes).map(([type, count]) => {
                        const config = OBSERVATION_TYPE_CONFIG[type as ObservationType]
                        return (
                          <span key={type} className="tag bg-tomato-50 text-tomato-600 border border-tomato-200">
                            {config?.emoji || '⚠️'} {count}
                          </span>
                        )
                      })}
                    </div>
                    <span className="font-mono text-lg font-bold text-tomato-500">
                      {p.issueCount}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

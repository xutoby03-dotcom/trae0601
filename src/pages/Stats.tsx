import { useMemo, useState } from 'react'
import { useStore } from '@/store'
import { getWeekDates, formatDate, getDayName } from '@/utils'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Line } from 'recharts'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, AlertTriangle, Coffee, Clock, ChevronDown, ChevronRight } from 'lucide-react'

const CHART_COLORS = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#F59E0B', '#D97706', '#B45309', '#92400E']
const WARM_COLORS = ['#F97316', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#F59E0B']

export default function Stats() {
  const { members, recipes, mealRecords, dayPlans, getWeekStats } = useStore()
  const [expandedMember, setExpandedMember] = useState<string | null>(null)

  const completionData = useMemo(() => {
    const counts: Record<string, { name: string; icon: string; count: number }> = {}
    mealRecords.forEach((r) => {
      if (r.leftoverLevel === 'none') {
        const plan = dayPlans.find((p) => p.date === r.date)
        if (!plan) return
        plan.recipeIds.forEach((rid) => {
          const recipe = recipes.find((rc) => rc.id === rid)
          if (!recipe) return
          if (!counts[rid]) counts[rid] = { name: recipe.name, icon: recipe.icon, count: 0 }
          counts[rid].count++
        })
      }
    })
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 8)
  }, [mealRecords, dayPlans, recipes])

  const memberEatenData = useMemo(() => {
    return members.map((m, i) => {
      const memberRecords = mealRecords.filter((r) => r.memberId === m.id)
      const eaten = memberRecords.filter((r) => r.status === 'eaten').length
      const rate = memberRecords.length > 0 ? Math.round((eaten / memberRecords.length) * 100) : 0
      return { name: m.name, avatar: m.avatar, value: rate, color: WARM_COLORS[i % WARM_COLORS.length] }
    })
  }, [members, mealRecords])

  const weeklyCostData = useMemo(() => {
    return [0, -1, -2, -3].map((offset) => {
      const dates = getWeekDates(offset)
      const weekStart = dates[0]
      const stats = getWeekStats(weekStart)
      const label = `${formatDate(dates[0])}周`
      return { week: label, cost: stats.totalSpent, budget: stats.totalBudget / 7 }
    }).reverse()
  }, [getWeekStats])

  const wasteData = useMemo(() => {
    const counts: Record<string, { name: string; icon: string; count: number }> = {}
    mealRecords.forEach((r) => {
      if (r.leftoverLevel === 'much') {
        const plan = dayPlans.find((p) => p.date === r.date)
        if (!plan) return
        plan.recipeIds.forEach((rid) => {
          const recipe = recipes.find((rc) => rc.id === rid)
          if (!recipe) return
          if (!counts[rid]) counts[rid] = { name: recipe.name, icon: recipe.icon, count: 0 }
          counts[rid].count++
        })
      }
    })
    return Object.values(counts).sort((a, b) => b.count - a.count)
  }, [mealRecords, dayPlans, recipes])

  const maxWaste = useMemo(() => Math.max(...wasteData.map((d) => d.count), 1), [wasteData])

  const busyData = useMemo(() => {
    return members.map((m) => {
      const memberRecords = mealRecords.filter((r) => r.memberId === m.id && (r.status === 'skipped' || r.status === 'late'))
      const skipped = mealRecords.filter((r) => r.memberId === m.id && r.status === 'skipped').length
      const late = mealRecords.filter((r) => r.memberId === m.id && r.status === 'late').length
      const details = memberRecords
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 5)
        .map((r) => ({
          recordId: r.id,
          date: r.date,
          status: r.status,
          notes: r.notes,
        }))
      return { id: m.id, name: m.name, avatar: m.avatar, skipped, late, total: skipped + late, details }
    }).filter((d) => d.total > 0).sort((a, b) => b.total - a.total)
  }, [members, mealRecords])

  const maxBusy = useMemo(() => Math.max(...busyData.map((d) => d.total), 1), [busyData])

  if (mealRecords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
          <Coffee className="w-12 h-12 text-orange-300" />
        </div>
        <h2 className="text-lg font-semibold text-amber-900 mb-2">暂无就餐记录</h2>
        <p className="text-sm text-amber-700/60">记录早餐就餐情况后，这里将展示详细统计分析</p>
      </div>
    )
  }

  const centerRate = memberEatenData.length > 0
    ? Math.round(memberEatenData.reduce((s, d) => s + d.value, 0) / memberEatenData.length)
    : 0

  return (
    <div className="px-4 pb-8">
      <h1 className="text-xl font-bold text-amber-900 mb-5">统计分析</h1>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center gap-1.5 mb-3">
            <BarChart3 className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-amber-900">早餐完成度排行</span>
          </div>
          {completionData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-amber-400">暂无数据</div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={completionData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                  formatter={(v: number) => [`${v}次`, '完成次数']}
                />
                <Bar dataKey="count" fill="#F97316" radius={[4, 4, 0, 0]} barSize={24} label={{ position: 'top', fontSize: 10, fill: '#78350F' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center gap-1.5 mb-3">
            <PieChartIcon className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-amber-900">成员就餐率</span>
          </div>
          {memberEatenData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-amber-400">暂无数据</div>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={memberEatenData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={2} strokeWidth={0}>
                    {memberEatenData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v}%`, '就餐率']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <span className="text-lg font-bold text-amber-900">{centerRate}%</span>
                  <span className="block text-[10px] text-amber-600">平均</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-amber-900">每周花费趋势</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weeklyCostData} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#FED7AA" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                formatter={(v: number, name: string) => [`¥${v}`, name === 'cost' ? '花费' : '预算']}
              />
              <Area type="monotone" dataKey="cost" stroke="#F97316" fill="url(#costGrad)" strokeWidth={2} dot={{ r: 3, fill: '#F97316' }} />
              <Line type="monotone" dataKey="budget" stroke="#9CA3AF" strokeDasharray="4 4" dot={false} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-3">
          <div className="flex items-center gap-1.5 mb-3">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-medium text-amber-900">浪费排行</span>
          </div>
          {wasteData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <span className="text-2xl mb-2">🎉</span>
              <span className="text-xs text-green-600 font-medium">没有浪费记录</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {wasteData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-sm">{item.icon}</span>
                  <span className={cn('text-xs flex-1 truncate', item.count === 0 ? 'text-green-600' : 'text-amber-900')}>{item.name}</span>
                  <span className={cn('text-xs font-medium', item.count === 0 ? 'text-green-600' : 'text-red-500')}>{item.count}次</span>
                  <div className="w-12 h-1.5 bg-orange-50 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full', item.count === 0 ? 'bg-green-400' : 'bg-red-400')}
                      style={{ width: `${(item.count / maxWaste) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 bg-white rounded-2xl shadow-sm p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Clock className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-amber-900">没时间吃排行</span>
        </div>
        {busyData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-2xl mb-2">😊</span>
            <span className="text-xs text-green-600 font-medium">大家都按时吃了早餐</span>
          </div>
        ) : (
          <div className="space-y-1.5">
            {busyData.map((d) => (
              <div key={d.id}>
                <button
                  onClick={() => setExpandedMember(expandedMember === d.id ? null : d.id)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-xl hover:bg-orange-50 transition-colors text-left"
                >
                  <span className="text-lg">{d.avatar}</span>
                  <span className="text-xs font-medium text-amber-900 flex-1">{d.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">{d.skipped}次没吃</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-600 font-medium">{d.late}次迟到</span>
                  <div className="w-16 h-1.5 bg-orange-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-red-400" style={{ width: `${(d.total / maxBusy) * 100}%` }} />
                  </div>
                  {expandedMember === d.id ? (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  )}
                </button>
                {expandedMember === d.id && (
                  <div className="ml-8 mr-2 mb-1 space-y-1">
                    {d.details.map((detail) => (
                      <div key={`${d.id}-${detail.recordId}`} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-orange-50/60">
                        <span className="text-[10px] text-amber-500 w-14 shrink-0">{formatDate(detail.date)} {getDayName(detail.date)}</span>
                        <span className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                          detail.status === 'skipped' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-600'
                        )}>
                          {detail.status === 'skipped' ? '没吃' : '迟到'}
                        </span>
                        <span className={cn('text-[10px] truncate', detail.notes?.trim() ? 'text-amber-600/60' : 'text-amber-300/50')}>
                          {detail.notes?.trim() || '无备注'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

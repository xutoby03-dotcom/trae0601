import { useMemo } from 'react'
import { useStore } from '@/store'
import { getWeekDates, formatDate } from '@/utils'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Line } from 'recharts'
import { BarChart3, PieChart as PieChartIcon, TrendingUp, AlertTriangle, Coffee } from 'lucide-react'

const CHART_COLORS = ['#F97316', '#FB923C', '#FDBA74', '#FED7AA', '#F59E0B', '#D97706', '#B45309', '#92400E']
const WARM_COLORS = ['#F97316', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#F59E0B']

export default function Stats() {
  const { members, recipes, mealRecords, dayPlans, getWeekStats } = useStore()

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
    </div>
  )
}

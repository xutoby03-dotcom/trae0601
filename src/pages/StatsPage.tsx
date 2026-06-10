import { useEffect, useMemo, useState } from 'react'
import { useApp } from '@/store/app'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import {
  BarChart3, Users, AlertTriangle, CheckCircle,
  TrendingUp, Sparkles, Filter, ChevronDown, LayoutPanelTop
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import type { ProductType } from '../../shared/types'

const typeColorMap: Partial<Record<ProductType, string>> = {
  '手工艺品': '#a78bfa',
  '文创周边': '#818cf8',
  '食品饮料': '#fb923c',
  '服饰鞋帽': '#f472b6',
  '美妆个护': '#fb7185',
  '家居日用': '#2dd4bf',
  '数码配件': '#60a5fa',
  '图书印刷': '#fbbf24',
  '植物花卉': '#4ade80',
  '公益义卖': '#eab308',
  '公司展示': '#38bdf8',
  '其他': '#a1a1aa',
}

export default function StatsPage() {
  const { exhibitions, currentExhibitionId, stats, fetchStats, setCurrentExhibition } = useApp()
  const [selectedId, setSelectedId] = useState<number>(0)

  useEffect(() => {
    const id = selectedId || currentExhibitionId || exhibitions[0]?.id || 0
    if (id) { fetchStats(id); setCurrentExhibition(id); setSelectedId(id) }
  }, [currentExhibitionId, exhibitions.length])

  const handleSelect = (id: number) => {
    setSelectedId(id); fetchStats(id); setCurrentExhibition(id)
  }

  const utilizationData = useMemo(() => {
    if (!stats?.utilization?.length) return []
    return stats.utilization.map(u => ({
      ...u,
      rate: +(u.rate * 100).toFixed(0),
    }))
  }, [stats])

  const typeData = useMemo(() => stats?.type_distribution || [], [stats])
  const lateData = useMemo(() => stats?.late_ranking || [], [stats])

  const utilizationRate = stats?.total_booths ? Math.round(stats.occupied_booths / stats.total_booths * 100) : 0

  return (
    <>
      <PageHeader
        title="统计面板"
        subtitle="从利用率、类型分布到迟到排行，数据一目了然"
        actions={
          <div className="relative">
            <Filter className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={selectedId || ''}
              onChange={e => handleSelect(+e.target.value)}
              className="input-base pl-9 pr-8 appearance-none w-64"
            >
              {exhibitions.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-forest-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        }
      />

      <section className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: '摊位利用率', value: `${utilizationRate}%`, sub: `${stats?.occupied_booths || 0} / ${stats?.total_booths || 0}`, icon: TrendingUp, cls: 'bg-gradient-to-br from-forest-600 to-forest-800 text-white' },
            { label: '总申请数', value: stats?.total_applications || 0, sub: '累计提交', icon: Users, cls: 'bg-gradient-to-br from-sky-500 to-sky-700 text-white' },
            { label: '待审核', value: stats?.pending_applications || 0, sub: '需处理', icon: CheckCircle, cls: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white' },
            { label: '冲突告警', value: stats?.conflict_count || 0, sub: '需关注', icon: AlertTriangle, cls: (stats?.conflict_count || 0) > 0 ? 'bg-gradient-to-br from-red-500 to-red-700 text-white' : 'bg-gradient-to-br from-zinc-400 to-zinc-500 text-white' },
          ].map(it => {
            const Icon = it.icon
            return (
              <div key={it.label} className={cn('rounded-2xl p-5 relative overflow-hidden shadow-soft animate-fade-in', it.cls)}>
                <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                <div className="absolute -right-10 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="font-serif text-4xl font-semibold tabular-nums leading-tight mb-1">{it.value}</div>
                  <div className="text-xs font-medium opacity-80">{it.label} <span className="opacity-60">· {it.sub}</span></div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 card p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">
                <TrendingUp className="w-4 h-4 text-copper-500" />
                摊位利用率趋势
              </h3>
              <span className="text-xs text-forest-400">近 7 天</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={utilizationData}>
                  <defs>
                    <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1B4332" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#1B4332" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbece2" />
                  <XAxis dataKey="date" stroke="#5b9c77" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#5b9c77" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      borderRadius: 12,
                      border: '1px solid #dbece2',
                      boxShadow: '0 4px 16px rgba(27,67,50,0.1)',
                      fontSize: 12,
                    }}
                    formatter={(v: any) => [`${v}%`, '利用率']}
                  />
                  <Area type="monotone" dataKey="rate" stroke="#1B4332" strokeWidth={2.5} fill="url(#utilGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6 animate-slide-up" style={{ animationDelay: '50ms' }}>
            <h3 className="section-title mb-5">
              <Sparkles className="w-4 h-4 text-copper-500" />
              报名类型分布
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData as any}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="type"
                  >
                    {(typeData as any).map((entry: any, idx: number) => (
                      <Cell key={idx} fill={(typeColorMap as any)[entry.type] || '#a1a1aa'} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      borderRadius: 12,
                      border: '1px solid #dbece2',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2 max-h-28 overflow-y-auto">
              {(typeData as any).map((t: any) => (
                <div key={t.type} className="flex items-center gap-1.5 text-[11px] text-forest-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: (typeColorMap as any)[t.type] || '#a1a1aa' }} />
                  {t.type} <span className="opacity-60">({t.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card p-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">
                <LayoutPanelTop className="w-4 h-4 text-copper-500" />
                类型数量对比
              </h3>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData as any} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#dbece2" horizontal={false} />
                  <XAxis type="number" stroke="#5b9c77" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis dataKey="type" type="category" stroke="#5b9c77" fontSize={11} tickLine={false} axisLine={false} width={90} />
                  <Tooltip
                    cursor={{ fill: '#f0f7f4' }}
                    contentStyle={{
                      background: 'white',
                      borderRadius: 12,
                      border: '1px solid #dbece2',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {(typeData as any).map((entry: any, idx: number) => (
                      <Cell key={idx} fill={(typeColorMap as any)[entry.type] || '#a1a1aa'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-2 card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="section-title">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                迟到黑名单 · 迟到频次排行
              </h3>
              <span className="text-xs text-forest-400">按迟到次数降序</span>
            </div>
            {lateData.length === 0 ? (
              <div className="py-16 text-center text-forest-400 text-sm">暂无迟到记录，所有摊主都很准时👏</div>
            ) : (
              <div className="space-y-3">
                {lateData.map((row, idx) => {
                  const max = Math.max(...lateData.map(r => r.late_count as number), 1)
                  const width = max ? (row.late_count as number / max) * 100 : 0
                  const rate = row.total_count ? Math.round((row.late_count as number / row.total_count) * 100) : 0
                  const level = row.late_count >= 3 ? 'red' : row.late_count >= 2 ? 'amber' : 'emerald'
                  const colorMap = {
                    red: { bar: 'bg-red-400', text: 'text-red-600', bg: 'bg-red-50' },
                    amber: { bar: 'bg-amber-400', text: 'text-amber-600', bg: 'bg-amber-50' },
                    emerald: { bar: 'bg-emerald-400', text: 'text-emerald-600', bg: 'bg-emerald-50' },
                  }
                  const c = colorMap[level as keyof typeof colorMap]
                  return (
                    <div key={idx} className="flex items-center gap-4 p-3 rounded-xl hover:bg-forest-50/50 transition-colors">
                      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center font-serif font-semibold text-xs shrink-0',
                        idx < 3 ? 'bg-copper-500 text-white shadow-copper' : 'bg-forest-100 text-forest-600')}
                      >{idx + 1}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="font-medium text-forest-800 truncate">{row.vendor_name}</div>
                          <div className="flex items-center gap-3 shrink-0 ml-3">
                            <span className="text-xs tabular-nums text-forest-500">
                              共参与 {row.total_count} 次
                            </span>
                            <span className={cn('badge', c.bg, c.text)}>
                              迟到 {row.late_count} 次 · {rate}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2 rounded-full bg-forest-100 overflow-hidden">
                          <div
                            className={cn('h-full rounded-full transition-all duration-500', c.bar)}
                            style={{ width: `${width}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}

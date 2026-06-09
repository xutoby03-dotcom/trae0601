import { useStore } from '@/store'
import { cn } from '@/lib/utils'
import { Clock, RotateCcw, Package, AlertTriangle, BarChart3, TrendingUp, FileCheck, Users } from 'lucide-react'

export default function Statistics() {
  const inspections = useStore(s => s.inspections)
  const properties = useStore(s => s.properties)
  const staff = useStore(s => s.staff)

  const completedInsps = inspections.filter(i => i.startedAt && i.completedAt)
  const avgMinutes = completedInsps.length
    ? completedInsps.reduce((s, i) => s + (new Date(i.completedAt!).getTime() - new Date(i.startedAt!).getTime()) / 60000, 0) / completedInsps.length
    : 0
  const avgH = Math.floor(avgMinutes / 60)
  const avgM = Math.round(avgMinutes % 60)

  const reviewed = inspections.filter(i => i.status === 'approved' || i.status === 'reviewing')
  const reworkRate = reviewed.length ? Math.round((reviewed.filter(i => i.reworkItems.length > 0).length / reviewed.length) * 100) : 0

  const totalSupply = inspections.reduce((s, i) => s + i.supplyRecords.reduce((ss, r) => ss + r.quantity, 0), 0)

  const cleanerStats = staff.filter(s => s.role === 'cleaner').map(c => {
    const insps = inspections.filter(i => i.cleanerId === c.id)
    const done = insps.filter(i => i.startedAt && i.completedAt)
    const avg = done.length ? done.reduce((s, i) => s + (new Date(i.completedAt!).getTime() - new Date(i.startedAt!).getTime()) / 60000, 0) / done.length : 0
    return { name: c.name, total: insps.length, avgTime: Math.round(avg) }
  })
  const maxAvg = Math.max(...cleanerStats.map(c => c.avgTime), 1)

  const reworkMap = new Map<string, number>()
  inspections.forEach(insp => insp.reworkItems.forEach(ri => {
    const ci = insp.checkItems.find(c => c.id === ri.checkItemId)
    if (ci) reworkMap.set(ci.name, (reworkMap.get(ci.name) || 0) + 1)
  }))
  const topRework = [...reworkMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  const maxRework = topRework[0]?.[1] || 1

  const supplyMap = new Map<string, number>()
  inspections.forEach(insp => insp.supplyRecords.forEach(sr => {
    supplyMap.set(sr.itemName, (supplyMap.get(sr.itemName) || 0) + sr.quantity)
  }))
  const supplyList = [...supplyMap.entries()].sort((a, b) => b[1] - a[1])
  const maxSup = supplyList[0]?.[1] || 1

  const complaintRank = [...properties].filter(p => p.complaintCount > 0).sort((a, b) => b.complaintCount - a.complaintCount)
  const maxComp = complaintRank[0]?.complaintCount || 1

  const cards = [
    { icon: FileCheck, label: '总检查单数', value: inspections.length, bg: 'bg-warm-500' },
    { icon: Clock, label: '保洁平均耗时', value: avgH > 0 ? `${avgH}h${avgM}m` : `${avgM}min`, bg: 'bg-sage-500' },
    { icon: RotateCcw, label: '返工率', value: `${reworkRate}%`, bg: 'bg-coral-400' },
    { icon: Package, label: '备品补充总量', value: totalSupply, bg: 'bg-warm-400' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <h1 className="font-serif text-2xl font-bold text-warm-800">数据统计</h1>

      <div className="grid grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, bg }) => (
          <div key={label} className="bg-white rounded-xl p-4 shadow-sm border border-warm-100">
            <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center mb-3', bg)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-bold text-warm-800">{value}</div>
            <div className="text-sm text-warm-400 mt-1">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-sage-500" />
          <h2 className="font-serif font-bold text-warm-800">保洁效率</h2>
        </div>
        <div className="space-y-3">
          {cleanerStats.map(({ name, total, avgTime }) => (
            <div key={name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-warm-700 font-medium">{name}</span>
                <span className="text-warm-400"><Users className="w-3 h-3 inline mr-1" />{total}单 · 平均{avgTime}min</span>
              </div>
              <div className="h-6 bg-warm-50 rounded-full overflow-hidden">
                <div className="h-full bg-sage-400 rounded-full transition-all" style={{ width: `${(avgTime / maxAvg) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-coral-400" />
          <h2 className="font-serif font-bold text-warm-800">返工项目排行</h2>
        </div>
        {topRework.length === 0 ? <p className="text-warm-400 text-sm">暂无返工记录</p> : (
          <div className="space-y-3">
            {topRework.map(([name, count], i) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-warm-700 font-medium">{name}</span>
                  <span className="text-warm-400">{count}次</span>
                </div>
                <div className="h-5 bg-warm-50 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', i === 0 ? 'bg-coral-400' : 'bg-coral-200')} style={{ width: `${(count / maxRework) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-warm-400" />
          <h2 className="font-serif font-bold text-warm-800">备品消耗</h2>
        </div>
        {supplyList.length === 0 ? <p className="text-warm-400 text-sm">暂无备品记录</p> : (
          <div className="space-y-3">
            {supplyList.map(([name, qty]) => (
              <div key={name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-warm-700 font-medium">{name}</span>
                  <span className="text-warm-400">{qty}件</span>
                </div>
                <div className="h-4 bg-warm-50 rounded-full overflow-hidden">
                  <div className="h-full bg-warm-300 rounded-full transition-all" style={{ width: `${(qty / maxSup) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-warm-100">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-coral-400" />
          <h2 className="font-serif font-bold text-warm-800">房源投诉排名</h2>
        </div>
        {complaintRank.length === 0 ? <p className="text-warm-400 text-sm">暂无投诉记录</p> : (
          <div className="space-y-3">
            {complaintRank.map((p, i) => (
              <div key={p.id} className={cn(i === 0 && 'bg-coral-50 -mx-2 px-2 py-1 rounded-lg')}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={cn('font-medium', i === 0 ? 'text-coral-500' : 'text-warm-700')}>{p.name}</span>
                  <span className={cn(i === 0 ? 'text-coral-500 font-bold' : 'text-warm-400')}>{p.complaintCount}次</span>
                </div>
                <div className="h-4 bg-warm-50 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', i === 0 ? 'bg-coral-400' : 'bg-warm-300')} style={{ width: `${(p.complaintCount / maxComp) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

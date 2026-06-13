import { useMemo } from 'react'
import { useLabStore } from '@/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, WashingMachine, Wrench, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { differenceInDays } from 'date-fns'

const CLASS_COLORS = ['#0D7377', '#0891B2', '#0EA5E9', '#6366F1', '#8B5CF6', '#A855F7']
const DAMAGE_COLORS = ['#0D7377', '#0891B2', '#0EA5E9', '#6366F1', '#8B5CF6', '#E8590C', '#A855F7']

export default function StatsPage() {
  const { coats, washBatches, washBatchItems, repairRecords, checkOverdue } = useLabStore()

  useMemo(() => { checkOverdue() }, [checkOverdue])

  const totalCoats = coats.length
  const sentCount = coats.filter(c => c.status === 'sent').length
  const pendingRepairCount = repairRecords.filter(r => r.status === 'pending').length

  const classWashData = useMemo(() => {
    const countMap: Record<string, number> = {}
    washBatchItems.forEach(item => {
      const coat = coats.find(c => c.id === item.coatId)
      if (coat) {
        countMap[coat.className] = (countMap[coat.className] || 0) + 1
      }
    })
    return Object.entries(countMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [coats, washBatchItems])

  const damageData = useMemo(() => {
    const countMap: Record<string, number> = {}
    repairRecords.forEach(r => {
      countMap[r.damageLocation] = (countMap[r.damageLocation] || 0) + 1
    })
    return Object.entries(countMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [repairRecords])

  const unreturnedList = useMemo(() => {
    const overdueBatchIds = new Set(
      washBatches.filter(b => b.status === 'sent' || b.status === 'overdue').map(b => b.id)
    )
    const itemsInOverdueBatches = washBatchItems.filter(i => overdueBatchIds.has(i.batchId))

    const results = itemsInOverdueBatches.map(item => {
      const coat = coats.find(c => c.id === item.coatId)
      if (!coat || (coat.status !== 'sent' && coat.status !== 'lost')) return null
      const batch = washBatches.find(b => b.id === item.batchId)
      if (!batch) return null
      const overdueDays = Math.max(0, differenceInDays(new Date(), new Date(batch.expectedReturnDate)))
      return {
        studentName: coat.studentName,
        className: coat.className,
        code: coat.code,
        overdueDays,
      }
    }).filter(Boolean) as { studentName: string; className: string; code: string; overdueDays: number }[]

    return results.sort((a, b) => b.overdueDays - a.overdueDays)
  }, [coats, washBatches, washBatchItems])

  const cards = [
    { label: '总实验服数', value: totalCoats, icon: Users, color: '#0D7377' },
    { label: '送洗中', value: sentCount, icon: WashingMachine, color: '#0891B2' },
    { label: '待维修', value: pendingRepairCount, icon: Wrench, color: '#E8590C' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">统计看板</h1>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: card.color + '15' }}
            >
              <card.icon size={24} style={{ color: card.color }} />
            </div>
            <div>
              <p className="text-sm text-[#6B7280]">{card.label}</p>
              <p className="text-3xl font-bold font-[JetBrains_Mono]" style={{ color: card.color }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">班级送洗次数</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={classWashData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {classWashData.map((_, i) => (
                  <Cell key={i} fill={CLASS_COLORS[i % CLASS_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-800 mb-4">常见破损位置</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={damageData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {damageData.map((_, i) => (
                  <Cell key={i} fill={DAMAGE_COLORS[i % DAMAGE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-[#E8590C]" />
          <h2 className="text-base font-semibold text-gray-800">未归还名单</h2>
        </div>
        {unreturnedList.length === 0 ? (
          <p className="text-sm text-[#6B7280] py-4 text-center">暂无未归还记录</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-[#6B7280]">
                <th className="text-left py-2 font-medium">学生姓名</th>
                <th className="text-left py-2 font-medium">班级</th>
                <th className="text-left py-2 font-medium">编号</th>
                <th className="text-right py-2 font-medium">超时天数</th>
              </tr>
            </thead>
            <tbody>
              {unreturnedList.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    'border-b border-gray-50',
                    row.overdueDays > 0 && 'bg-[#E8590C]',
                  )}
                  style={
                    row.overdueDays > 0
                      ? { backgroundColor: `rgba(232, 89, 12, ${Math.min(row.overdueDays * 0.04, 0.2)})` }
                      : undefined
                  }
                >
                  <td className="py-2.5">{row.studentName}</td>
                  <td className="py-2.5">{row.className}</td>
                  <td className="py-2.5 font-[JetBrains_Mono]">{row.code}</td>
                  <td className="py-2.5 text-right font-[JetBrains_Mono] font-semibold text-[#E8590C]">
                    {row.overdueDays}天
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

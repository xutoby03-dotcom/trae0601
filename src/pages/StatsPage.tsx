import { useMemo } from 'react'
import { useLabStore } from '@/store'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Users, WashingMachine, Wrench, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { differenceInDays } from 'date-fns'
import OverdueAlert from '@/components/OverdueAlert'

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
    const results: { studentName: string; className: string; code: string; overdueDays: number; statusLabel: string; statusType: 'sent' | 'overdue' | 'missing' }[] = []

    const activeBatchIds = new Set(
      washBatches.filter(b => b.status === 'sent' || b.status === 'overdue').map(b => b.id)
    )
    washBatchItems.filter(i => activeBatchIds.has(i.batchId)).forEach(item => {
      const coat = coats.find(c => c.id === item.coatId)
      if (!coat || coat.status !== 'sent') return
      const batch = washBatches.find(b => b.id === item.batchId)
      if (!batch) return
      const overdueDays = Math.max(0, differenceInDays(new Date(), new Date(batch.expectedReturnDate)))
      results.push({
        studentName: coat.studentName,
        className: coat.className,
        code: coat.code,
        overdueDays,
        statusLabel: batch.status === 'overdue' ? '未归还（已超期）' : '未归还（送洗中）',
        statusType: batch.status === 'overdue' ? 'overdue' : 'sent',
      })
    })

    const missingItems = washBatchItems.filter(i => i.returnStatus === 'missing')
    missingItems.forEach(item => {
      const coat = coats.find(c => c.id === item.coatId)
      if (!coat) return
      const batch = washBatches.find(b => b.id === item.batchId)
      if (!batch) return
      const overdueDays = Math.max(1, differenceInDays(new Date(), new Date(batch.expectedReturnDate)))
      results.push({
        studentName: coat.studentName,
        className: coat.className,
        code: coat.code,
        overdueDays,
        statusLabel: '少件未归还',
        statusType: 'missing',
      })
    })

    return results.sort((a, b) => {
      const typeWeight = { missing: 3, overdue: 2, sent: 1 }
      if (typeWeight[b.statusType] !== typeWeight[a.statusType]) {
        return typeWeight[b.statusType] - typeWeight[a.statusType]
      }
      return b.overdueDays - a.overdueDays
    })
  }, [coats, washBatches, washBatchItems])

  const cards = [
    { label: '总实验服数', value: totalCoats, icon: Users, color: '#0D7377' },
    { label: '送洗中', value: sentCount, icon: WashingMachine, color: '#0891B2' },
    { label: '待维修', value: pendingRepairCount, icon: Wrench, color: '#E8590C' },
  ]

  return (
    <div className="min-h-screen bg-[#F7F8FA] p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">统计看板</h1>

      <OverdueAlert />

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
                <th className="text-left py-2 font-medium">状态</th>
                <th className="text-right py-2 font-medium">失联天数</th>
              </tr>
            </thead>
            <tbody>
              {unreturnedList.map((row, i) => {
                const rowColor = row.statusType === 'missing'
                  ? `rgba(239, 68, 68, ${Math.min(row.overdueDays * 0.05, 0.18)})`
                  : row.statusType === 'overdue'
                    ? `rgba(232, 89, 12, ${Math.min(row.overdueDays * 0.04, 0.16)})`
                    : row.overdueDays > 0
                      ? `rgba(232, 89, 12, ${Math.min(row.overdueDays * 0.03, 0.12)})`
                      : undefined
                const statusColor = row.statusType === 'missing'
                  ? { bg: 'bg-red-100', text: 'text-red-700' }
                  : row.statusType === 'overdue'
                    ? { bg: 'bg-orange-100', text: 'text-orange-700' }
                    : { bg: 'bg-yellow-100', text: 'text-yellow-700' }
                const daysColor = row.statusType === 'missing' ? 'text-red-600' : 'text-[#E8590C]'
                return (
                  <tr
                    key={i}
                    className="border-b border-gray-50"
                    style={{ backgroundColor: rowColor }}
                  >
                    <td className="py-2.5 font-medium text-gray-800">{row.studentName}</td>
                    <td className="py-2.5 text-gray-700">{row.className}</td>
                    <td className="py-2.5 font-[JetBrains_Mono] text-gray-800">{row.code}</td>
                    <td className="py-2.5">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', statusColor.bg, statusColor.text)}>
                        {row.statusType === 'missing' && (<AlertTriangle className="w-3 h-3" />)}
                        {row.statusLabel}
                      </span>
                    </td>
                    <td className={cn('py-2.5 text-right font-[JetBrains_Mono] font-semibold', daysColor)}>
                      {row.overdueDays}天
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

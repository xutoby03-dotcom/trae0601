import { useState } from 'react'
import { useGearStore } from '@/store/gearStore'
import { useUsageStore } from '@/store/usageStore'
import { getGearStatus } from '@/utils/statusCalc'
import GearCard from '@/components/GearCard'
import type { GearStatus } from '@/types'

type FilterType = 'all' | 'due_soon' | 'overdue'

export default function Dashboard() {
  const gears = useGearStore((s) => s.gears)
  const usageRecords = useUsageStore((s) => s.records)
  const [filter, setFilter] = useState<FilterType>('all')

  const gearStatuses = gears.map((gear) => ({
    gear,
    status: getGearStatus(gear, usageRecords),
  }))

  const filtered = gearStatuses.filter(({ status }) => {
    if (filter === 'all') return true
    if (filter === 'due_soon') return status === 'due_soon' || status === 'overdue'
    return status === filter
  })

  const counts = {
    good: gearStatuses.filter(({ status }) => status === 'good').length,
    due_soon: gearStatuses.filter(({ status }) => status === 'due_soon').length,
    overdue: gearStatuses.filter(({ status }) => status === 'overdue').length,
    retired: gearStatuses.filter(({ status }) => status === 'retired').length,
  }

  return (
    <div>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold tracking-tight text-[#F5F0EB]">
            我的装备架
          </h1>
          <p className="mt-1 text-sm text-white/30">
            管理你的运动装备，让每一件都在最佳状态
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {counts.good}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            {counts.due_soon}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/30">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            {counts.overdue}
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-2">
        {([
          { key: 'all' as FilterType, label: '全部' },
          { key: 'due_soon' as FilterType, label: '需保养' },
          { key: 'overdue' as FilterType, label: '已超期' },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              filter === key
                ? 'border-[#FF6B35]/40 bg-[#FF6B35]/15 text-[#FF6B35]'
                : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10 hover:text-white/60'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="mb-4 text-5xl">🏋️</div>
          <p className="mb-1 text-lg font-medium text-white/40">
            {gears.length === 0 ? '装备架是空的' : '没有匹配的装备'}
          </p>
          <p className="text-sm text-white/20">
            {gears.length === 0
              ? '点击下方"添加"按钮开始录入你的运动装备'
              : '试试切换其他筛选条件'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(({ gear, status }) => (
            <GearCard
              key={gear.id}
              gear={gear}
              status={status}
              usageRecords={usageRecords}
            />
          ))}
        </div>
      )}
    </div>
  )
}

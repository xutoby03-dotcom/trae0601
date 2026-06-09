import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Save, UtensilsCrossed } from 'lucide-react'
import { useStore } from '@/store'
import type { MealRecord } from '@/types'
import { formatDate, getDayName } from '@/utils'
import { cn } from '@/lib/utils'

type Status = MealRecord['status']
type Leftover = MealRecord['leftoverLevel']

const STATUS_OPTIONS: { value: Status; label: string; color: string; bg: string }[] = [
  { value: 'eaten', label: '吃了', color: 'border-green-500 text-green-700', bg: 'bg-green-500 text-white' },
  { value: 'skipped', label: '没吃', color: 'border-gray-400 text-gray-600', bg: 'bg-gray-400 text-white' },
  { value: 'late', label: '迟到', color: 'border-yellow-500 text-yellow-700', bg: 'bg-yellow-500 text-white' },
]

const LEFTOVER_OPTIONS: { value: Leftover; label: string; color: string; bg: string }[] = [
  { value: 'none', label: '光盘', color: 'border-green-500 text-green-700', bg: 'bg-green-500 text-white' },
  { value: 'little', label: '剩一点', color: 'border-yellow-500 text-yellow-700', bg: 'bg-yellow-500 text-white' },
  { value: 'much', label: '剩很多', color: 'border-red-500 text-red-700', bg: 'bg-red-500 text-white' },
]

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0]
}

export default function Records() {
  const [selectedDate, setSelectedDate] = useState(toDateStr(new Date()))
  const [edits, setEdits] = useState<Record<string, { status: Status; leftoverLevel: Leftover; notes: string }>>({})

  const { members, recipes, dayPlans, mealRecords, addMealRecord, updateMealRecord } = useStore()

  const dayPlan = dayPlans.find((p) => p.date === selectedDate)
  const plannedRecipes = useMemo(
    () => (dayPlan ? dayPlan.recipeIds.map((id) => recipes.find((r) => r.id === id)).filter(Boolean) : []),
    [dayPlan, recipes]
  )

  const existingRecords = useMemo(
    () => mealRecords.filter((r) => r.date === selectedDate),
    [mealRecords, selectedDate]
  )

  function getEdit(memberId: string) {
    if (edits[memberId]) return edits[memberId]
    const existing = existingRecords.find((r) => r.memberId === memberId)
    return {
      status: existing?.status ?? 'eaten',
      leftoverLevel: existing?.leftoverLevel ?? 'none',
      notes: existing?.notes ?? '',
    }
  }

  function setField(memberId: string, field: string, value: string) {
    setEdits((prev) => ({
      ...prev,
      [memberId]: { ...getEdit(memberId), [field]: value },
    }))
  }

  function shiftDate(days: number) {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    setSelectedDate(toDateStr(d))
    setEdits({})
  }

  function handleSave() {
    members.forEach((member) => {
      const edit = getEdit(member.id)
      const existing = existingRecords.find((r) => r.memberId === member.id)
      if (existing) {
        updateMealRecord(existing.id, edit)
      } else {
        addMealRecord({ date: selectedDate, memberId: member.id, ...edit })
      }
    })
    setEdits({})
  }

  const past7 = useMemo(() => {
    const result: { date: string; records: MealRecord[] }[] = []
    const today = new Date()
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = toDateStr(d)
      const recs = mealRecords.filter((r) => r.date === dateStr)
      if (recs.length > 0) result.push({ date: dateStr, records: recs })
    }
    return result
  }, [mealRecords])

  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 bg-[#F97316] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <button onClick={() => shiftDate(-1)} className="p-1 rounded-full hover:bg-orange-600 transition">
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold">{formatDate(selectedDate)}</div>
          <div className="text-xs opacity-80">{getDayName(selectedDate)}</div>
        </div>
        <button onClick={() => shiftDate(1)} className="p-1 rounded-full hover:bg-orange-600 transition">
          <ChevronRight size={22} />
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {plannedRecipes.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2 text-[#78350F] font-semibold text-sm">
              <UtensilsCrossed size={16} />
              <span>今日早餐</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {plannedRecipes.map((recipe) => (
                <span
                  key={recipe!.id}
                  className="bg-orange-50 border border-orange-200 rounded-full px-3 py-1 text-sm text-[#78350F]"
                >
                  {recipe!.icon} {recipe!.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {members.map((member) => {
            const edit = getEdit(member.id)
            return (
              <div key={member.id} className="bg-white rounded-2xl shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{member.avatar}</span>
                  <span className="font-semibold text-[#78350F]">{member.name}</span>
                </div>

                <div className="mb-2">
                  <div className="text-xs text-[#78350F]/60 mb-1">用餐状态</div>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setField(member.id, 'status', opt.value)}
                        className={cn(
                          'rounded-full border-2 px-3 py-1 text-xs font-medium transition',
                          edit.status === opt.value ? opt.bg : opt.color
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-xs text-[#78350F]/60 mb-1">剩余程度</div>
                  <div className="flex gap-2">
                    {LEFTOVER_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setField(member.id, 'leftoverLevel', opt.value)}
                        className={cn(
                          'rounded-full border-2 px-3 py-1 text-xs font-medium transition',
                          edit.leftoverLevel === opt.value ? opt.bg : opt.color
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="text"
                  value={edit.notes}
                  onChange={(e) => setField(member.id, 'notes', e.target.value)}
                  placeholder="备注..."
                  className="w-full rounded-lg border border-orange-200 bg-orange-50/50 px-3 py-1.5 text-xs text-[#78350F] placeholder:text-[#78350F]/40 focus:outline-none focus:border-[#F97316]"
                />
              </div>
            )
          })}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl py-3 font-semibold flex items-center justify-center gap-2 shadow-md transition"
        >
          <Save size={18} />
          保存记录
        </button>

        {past7.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="text-sm font-semibold text-[#78350F] mb-3">过去7天记录</div>
            <div className="space-y-2">
              {past7.map(({ date, records }) => (
                <div key={date} className="flex items-center gap-3 text-xs">
                  <span className="text-[#78350F]/60 w-16 shrink-0">
                    {formatDate(date)} {getDayName(date)}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {records.map((r) => {
                      const m = members.find((mem) => mem.id === r.memberId)
                      const statusLabel = STATUS_OPTIONS.find((o) => o.value === r.status)?.label
                      return (
                        <span key={r.id} className="bg-orange-50 rounded-full px-2 py-0.5 text-[#78350F]">
                          {m?.avatar} {statusLabel}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

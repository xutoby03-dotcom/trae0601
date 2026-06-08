import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { DISEASE_TYPE_LABELS, TASK_TYPE_LABELS } from '@/types'
import type { DiseaseType } from '@/types'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, getDay,
  addMonths, subMonths, isSameDay, isToday, parseISO, isBefore,
  differenceInDays,
} from 'date-fns'
import {
  ChevronLeft, ChevronRight, AlertTriangle, Stethoscope,
  TestTube2, Pill, Syringe, Activity,
} from 'lucide-react'

const DOT_COLORS = { followUp: '#E8725A', check: '#D69E2E', task: '#718096' }

const HEALTH_REMINDERS: Record<DiseaseType, { label: string; Icon: typeof Activity }> = {
  hypertension: { label: '血压测量', Icon: Activity },
  diabetes: { label: '血糖检测', Icon: TestTube2 },
  heartDisease: { label: '心率监测', Icon: Syringe },
  other: { label: '健康检查', Icon: Activity },
}

interface TaskItem {
  type: 'followUp' | 'check' | 'task' | 'health'
  label: string
  sub: string
  color: string
  Icon: typeof Activity
}

function WarningBanner({ warnings }: { warnings: { elderName: string; name: string; dates: string[] }[] }) {
  if (warnings.length === 0) return null
  return (
    <>
      {warnings.map((w, i) => (
        <div
          key={i}
          className="animate-pulse-warning bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold text-red-700">{w.elderName}</span>
            <span className="text-red-600"> 的 </span>
            <span className="font-semibold text-red-700">{w.name}</span>
            <span className="text-red-600"> 连续{w.dates.length}天异常</span>
            <span className="text-red-400 text-xs ml-2">
              （{w.dates.slice(-3).map((d) => format(parseISO(d), 'M/d')).join(', ')}）
            </span>
          </div>
        </div>
      ))}
    </>
  )
}

function CalendarGrid({
  currentMonth, selectedDate, onSelectDate, onChangeMonth, dayEvents,
}: {
  currentMonth: Date
  selectedDate: Date
  onSelectDate: (d: Date) => void
  onChangeMonth: (d: Date) => void
  dayEvents: Map<string, { followUp: boolean; check: boolean; task: boolean }>
}) {
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    const monthDays = eachDayOfInterval({ start, end })
    const pad: (Date | null)[] = Array(getDay(start)).fill(null)
    return [...pad, ...monthDays]
  }, [currentMonth])

  return (
    <div className="bg-[#FDF6EC] rounded-2xl p-5 shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onChangeMonth(subMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition"
        >
          <ChevronLeft className="w-5 h-5 text-stone-500" />
        </button>
        <h2 className="text-lg font-semibold text-[#2D3748]">
          {format(currentMonth, 'yyyy年M月')}
        </h2>
        <button
          onClick={() => onChangeMonth(addMonths(currentMonth, 1))}
          className="p-1.5 rounded-lg hover:bg-stone-100 transition"
        >
          <ChevronRight className="w-5 h-5 text-stone-500" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-px">
        {['日', '一', '二', '三', '四', '五', '六'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-stone-400 pb-2">
            {d}
          </div>
        ))}
        {days.map((day, i) => {
          if (!day) return <div key={`p-${i}`} className="h-14" />
          const key = format(day, 'yyyy-MM-dd')
          const events = dayEvents.get(key)
          const today = isToday(day)
          const selected = isSameDay(day, selectedDate)
          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={`h-14 flex flex-col items-center justify-center rounded-lg transition
                ${selected ? 'ring-2 ring-[#E8725A]' : ''}
                ${today ? 'bg-[#E8725A] text-white' : 'hover:bg-stone-50'}`}
            >
              <span
                className={`text-sm ${today ? 'font-bold' : 'font-medium'}
                  ${!today && selected ? 'text-[#E8725A]' : ''}`}
              >
                {format(day, 'd')}
              </span>
              {events && (
                <div className="flex gap-0.5 mt-0.5">
                  {events.followUp && (
                    <span className="w-1 h-1 rounded-full" style={{ background: DOT_COLORS.followUp }} />
                  )}
                  {events.check && (
                    <span className="w-1 h-1 rounded-full" style={{ background: DOT_COLORS.check }} />
                  )}
                  {events.task && (
                    <span className="w-1 h-1 rounded-full" style={{ background: DOT_COLORS.task }} />
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TaskList({ tasks, date }: { tasks: TaskItem[]; date: Date }) {
  return (
    <div className="bg-[#FDF6EC] rounded-2xl p-5 shadow-sm border border-stone-100">
      <h2 className="text-lg font-semibold text-[#2D3748] mb-4">
        {isToday(date) ? '今日' : format(date, 'M月d日')}任务
      </h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-stone-400 text-center py-6">暂无任务</p>
      ) : (
        <div className="space-y-3">
          {tasks.map((t, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border-l-[3px]"
              style={{ borderLeftColor: t.color }}
            >
              <t.Icon className="w-4 h-4 shrink-0" style={{ color: t.color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2D3748] truncate">{t.label}</p>
                <p className="text-xs text-stone-500 truncate">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { elders, chronicDiseases, checkItems, followUpRecords, healthIndicators, familyTasks } =
    useStore()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const warnings = useMemo(() => {
    const result: { elderName: string; name: string; dates: string[] }[] = []
    const groups: Record<string, typeof healthIndicators> = {}
    for (const ind of healthIndicators.filter((h) => h.isAbnormal)) {
      const key = `${ind.diseaseId}-${ind.name}`
      ;(groups[key] ??= []).push(ind)
    }
    for (const items of Object.values(groups)) {
      if (items.length < 3) continue
      const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date))
      let best = [sorted[0]], cur = [sorted[0]]
      for (let i = 1; i < sorted.length; i++) {
        if (differenceInDays(parseISO(sorted[i].date), parseISO(sorted[i - 1].date)) === 1) {
          cur.push(sorted[i])
        } else {
          if (cur.length > best.length) best = cur
          cur = [sorted[i]]
        }
      }
      if (cur.length > best.length) best = cur
      if (best.length >= 3) {
        const disease = chronicDiseases.find((d) => d.id === best[0].diseaseId)
        const elder = elders.find((e) => e.id === disease?.elderId)
        result.push({
          elderName: elder?.name ?? '未知',
          name: best[0].name,
          dates: best.map((s) => s.date),
        })
      }
    }
    return result
  }, [healthIndicators, chronicDiseases, elders])

  const dayEvents = useMemo(() => {
    const map = new Map<string, { followUp: boolean; check: boolean; task: boolean }>()
    for (const r of followUpRecords) {
      if (!r.nextDate) continue
      const e = map.get(r.nextDate) ?? { followUp: false, check: false, task: false }
      e.followUp = true
      map.set(r.nextDate, e)
    }
    for (const t of familyTasks) {
      const e = map.get(t.dueDate) ?? { followUp: false, check: false, task: false }
      e.task = true
      map.set(t.dueDate, e)
    }
    for (const item of checkItems) {
      const cycleDays = parseInt(item.cycle) || 30
      const records = followUpRecords.filter((r) => r.diseaseId === item.diseaseId)
      if (records.length === 0) continue
      const latest = records.sort((a, b) => b.date.localeCompare(a.date))[0]
      const baseDate = latest.nextDate ? parseISO(latest.nextDate) : parseISO(latest.date)
      baseDate.setDate(baseDate.getDate() + cycleDays)
      const key = format(baseDate, 'yyyy-MM-dd')
      const e = map.get(key) ?? { followUp: false, check: false, task: false }
      e.check = true
      map.set(key, e)
    }
    return map
  }, [followUpRecords, familyTasks, checkItems])

  const selectedTasks = useMemo(() => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd')
    const tasks: TaskItem[] = []

    for (const r of followUpRecords.filter((r) => r.nextDate === dateStr)) {
      const disease = chronicDiseases.find((d) => d.id === r.diseaseId)
      const elder = elders.find((e) => e.id === disease?.elderId)
      tasks.push({
        type: 'followUp',
        label: '复诊提醒',
        sub: `${elder?.name ?? ''} - ${disease ? DISEASE_TYPE_LABELS[disease.type] : ''}复诊`,
        color: '#E8725A',
        Icon: Stethoscope,
      })
    }

    for (const item of checkItems) {
      const cycleDays = parseInt(item.cycle) || 30
      const records = followUpRecords.filter((r) => r.diseaseId === item.diseaseId)
      if (records.length === 0) continue
      const latest = records.sort((a, b) => b.date.localeCompare(a.date))[0]
      const baseDate = latest.nextDate ? parseISO(latest.nextDate) : parseISO(latest.date)
      baseDate.setDate(baseDate.getDate() + cycleDays)
      const dueStr = format(baseDate, 'yyyy-MM-dd')
      if (dueStr === dateStr || (isToday(selectedDate) && isBefore(baseDate, selectedDate))) {
        const disease = chronicDiseases.find((d) => d.id === item.diseaseId)
        const elder = elders.find((e) => e.id === disease?.elderId)
        tasks.push({
          type: 'check',
          label: item.name,
          sub: `${elder?.name ?? ''} - ${disease ? DISEASE_TYPE_LABELS[disease.type] : ''}检查`,
          color: '#D69E2E',
          Icon: TestTube2,
        })
      }
    }

    for (const t of familyTasks.filter((t) => t.dueDate === dateStr)) {
      const elder = elders.find((e) => e.id === t.elderId)
      tasks.push({
        type: 'task',
        label: TASK_TYPE_LABELS[t.type],
        sub: `${elder?.name ?? ''} - ${t.description}（${t.assignee}）`,
        color: '#718096',
        Icon: Pill,
      })
    }

    const seen = new Set<string>()
    for (const disease of chronicDiseases) {
      const key = `${disease.elderId}-${disease.type}`
      if (seen.has(key)) continue
      seen.add(key)
      const elder = elders.find((e) => e.id === disease.elderId)
      const reminder = HEALTH_REMINDERS[disease.type]
      tasks.push({
        type: 'health',
        label: reminder.label,
        sub: `${elder?.name ?? ''} - ${DISEASE_TYPE_LABELS[disease.type]}`,
        color: '#48BB78',
        Icon: reminder.Icon,
      })
    }

    return tasks
  }, [selectedDate, followUpRecords, checkItems, familyTasks, chronicDiseases, elders])

  return (
    <div className="space-y-6">
      <WarningBanner warnings={warnings} />
      <CalendarGrid
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        onChangeMonth={setCurrentMonth}
        dayEvents={dayEvents}
      />
      <TaskList tasks={selectedTasks} date={selectedDate} />
    </div>
  )
}

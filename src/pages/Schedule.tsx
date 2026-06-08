import { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'
import { format, addDays, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { usePetStore } from '@/store/usePetStore'
import {
  TASK_TYPE_LABELS,
  TIME_SLOT_LABELS,
  TASK_TYPE_BORDER_COLORS,
  TASK_TYPE_COLORS,
  TimeSlot,
} from '@/types'

const PET_TYPE_EMOJI: Record<string, string> = {
  cat: '🐱',
  dog: '🐶',
}

const TIME_SLOT_ORDER: TimeSlot[] = ['morning', 'noon', 'evening', 'night']

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const dateDisplay = format(currentDate, 'M月d日 EEEE', { locale: zhCN })

  const {
    pets,
    members,
    fosterModeActive,
    generateTasksForDate,
    getTasksForDate,
    getOverdueTasks,
    taskAssignments,
    assignTask,
    completeTask,
    uncompleteTask,
  } = usePetStore()

  useEffect(() => {
    generateTasksForDate(dateStr)
  }, [dateStr, generateTasksForDate])

  const tasks = getTasksForDate(dateStr)
  const overdueIds = useMemo(() => new Set(getOverdueTasks(dateStr).map((t) => t.id)), [dateStr, getOverdueTasks])

  const grouped = useMemo(() => {
    const map: Record<TimeSlot, typeof tasks> = {
      morning: [],
      noon: [],
      evening: [],
      night: [],
    }
    for (const task of tasks) {
      map[task.timeSlot].push(task)
    }
    return map
  }, [tasks])

  const getAssignment = (taskInstanceId: string) =>
    taskAssignments.find((a) => a.taskInstanceId === taskInstanceId)

  const getPet = (petId: string) => pets.find((p) => p.id === petId)

  const getMember = (memberId: string) => members.find((m) => m.id === memberId)

  const goToday = () => setCurrentDate(new Date())
  const goPrev = () => setCurrentDate((d) => subDays(d, 1))
  const goNext = () => setCurrentDate((d) => addDays(d, 1))

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="min-h-screen bg-stone-50 pb-8">
      {fosterModeActive && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-amber-100 text-amber-800 text-center py-2.5 px-4 text-sm font-semibold border-b border-amber-200"
        >
          托管模式已开启
        </motion.div>
      )}

      <div className="px-4 pt-6">
        <h1 className="font-display text-2xl font-extrabold text-stone-800 mb-4">日程排班</h1>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={goPrev}
            className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronLeft size={18} className="text-stone-600" />
          </button>
          <span className="font-display font-bold text-lg text-stone-800 min-w-[140px] text-center">
            {dateDisplay}
          </span>
          <button
            onClick={goNext}
            className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
          >
            <ChevronRight size={18} className="text-stone-600" />
          </button>
          <button
            onClick={goToday}
            className="ml-1 text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            今天
          </button>
        </div>

        <div className="space-y-5">
          {TIME_SLOT_ORDER.map((slot) => {
            const slotTasks = grouped[slot]
            if (!slotTasks || slotTasks.length === 0) return null

            return (
              <div key={slot}>
                <h2 className="font-display font-bold text-stone-500 text-sm uppercase tracking-wider mb-2.5">
                  {TIME_SLOT_LABELS[slot]}
                </h2>
                <div className="space-y-2.5">
                  {slotTasks.map((task) => {
                    const pet = getPet(task.petId)
                    const assignment = getAssignment(task.id)
                    const member = assignment ? getMember(assignment.memberId) : undefined
                    const isOverdue = overdueIds.has(task.id)
                    const isCompleted = task.completed

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`
                          bg-white rounded-xl border border-stone-100 shadow-sm
                          border-l-4 ${TASK_TYPE_BORDER_COLORS[task.taskType]}
                          ${isOverdue ? 'animate-pulse-border border-red-400' : ''}
                          ${isCompleted ? 'opacity-60' : ''}
                          p-3.5 flex items-center gap-3 transition-shadow hover:shadow-md
                        `}
                      >
                        <div className={`w-2 h-8 rounded-full ${TASK_TYPE_COLORS[task.taskType]} flex-shrink-0`} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`
                                text-sm font-semibold
                                ${isCompleted ? 'line-through text-stone-400' : 'text-stone-700'}
                              `}
                            >
                              {TASK_TYPE_LABELS[task.taskType]}
                            </span>
                            {pet && (
                              <span className={`text-sm ${isCompleted ? 'line-through text-stone-400' : 'text-stone-600'}`}>
                                {PET_TYPE_EMOJI[pet.type]} {pet.name}
                              </span>
                            )}
                          </div>
                        </div>

                        {isOverdue && (
                          <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
                        )}

                        <div className="relative flex-shrink-0" ref={openMenuId === task.id ? menuRef : undefined}>
                          {member ? (
                            <div
                              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: member.color }}
                              title={member.name}
                            >
                              {member.name.charAt(0)}
                            </div>
                          ) : (
                            <button
                              onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
                              className="text-xs font-semibold text-orange-500 bg-orange-50 border border-orange-200 rounded-lg px-2.5 py-1 hover:bg-orange-100 transition-colors"
                            >
                              认领
                            </button>
                          )}
                          <AnimatePresence>
                            {openMenuId === task.id && members.length > 0 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-stone-150 py-1.5 z-20 min-w-[120px]"
                              >
                                {members.map((m) => (
                                  <button
                                    key={m.id}
                                    onClick={() => {
                                      assignTask(task.id, m.id)
                                      setOpenMenuId(null)
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors"
                                  >
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                                      style={{ backgroundColor: m.color }}
                                    >
                                      {m.name.charAt(0)}
                                    </div>
                                    {m.name}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <button
                          onClick={() => (isCompleted ? uncompleteTask(task.id) : completeTask(task.id))}
                          className="flex-shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={22} className="text-emerald-500" />
                          ) : (
                            <Circle size={22} className="text-stone-300 hover:text-stone-400 transition-colors" />
                          )}
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg font-display font-bold">暂无任务</p>
            <p className="text-sm mt-1">请先添加宠物以生成日程任务</p>
          </div>
        )}
      </div>
    </div>
  )
}

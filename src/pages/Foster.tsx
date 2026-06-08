import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, ChevronDown, AlertCircle, PawPrint } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { usePetStore } from '@/store/usePetStore'
import {
  TASK_TYPE_LABELS,
  TIME_SLOT_LABELS,
  TASK_TYPE_BORDER_COLORS,
  TimeSlot,
} from '@/types'

const TIME_SLOT_ORDER: TimeSlot[] = ['morning', 'noon', 'evening', 'night']

export default function Foster() {
  const { token } = useParams<{ token: string }>()
  const [expandedPet, setExpandedPet] = useState<string | null>(null)

  const {
    pets,
    fosterSessions,
    generateTasksForDate,
    getTasksForDate,
    completeTask,
    uncompleteTask,
    setFosterMode,
  } = usePetStore()

  const session = fosterSessions.find((s) => s.token === token)

  useEffect(() => {
    if (session && session.active) {
      setFosterMode(true, token ?? null)
    }
    return () => {
      setFosterMode(false, null)
    }
  }, [token, session, setFosterMode])

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  useEffect(() => {
    if (session && session.active) {
      generateTasksForDate(todayStr)
    }
  }, [todayStr, session, generateTasksForDate])

  const assignedPets = useMemo(() => {
    if (!session) return []
    return pets.filter((p) => session.assignedPetIds.includes(p.id))
  }, [session, pets])

  const allTasks = getTasksForDate(todayStr)

  const filteredTasks = useMemo(() => {
    if (!session) return []
    return allTasks.filter((t) => session.assignedPetIds.includes(t.petId))
  }, [allTasks, session])

  const grouped = useMemo(() => {
    const map: Record<TimeSlot, typeof filteredTasks> = {
      morning: [],
      noon: [],
      evening: [],
      night: [],
    }
    for (const task of filteredTasks) {
      map[task.timeSlot].push(task)
    }
    return map
  }, [filteredTasks])

  const getPet = (petId: string) => pets.find((p) => p.id === petId)

  const remainingDays = session ? differenceInDays(new Date(session.endDate), new Date()) : 0

  if (!session) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full border border-amber-100"
        >
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-extrabold text-stone-800 mb-2">未找到托管会话</h2>
          <p className="text-stone-500 text-sm">请确认链接是否正确</p>
        </motion.div>
      </div>
    )
  }

  if (!session.active) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full border border-amber-100"
        >
          <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="font-display text-xl font-extrabold text-stone-800 mb-2">托管已结束</h2>
          <p className="text-stone-500 text-sm">此托管链接已失效</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-amber-50 pb-8">
      <div className="bg-gradient-to-br from-amber-400 to-orange-400 px-5 pt-10 pb-6 rounded-b-3xl shadow-md">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="font-display text-2xl font-extrabold text-white mb-1">
            🐾 临时托管清单
          </h1>
          <p className="text-amber-100 text-sm font-medium">
            托管人: {session.fosterPersonName}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2.5 flex items-center justify-between"
        >
          <span className="text-white/90 text-sm font-medium">
            {format(new Date(session.startDate), 'M/d')} - {format(new Date(session.endDate), 'M/d')}
          </span>
          <span className={`text-sm font-bold ${remainingDays <= 1 ? 'text-red-100' : 'text-white'}`}>
            {remainingDays > 0 ? `剩余 ${remainingDays} 天` : '最后一天'}
          </span>
        </motion.div>
      </div>

      <div className="px-4 pt-5">
        <div className="space-y-5">
          {TIME_SLOT_ORDER.map((slot) => {
            const slotTasks = grouped[slot]
            if (!slotTasks || slotTasks.length === 0) return null

            return (
              <div key={slot}>
                <h2 className="font-display font-bold text-amber-700 text-sm uppercase tracking-wider mb-2.5">
                  {TIME_SLOT_LABELS[slot]}
                </h2>
                <div className="space-y-2">
                  {slotTasks.map((task) => {
                    const pet = getPet(task.petId)
                    const isCompleted = task.completed

                    return (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`
                          bg-white rounded-xl border border-amber-100 shadow-sm
                          border-l-4 ${TASK_TYPE_BORDER_COLORS[task.taskType]}
                          ${isCompleted ? 'opacity-60' : ''}
                          p-3 flex items-center gap-3 transition-shadow hover:shadow-md
                        `}
                      >
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
                              <span className={`text-sm ${isCompleted ? 'line-through text-stone-400' : 'text-stone-500'}`}>
                                {pet.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => (isCompleted ? uncompleteTask(task.id) : completeTask(task.id))}
                          className="flex-shrink-0"
                        >
                          {isCompleted ? (
                            <CheckCircle2 size={22} className="text-emerald-500" />
                          ) : (
                            <Circle size={22} className="text-amber-300 hover:text-amber-400 transition-colors" />
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

        {filteredTasks.length === 0 && (
          <div className="text-center py-16 text-amber-400">
            <PawPrint size={40} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg font-display font-bold">暂无任务</p>
            <p className="text-sm mt-1">今天没有需要处理的任务</p>
          </div>
        )}

        <div className="mt-8">
          <h2 className="font-display font-bold text-amber-700 text-sm uppercase tracking-wider mb-3">
            宠物信息
          </h2>
          <div className="space-y-2">
            {assignedPets.map((pet) => {
              const isExpanded = expandedPet === pet.id
              const hasInfo = pet.restrictions || pet.medications || pet.specialHabits

              return (
                <motion.div
                  key={pet.id}
                  layout
                  className="bg-white rounded-xl border border-amber-100 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedPet(isExpanded ? null : pet.id)}
                    className="w-full flex items-center justify-between px-4 py-3"
                  >
                    <span className="font-semibold text-stone-700 text-sm">
                      {pet.type === 'cat' ? '🐱' : '🐶'} {pet.name}
                    </span>
                    {hasInfo && (
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} className="text-amber-400" />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && hasInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-3 space-y-2">
                          {pet.restrictions && (
                            <div className="text-sm">
                              <span className="font-semibold text-amber-600">饮食限制: </span>
                              <span className="text-stone-600">{pet.restrictions}</span>
                            </div>
                          )}
                          {pet.medications && (
                            <div className="text-sm">
                              <span className="font-semibold text-amber-600">用药情况: </span>
                              <span className="text-stone-600">{pet.medications}</span>
                            </div>
                          )}
                          {pet.specialHabits && (
                            <div className="text-sm">
                              <span className="font-semibold text-amber-600">特殊习惯: </span>
                              <span className="text-stone-600">{pet.specialHabits}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

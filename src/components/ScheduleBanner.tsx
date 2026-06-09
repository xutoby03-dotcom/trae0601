import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle } from 'lucide-react'
import { useScheduleStore } from '../stores/useScheduleStore'
import { categoryConfig } from '../utils/category'
import { getDayLabel, getCurrentDayOfWeek } from '../utils/time'

export default function ScheduleBanner() {
  const { schedules } = useScheduleStore()
  const today = getCurrentDayOfWeek()

  const todaySchedules = useMemo(
    () => schedules.filter((s) => s.dayOfWeek === today && s.enabled),
    [schedules, today]
  )

  const nextOpen = useMemo(() => {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    for (const s of todaySchedules) {
      const [h, m] = s.openTime.split(':').map(Number)
      const openMinutes = h * 60 + m
      if (openMinutes > currentMinutes) {
        const diff = openMinutes - currentMinutes
        const hours = Math.floor(diff / 60)
        const mins = diff % 60
        return {
          schedule: s,
          timeLabel: hours > 0 ? `${hours}小时${mins}分钟后` : `${mins}分钟后`,
          isOpen: false,
        }
      }
      const [ch, cm] = s.closeTime.split(':').map(Number)
      const closeMinutes = ch * 60 + cm
      if (currentMinutes <= closeMinutes) {
        const diff = closeMinutes - currentMinutes
        const hours = Math.floor(diff / 60)
        const mins = diff % 60
        return {
          schedule: s,
          timeLabel: hours > 0 ? `${hours}小时${mins}分钟后关闭` : `${mins}分钟后关闭`,
          isOpen: true,
        }
      }
    }
    return null
  }, [todaySchedules])

  if (todaySchedules.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">{getDayLabel(today)}垃圾房时间</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {todaySchedules.map((s, i) => {
            const config = categoryConfig[s.category]
            return (
              <span key={i} className="inline-flex items-center gap-1 bg-white/20 rounded-lg px-2 py-1 text-xs">
                <span>{config.emoji}</span>
                <span>{s.openTime}-{s.closeTime}</span>
              </span>
            )
          })}
        </div>
        {nextOpen && (
          <div className="mt-3 flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <AlertCircle className="w-4 h-4" />
            </motion.div>
            <span className="text-sm">
              {nextOpen.isOpen ? (
                <>
                  <span className="font-bold">{categoryConfig[nextOpen.schedule.category].emoji} {categoryConfig[nextOpen.schedule.category].label}</span>
                  {' '}投放中，{nextOpen.timeLabel}
                </>
              ) : (
                <>
                  下次开放{nextOpen.timeLabel}（{categoryConfig[nextOpen.schedule.category].emoji} {categoryConfig[nextOpen.schedule.category].label}）
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

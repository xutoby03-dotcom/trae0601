import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Recycle, Users, Settings, Plus, Trash2, Clock } from 'lucide-react'
import { useGarbageStore } from '../stores/useGarbageStore'
import { useFamilyStore } from '../stores/useFamilyStore'
import { useScheduleStore } from '../stores/useScheduleStore'
import StatRing from '../components/StatRing'
import MemberRank from '../components/MemberRank'
import { categoryConfig } from '../utils/category'
import { isCurrentWeek, getDayLabel } from '../utils/time'
import type { GarbageCategory, GarbageRoomSchedule } from '../types'

export default function Stats() {
  const { records } = useGarbageStore()
  const { members } = useFamilyStore()
  const { schedules, addSchedule, removeSchedule, toggleSchedule } = useScheduleStore()
  const [showScheduleSettings, setShowScheduleSettings] = useState(false)

  const weekRecords = useMemo(
    () => records.filter((r) => isCurrentWeek(r.createdAt)),
    [records]
  )

  const weekMistakes = useMemo(
    () => weekRecords.filter((r) => !r.isCorrect),
    [weekRecords]
  )

  const recyclableTotal = useMemo(
    () => records.filter((r) => r.category === 'recyclable' && !r.disposed).length,
    [records]
  )

  const recyclableCount = useMemo(
    () =>
      records
        .filter((r) => r.category === 'recyclable' && !r.disposed)
        .reduce((acc, r) => {
          acc[r.name] = (acc[r.name] || 0) + 1
          return acc
        }, {} as Record<string, number>),
    [records]
  )

  const correctRate = useMemo(() => {
    if (weekRecords.length === 0) return 100
    const correct = weekRecords.filter((r) => r.isCorrect).length
    return Math.round((correct / weekRecords.length) * 100)
  }, [weekRecords])

  const memberStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number; kitchenMissed: number; mistakes: number }> = {}
    members.forEach((m) => {
      stats[m.id] = { total: 0, correct: 0, kitchenMissed: 0, mistakes: 0 }
    })
    weekRecords.forEach((r) => {
      if (!stats[r.memberId]) {
        stats[r.memberId] = { total: 0, correct: 0, kitchenMissed: 0, mistakes: 0 }
      }
      stats[r.memberId].total++
      if (r.isCorrect) stats[r.memberId].correct++
      if (!r.isCorrect) stats[r.memberId].mistakes++
      if (r.category === 'kitchen' && r.binType !== 'kitchen') {
        stats[r.memberId].kitchenMissed++
      }
    })

    return stats
  }, [weekRecords, members])

  const mostForgetful = useMemo(() => {
    let maxMissed = 0
    let memberId = ''
    Object.entries(memberStats).forEach(([id, s]) => {
      if (s.kitchenMissed > maxMissed) {
        maxMissed = s.kitchenMissed
        memberId = id
      }
    })
    return members.find((m) => m.id === memberId)
  }, [memberStats, members])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50/50 to-stone-50 pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-stone-800">📊 本周统计</h1>
          <p className="text-sm text-stone-400 mt-1">看看这周分类表现如何</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <span className="text-3xl font-bold text-red-500">{weekMistakes.length}</span>
            <p className="text-xs text-stone-400 mt-1">分错次数</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <span className="text-3xl font-bold text-sky-600">{recyclableTotal}</span>
            <p className="text-xs text-stone-400 mt-1">可回收积攒</p>
          </div>
          <div className="bg-white rounded-2xl border border-stone-200 p-4 text-center">
            <span className="text-2xl">{mostForgetful?.avatar || '🤷'}</span>
            <p className="text-xs text-stone-400 mt-1">常忘扔厨余</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-stone-200 p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-700">分类正确率</h2>
          </div>
          <div className="flex justify-center">
            <StatRing percentage={correctRate} label="本周正确率" color="#2D6A4F" />
          </div>
        </motion.div>

        {Object.keys(recyclableCount).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-stone-200 p-5 mb-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Recycle className="w-4 h-4 text-sky-600" />
              <h2 className="text-base font-bold text-stone-700">可回收积攒详情</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(recyclableCount).map(([name, count], i) => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-center"
                >
                  <span className="text-xs font-medium text-sky-700">{name}</span>
                  <div className="text-xl font-bold text-sky-600">{count}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-stone-200 p-5 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-stone-700">家庭排行</h2>
          </div>
          <MemberRank members={members} stats={memberStats} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl border border-stone-200 p-5 mb-6"
        >
          <button
            onClick={() => setShowScheduleSettings(!showScheduleSettings)}
            className="flex items-center gap-2 w-full"
          >
            <Settings className="w-4 h-4 text-stone-500" />
            <h2 className="text-base font-bold text-stone-700 flex-1 text-left">垃圾房开放时间</h2>
            <span className="text-xs text-stone-400">
              {showScheduleSettings ? '收起' : '设置'}
            </span>
          </button>

          {showScheduleSettings && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 space-y-2"
            >
              {schedules.map((s) => {
                const config = categoryConfig[s.category]
                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2 p-3 rounded-xl border ${
                      s.enabled ? `${config.bgColor} ${config.borderColor}` : 'bg-stone-50 border-stone-200 opacity-50'
                    }`}
                  >
                    <button
                      onClick={() => toggleSchedule(s.id)}
                      className={`w-8 h-5 rounded-full transition-colors ${
                        s.enabled ? 'bg-emerald-500' : 'bg-stone-300'
                      } relative`}
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          s.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-medium text-stone-600 w-8">
                      {getDayLabel(s.dayOfWeek)}
                    </span>
                    <span className="text-xs text-stone-500">
                      {s.openTime}-{s.closeTime}
                    </span>
                    <span className={`text-xs ${config.color}`}>
                      {config.emoji} {config.label}
                    </span>
                    <button
                      onClick={() => removeSchedule(s.id)}
                      className="ml-auto p-1 text-stone-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}

              <AddScheduleForm onAdd={addSchedule} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function AddScheduleForm({ onAdd }: { onAdd: (s: GarbageRoomSchedule) => void }) {
  const [day, setDay] = useState(1)
  const [openTime, setOpenTime] = useState('07:00')
  const [closeTime, setCloseTime] = useState('09:00')
  const [category, setCategory] = useState<GarbageCategory>('kitchen')

  return (
    <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
      <p className="text-xs font-semibold text-stone-500 mb-2">添加新时段</p>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <select
          value={day}
          onChange={(e) => setDay(Number(e.target.value))}
          className="px-2 py-2 rounded-lg bg-white border border-stone-200 text-xs text-stone-700"
        >
          {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((label, i) => (
            <option key={i} value={i}>{label}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <input
            type="time"
            value={openTime}
            onChange={(e) => setOpenTime(e.target.value)}
            className="flex-1 px-2 py-2 rounded-lg bg-white border border-stone-200 text-xs text-stone-700"
          />
          <input
            type="time"
            value={closeTime}
            onChange={(e) => setCloseTime(e.target.value)}
            className="flex-1 px-2 py-2 rounded-lg bg-white border border-stone-200 text-xs text-stone-700"
          />
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        {(['kitchen', 'recyclable', 'hazardous', 'other'] as GarbageCategory[]).map((cat) => {
          const config = categoryConfig[cat]
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                category === cat
                  ? `${config.bgColor} ${config.color} border ${config.borderColor}`
                  : 'bg-white border border-stone-200 text-stone-400'
              }`}
            >
              {config.emoji}
            </button>
          )
        })}
      </div>
      <button
        onClick={() => {
          onAdd({
            id: Date.now().toString(),
            dayOfWeek: day,
            openTime,
            closeTime,
            category,
            enabled: true,
          })
        }}
        className="w-full py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1"
      >
        <Plus className="w-3 h-3" />
        添加
      </button>
    </div>
  )
}

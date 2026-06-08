import React, { useState, useMemo } from 'react'
import { useHabitStore } from '../store/useHabitStore'
import {
  ENERGY_LABELS,
  MOOD_LABELS,
  SLEEP_LABELS,
  STRESS_LABELS,
} from '../types'
import { formatDate } from '../utils/date'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

const RatingBar: React.FC<{
  value: number
  onChange: (v: number) => void
  labels: Record<number, string>
  colors: string[]
}> = ({ value, onChange, labels, colors }) => {
  return (
    <div className="flex gap-1.5">
      {([1, 2, 3, 4, 5] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
            value === v
              ? 'text-white shadow-sm scale-105'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
          style={value === v ? { backgroundColor: colors[v - 1] } : undefined}
        >
          {labels[v]}
        </button>
      ))}
    </div>
  )
}

export const RecordPage: React.FC<{ initialDate?: string; onDateChange?: () => void }> = ({
  initialDate,
  onDateChange,
}) => {
  const { habits, records, upsertRecord, toggleHabitCompletion } =
    useHabitStore()
  const [selectedDate, setSelectedDate] = useState(
    initialDate || formatDate(new Date())
  )

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
    onDateChange?.()
  }

  const activeHabits = habits.filter((h) => !h.archived)
  const record = records[selectedDate]

  const dateObj = new Date(selectedDate)
  const canGoNext = selectedDate < formatDate(new Date())

  const changeDate = (delta: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    handleDateChange(formatDate(d))
  }

  const today = formatDate(new Date())
  const isToday = selectedDate === today

  const energyColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  const moodColors = ['#6b7280', '#9ca3af', '#fbbf24', '#a3e635', '#34d399']
  const sleepColors = ['#374151', '#6b7280', '#fbbf24', '#60a5fa', '#818cf8']
  const stressColors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">每日记录</h1>

      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {isToday ? '今天' : `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`}
          </div>
          <div className="text-xs text-gray-400">
            {['周日', '周一', '周二', '周三', '周四', '周五', '周六'][dateObj.getDay()]}
          </div>
        </div>
        <button
          onClick={() => changeDate(1)}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition-colors ${
            canGoNext
              ? 'hover:bg-gray-100'
              : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {!isToday && (
        <button
          onClick={() => handleDateChange(today)}
          className="w-full mb-4 py-2 text-sm text-indigo-500 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors font-medium"
        >
          回到今天
        </button>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            习惯完成情况
          </h3>
          {activeHabits.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              还没有习惯，去管理页添加吧
            </p>
          ) : (
            <div className="space-y-2">
              {activeHabits.map((habit) => {
                const completed = record?.habitCompletions[habit.id] || false
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabitCompletion(selectedDate, habit.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      completed
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-gray-50 border border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200'
                      }`}
                    >
                      {completed && <Check size={14} strokeWidth={3} />}
                    </div>
                    <span className="text-lg">{habit.icon}</span>
                    <span
                      className={`text-sm font-medium ${
                        completed ? 'text-green-700' : 'text-gray-600'
                      }`}
                    >
                      {habit.name}
                    </span>
                    {completed && (
                      <span className="ml-auto text-xs text-green-500">
                        已完成
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-5">
          <h3 className="text-sm font-semibold text-gray-700">今日状态</h3>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              ⚡ 精力水平
            </label>
            <RatingBar
              value={record?.energy || 3}
              onChange={(v) => upsertRecord(selectedDate, { energy: v as 1|2|3|4|5 })}
              labels={ENERGY_LABELS}
              colors={energyColors}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              😊 心情
            </label>
            <RatingBar
              value={record?.mood || 3}
              onChange={(v) => upsertRecord(selectedDate, { mood: v as 1|2|3|4|5 })}
              labels={MOOD_LABELS}
              colors={moodColors}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              😴 睡眠质量
            </label>
            <RatingBar
              value={record?.sleep || 3}
              onChange={(v) => upsertRecord(selectedDate, { sleep: v as 1|2|3|4|5 })}
              labels={SLEEP_LABELS}
              colors={sleepColors}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">
              💆 压力水平
            </label>
            <RatingBar
              value={record?.stress || 3}
              onChange={(v) => upsertRecord(selectedDate, { stress: v as 1|2|3|4|5 })}
              labels={STRESS_LABELS}
              colors={stressColors}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

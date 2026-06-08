import React, { useMemo, useState } from 'react'
import { useHabitStore } from '../store/useHabitStore'
import { getLast14Days } from '../utils/analysis'
import { formatShortDate, getDayOfWeek, isToday } from '../utils/date'
import { X, ChevronRight } from 'lucide-react'
import {
  ENERGY_LABELS,
  MOOD_LABELS,
  SLEEP_LABELS,
  STRESS_LABELS,
} from '../types'

function getCellColor(
  completed: boolean | undefined,
  energy: number | undefined,
  hasRecord: boolean
): string {
  if (!hasRecord) return 'bg-gray-50'
  if (!completed) return 'bg-gray-100'
  if (!energy) return 'bg-indigo-100'
  if (energy >= 5) return 'bg-emerald-400'
  if (energy >= 4) return 'bg-emerald-300'
  if (energy >= 3) return 'bg-amber-300'
  if (energy >= 2) return 'bg-orange-300'
  return 'bg-red-300'
}

function getCellOpacity(completed: boolean | undefined): number {
  if (completed) return 1
  return 0.4
}

interface CellDetail {
  date: string
  habitId: string
  habitName: string
  habitIcon: string
}

const StatPill: React.FC<{ label: string; value: number; labels: Record<number, string>; colors: string[] }> = ({
  label,
  value,
  labels,
  colors,
}) => (
  <div className="flex items-center gap-2">
    <span className="text-xs text-gray-500 w-16">{label}</span>
    <div className="flex-1 flex gap-1">
      {([1, 2, 3, 4, 5] as const).map((v) => (
        <div
          key={v}
          className={`flex-1 h-5 rounded text-[10px] flex items-center justify-center font-medium ${
            v === value ? 'text-white' : 'text-gray-400 bg-gray-50'
          }`}
          style={v === value ? { backgroundColor: colors[v - 1] } : undefined}
        >
          {v === value ? labels[v] : ''}
        </div>
      ))}
    </div>
  </div>
)

export const EnergyMapPage: React.FC<{ onNavigateToRecord?: (date: string) => void }> = ({
  onNavigateToRecord,
}) => {
  const { habits, records } = useHabitStore()
  const activeHabits = habits.filter((h) => !h.archived)
  const dates = useMemo(() => getLast14Days(), [])
  const [detail, setDetail] = useState<CellDetail | null>(null)

  const todayStats = useMemo(() => {
    const today = dates[dates.length - 1]
    const r = records[today]
    if (!r) return null
    const completedCount = activeHabits.filter(
      (h) => r.habitCompletions[h.id]
    ).length
    return {
      energy: r.energy,
      mood: r.mood,
      completed: completedCount,
      total: activeHabits.length,
    }
  }, [dates, records, activeHabits])

  const streakDays = useMemo(() => {
    let streak = 0
    for (let i = dates.length - 1; i >= 0; i--) {
      const r = records[dates[i]]
      if (r) {
        const hasAnyCompleted = activeHabits.some(
          (h) => r.habitCompletions[h.id]
        )
        if (hasAnyCompleted) streak++
        else break
      } else break
    }
    return streak
  }, [dates, records, activeHabits])

  const energyLabel = (v: number) => {
    if (v >= 5) return '充沛'
    if (v >= 4) return '不错'
    if (v >= 3) return '一般'
    if (v >= 2) return '偏低'
    return '极低'
  }

  const detailRecord = detail ? records[detail.date] : null
  const detailDateObj = detail ? new Date(detail.date) : null

  const energyColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e']
  const moodColors = ['#6b7280', '#9ca3af', '#fbbf24', '#a3e635', '#34d399']
  const sleepColors = ['#374151', '#6b7280', '#fbbf24', '#60a5fa', '#818cf8']
  const stressColors = ['#22c55e', '#84cc16', '#eab308', '#f97316', '#ef4444']

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">能量地图</h1>
        <p className="text-sm text-gray-500 mt-1">
          看看哪些习惯让你的状态变好
        </p>
      </div>

      {todayStats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">今日精力</div>
            <div
              className={`text-xl font-bold ${
                todayStats.energy >= 4
                  ? 'text-emerald-500'
                  : todayStats.energy >= 3
                  ? 'text-amber-500'
                  : 'text-red-500'
              }`}
            >
              {energyLabel(todayStats.energy)}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">完成习惯</div>
            <div className="text-xl font-bold text-indigo-500">
              {todayStats.completed}/{todayStats.total}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-3 text-center">
            <div className="text-xs text-gray-400 mb-1">连续天数</div>
            <div className="text-xl font-bold text-amber-500">
              {streakDays}天
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          14天能量地图
        </h3>

        {activeHabits.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">
            还没有习惯，去管理页添加吧
          </p>
        ) : (
          <div
            className="overflow-x-auto -mx-4 px-4"
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorX: 'contain',
            }}
          >
            <div
              className="grid"
              style={{
                gridTemplateColumns: `72px repeat(${dates.length}, minmax(28px, 1fr))`,
                gap: '3px',
                minWidth: 500,
              }}
            >
              <div />
              {dates.map((date) => (
                <div
                  key={date}
                  className={`text-center text-[10px] leading-tight pb-1 ${
                    isToday(date) ? 'text-indigo-500 font-bold' : 'text-gray-400'
                  }`}
                >
                  <div>{formatShortDate(date)}</div>
                  <div>{getDayOfWeek(date)}</div>
                </div>
              ))}

              {activeHabits.map((habit) => (
                <React.Fragment key={habit.id}>
                  <div className="flex items-center gap-1 pr-1">
                    <span className="text-sm">{habit.icon}</span>
                    <span className="text-xs text-gray-600 truncate">
                      {habit.name}
                    </span>
                  </div>
                  {dates.map((date) => {
                    const r = records[date]
                    const completed = r?.habitCompletions[habit.id]
                    const hasRecord = !!r
                    const energy = r?.energy
                    const isSelected =
                      detail?.date === date && detail?.habitId === habit.id
                    return (
                      <button
                        key={date}
                        onClick={() => {
                          if (isSelected) {
                            setDetail(null)
                          } else {
                            setDetail({ date, habitId: habit.id, habitName: habit.name, habitIcon: habit.icon })
                          }
                        }}
                        className={`aspect-square rounded-md transition-colors cursor-pointer ${getCellColor(
                          completed,
                          energy,
                          hasRecord
                        )} ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : 'hover:ring-2 hover:ring-indigo-300 hover:ring-offset-1'}`}
                        style={{
                          opacity: getCellOpacity(completed),
                          touchAction: 'manipulation',
                          minHeight: 28,
                          minWidth: 28,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      />
                    )
                  })}
                </React.Fragment>
              ))}

              <div className="flex items-center text-xs text-gray-500 pr-1">
                精力
              </div>
              {dates.map((date) => {
                const r = records[date]
                const e = r?.energy
                return (
                  <div
                    key={date}
                    className={`aspect-square rounded-md ${
                      e
                        ? e >= 5
                          ? 'bg-emerald-500'
                          : e >= 4
                          ? 'bg-emerald-300'
                          : e >= 3
                          ? 'bg-amber-300'
                          : e >= 2
                          ? 'bg-orange-300'
                          : 'bg-red-300'
                        : 'bg-gray-50'
                    }`}
                    style={{ minHeight: 28 }}
                  />
                )
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 text-[10px] text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                <span>高精力+完成</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-amber-300" />
                <span>中精力+完成</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-red-300" />
                <span>低精力+完成</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm bg-gray-100 opacity-40" />
                <span>未完成</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50" onClick={() => setDetail(null)}>
          <div
            className="bg-white rounded-t-2xl w-full max-w-lg p-5 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {detail.habitIcon} {detail.habitName}
                </h3>
                <p className="text-xs text-gray-400">
                  {detailDateObj && `${detailDateObj.getMonth() + 1}月${detailDateObj.getDate()}日 ${['周日','周一','周二','周三','周四','周五','周六'][detailDateObj.getDay()]}`}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-4">
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  detailRecord?.habitCompletions[detail.habitId]
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {detailRecord?.habitCompletions[detail.habitId] ? '✓ 已完成' : '✗ 未完成'}
              </div>
            </div>

            {detailRecord ? (
              <div className="space-y-2.5 mb-5">
                <StatPill label="⚡ 精力" value={detailRecord.energy} labels={ENERGY_LABELS} colors={energyColors} />
                <StatPill label="😊 心情" value={detailRecord.mood} labels={MOOD_LABELS} colors={moodColors} />
                <StatPill label="😴 睡眠" value={detailRecord.sleep} labels={SLEEP_LABELS} colors={sleepColors} />
                <StatPill label="💆 压力" value={detailRecord.stress} labels={STRESS_LABELS} colors={stressColors} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-5">当天未记录状态数据</p>
            )}

            <button
              onClick={() => {
                onNavigateToRecord?.(detail.date)
                setDetail(null)
              }}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-md"
            >
              前往当天记录
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
        <h3 className="font-semibold mb-2">💡 小提示</h3>
        <p className="text-sm opacity-90 leading-relaxed">
          点击地图格子可以查看当天的详细状态。格子颜色越绿，说明那天既完成了习惯，精力状态也好。灰色格表示没完成，颜色越红说明精力越低。
          坚持记录一周后就能看出规律了！
        </p>
      </div>
    </div>
  )
}

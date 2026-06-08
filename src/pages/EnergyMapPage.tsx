import React, { useMemo } from 'react'
import { useHabitStore } from '../store/useHabitStore'
import { getLast14Days } from '../utils/analysis'
import { formatShortDate, getDayOfWeek, isToday } from '../utils/date'
import { ChevronRight } from 'lucide-react'

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

export const EnergyMapPage: React.FC = () => {
  const { habits, records } = useHabitStore()
  const activeHabits = habits.filter((h) => !h.archived)
  const dates = useMemo(() => getLast14Days(), [])

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
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="min-w-[480px]">
              <div className="flex mb-2">
                <div className="w-20 shrink-0" />
                {dates.map((date) => (
                  <div
                    key={date}
                    className={`flex-1 text-center text-[10px] leading-tight ${
                      isToday(date) ? 'text-indigo-500 font-bold' : 'text-gray-400'
                    }`}
                  >
                    <div>{formatShortDate(date)}</div>
                    <div>{getDayOfWeek(date)}</div>
                  </div>
                ))}
              </div>

              {activeHabits.map((habit) => (
                <div key={habit.id} className="flex items-center mb-1.5">
                  <div className="w-20 shrink-0 flex items-center gap-1.5 pr-2">
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
                    return (
                      <div
                        key={date}
                        className="flex-1 px-0.5"
                      >
                        <div
                          className={`aspect-square rounded-md transition-all ${getCellColor(
                            completed,
                            energy,
                            hasRecord
                          )}`}
                          style={{
                            opacity: getCellOpacity(completed),
                          }}
                          title={
                            hasRecord
                              ? `${habit.name} ${completed ? '✓' : '✗'} | 精力: ${energy || '-'}`
                              : '未记录'
                          }
                        />
                      </div>
                    )
                  })}
                </div>
              ))}

              <div className="flex items-center mt-3 pt-3 border-t border-gray-100">
                <div className="w-20 shrink-0 text-xs text-gray-500 pr-2">
                  精力
                </div>
                {dates.map((date) => {
                  const r = records[date]
                  const e = r?.energy
                  return (
                    <div key={date} className="flex-1 px-0.5">
                      <div
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
                        title={`精力: ${e || '未记录'}`}
                      />
                    </div>
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
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
        <h3 className="font-semibold mb-2">💡 小提示</h3>
        <p className="text-sm opacity-90 leading-relaxed">
          格子颜色越绿，说明那天既完成了习惯，精力状态也好。灰色格表示没完成，颜色越红说明精力越低。
          坚持记录一周后就能看出规律了！
        </p>
      </div>
    </div>
  )
}

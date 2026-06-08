import React, { useMemo } from 'react'
import { useHabitStore } from '../store/useHabitStore'
import { getLast14Days, calcCorrelation } from '../utils/analysis'

export const StatsPage: React.FC = () => {
  const { habits, records } = useHabitStore()
  const activeHabits = habits.filter((h) => !h.archived)
  const dates = useMemo(() => getLast14Days(), [])

  const habitStats = useMemo(() => {
    return activeHabits.map((habit) => {
      const weekRecords = dates
        .map((d) => records[d])
        .filter(Boolean)

      const completedDates = weekRecords.filter(
        (r) => r.habitCompletions[habit.id]
      )
      const completionRate =
        weekRecords.length > 0
          ? completedDates.length / weekRecords.length
          : 0

      const energyOnComplete =
        completedDates.length > 0
          ? completedDates.reduce((s, r) => s + r.energy, 0) /
            completedDates.length
          : 0
      const energyOnMiss =
        weekRecords.length > 0
          ? weekRecords
              .filter((r) => !r.habitCompletions[habit.id])
              .reduce((s, r) => s + r.energy, 0) /
            Math.max(
              1,
              weekRecords.filter((r) => !r.habitCompletions[habit.id]).length
            )
          : 0

      const moodOnComplete =
        completedDates.length > 0
          ? completedDates.reduce((s, r) => s + r.mood, 0) /
            completedDates.length
          : 0

      const completionBinary = weekRecords.map((r) =>
        r.habitCompletions[habit.id] ? 1 : 0
      )
      const energyValues = weekRecords.map((r) => r.energy)
      const correlation = calcCorrelation(completionBinary, energyValues)

      const nextDayEnergy = dates
        .slice(0, -1)
        .map((d, i) => {
          const nextDay = records[dates[i + 1]]
          const todayRecord = records[d]
          if (!nextDay || !todayRecord) return null
          if (!todayRecord.habitCompletions[habit.id]) return null
          return nextDay.energy
        })
        .filter((v): v is 1|2|3|4|5 => v !== null)

      const avgNextDayEnergy =
        nextDayEnergy.length > 0
          ? nextDayEnergy.reduce((a, b) => a + b, 0) / nextDayEnergy.length
          : 0

      const overallAvgEnergy =
        weekRecords.length > 0
          ? weekRecords.reduce((s, r) => s + r.energy, 0) / weekRecords.length
          : 0

      return {
        habit,
        completionRate,
        energyOnComplete,
        energyOnMiss,
        moodOnComplete,
        correlation,
        nextDayCount: nextDayEnergy.length,
        avgNextDayEnergy,
        overallAvgEnergy,
        recordCount: weekRecords.length,
      }
    })
  }, [activeHabits, dates, records])

  const sortedByCorrelation = useMemo(
    () =>
      [...habitStats].sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)),
    [habitStats]
  )

  const getCorrelationLabel = (r: number) => {
    if (r > 0.6) return { text: '强正相关', color: 'text-emerald-600', bg: 'bg-emerald-50' }
    if (r > 0.3) return { text: '正相关', color: 'text-emerald-500', bg: 'bg-emerald-50' }
    if (r > -0.3) return { text: '弱相关', color: 'text-gray-500', bg: 'bg-gray-50' }
    if (r > -0.6) return { text: '负相关', color: 'text-red-500', bg: 'bg-red-50' }
    return { text: '强负相关', color: 'text-red-600', bg: 'bg-red-50' }
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">统计分析</h1>
        <p className="text-sm text-gray-500 mt-1">
          看看习惯和状态的关联
        </p>
      </div>

      {activeHabits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500">添加习惯并记录几天后即可查看统计</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              习惯 × 精力关联度
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              基于近14天数据，分析每个习惯和当天精力水平的相关性
            </p>
            <div className="space-y-3">
              {sortedByCorrelation.map((stat) => {
                const corr = getCorrelationLabel(stat.correlation)
                return (
                  <div
                    key={stat.habit.id}
                    className="p-3 rounded-xl bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{stat.habit.icon}</span>
                        <span className="font-medium text-sm text-gray-800">
                          {stat.habit.name}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${corr.color} ${corr.bg}`}
                      >
                        {corr.text}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-gray-400">完成率</div>
                        <div className="font-semibold text-gray-700">
                          {Math.round(stat.completionRate * 100)}%
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-gray-400">相关系数 r</div>
                        <div className="font-semibold text-gray-700">
                          {stat.correlation.toFixed(2)}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-gray-400">完成时精力</div>
                        <div className="font-semibold text-emerald-600">
                          {stat.energyOnComplete.toFixed(1)}
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <div className="text-gray-400">未完成时精力</div>
                        <div className="font-semibold text-gray-600">
                          {stat.energyOnMiss.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              次日精力变化
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              完成某习惯后，第二天的精力是否更好？
            </p>
            <div className="space-y-3">
              {habitStats
                .filter((s) => s.nextDayCount >= 2)
                .map((stat) => {
                  const diff = stat.avgNextDayEnergy - stat.overallAvgEnergy
                  const isPositive = diff > 0.2
                  const isNegative = diff < -0.2
                  return (
                    <div
                      key={stat.habit.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >
                      <span className="text-lg">{stat.habit.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800">
                          {stat.habit.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {stat.nextDayCount}天数据
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-bold ${
                            isPositive
                              ? 'text-emerald-500'
                              : isNegative
                              ? 'text-red-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {diff > 0 ? '+' : ''}
                          {diff.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-gray-400">次日精力差</div>
                      </div>
                    </div>
                  )
                })}
              {habitStats.filter((s) => s.nextDayCount >= 2).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">
                  需要更多数据才能分析次日精力变化
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              精力对比条形图
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              完成 vs 未完成时的平均精力
            </p>
            <div className="space-y-4">
              {habitStats.map((stat) => {
                const maxVal = Math.max(stat.energyOnComplete, stat.energyOnMiss, 1)
                return (
                  <div key={stat.habit.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{stat.habit.icon}</span>
                      <span className="text-xs text-gray-600">{stat.habit.name}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-8">完成</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-emerald-400 rounded-full transition-all"
                            style={{
                              width: `${(stat.energyOnComplete / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-6">
                          {stat.energyOnComplete.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400 w-8">未做</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-gray-300 rounded-full transition-all"
                            style={{
                              width: `${(stat.energyOnMiss / 5) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 w-6">
                          {stat.energyOnMiss.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

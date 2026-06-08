import React, { useMemo } from 'react'
import { useHabitStore } from '../store/useHabitStore'
import { getWeekDates } from '../utils/analysis'
import { formatDate } from '../utils/date'
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react'

export const ReviewPage: React.FC = () => {
  const { habits, records, reviews, generateReview } = useHabitStore()
  const activeHabits = habits.filter((h) => !h.archived)

  const currentWeekDates = useMemo(() => getWeekDates(new Date()), [])
  const weekStart = currentWeekDates[0]

  const existingReview = useMemo(
    () => reviews.find((r) => r.weekStart === weekStart),
    [reviews, weekStart]
  )

  const review = existingReview

  const hasData = useMemo(() => {
    return currentWeekDates.some((d) => records[d])
  }, [currentWeekDates, records])

  const getCorrelationIcon = (correlation: number) => {
    if (correlation > 0.3) return <TrendingUp size={16} className="text-emerald-500" />
    if (correlation < -0.3) return <TrendingDown size={16} className="text-red-500" />
    return <Minus size={16} className="text-gray-400" />
  }

  const getSuggestionStyle = (suggestion: string) => {
    if (suggestion.includes('值得坚持') || suggestion.includes('更好'))
      return { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" /> }
    if (suggestion.includes('太') || suggestion.includes('负相关') || suggestion.includes('下降') || suggestion.includes('消耗'))
      return { bg: 'bg-red-50', border: 'border-red-200', icon: <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" /> }
    return { bg: 'bg-gray-50', border: 'border-gray-200', icon: <Minus size={16} className="text-gray-400 shrink-0 mt-0.5" /> }
  }

  const weekLabel = (() => {
    const start = new Date(weekStart)
    const end = new Date(currentWeekDates[6])
    return `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`
  })()

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">周复盘</h1>
          <p className="text-sm text-gray-500 mt-1">{weekLabel}</p>
        </div>
        <button
          onClick={() => generateReview(weekStart)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 transition-colors shadow-md"
        >
          <RefreshCw size={14} />
          生成复盘
        </button>
      </div>

      {!hasData && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500">本周还没有记录数据</p>
          <p className="text-sm text-gray-400 mt-1">先去记录几天习惯和状态吧</p>
        </div>
      )}

      {hasData && !review && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📊</p>
          <p className="text-gray-500">点击"生成复盘"查看本周分析</p>
        </div>
      )}

      {review && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white">
            <h3 className="font-semibold mb-3">本周总览</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-xs opacity-70">平均精力</div>
                <div className="text-2xl font-bold">
                  {review.overallEnergy.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-xs opacity-70">平均心情</div>
                <div className="text-2xl font-bold">
                  {review.overallMood.toFixed(1)}
                </div>
              </div>
            </div>
          </div>

          {review.summary.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                📋 本周总结
              </h3>
              <div className="space-y-2">
                {review.summary.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-3 bg-indigo-50 rounded-xl"
                  >
                    <span className="text-sm text-indigo-400 mt-0.5">•</span>
                    <span className="text-sm text-gray-700">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              🔍 习惯洞察
            </h3>
            <div className="space-y-3">
              {review.insights.map((insight) => {
                const style = getSuggestionStyle(insight.suggestion)
                return (
                  <div
                    key={insight.habitId}
                    className={`p-3 rounded-xl border ${style.bg} ${style.border}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {getCorrelationIcon(insight.correlation)}
                      <span className="font-medium text-sm text-gray-800">
                        {insight.habitName}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto">
                        完成率 {Math.round(insight.completionRate * 100)}%
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      {style.icon}
                      <span className="text-xs text-gray-600 leading-relaxed">
                        {insight.suggestion}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-black/5">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400">相关系数</div>
                        <div className="text-xs font-semibold text-gray-600">
                          {insight.correlation.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400">完成时精力</div>
                        <div className="text-xs font-semibold text-emerald-600">
                          {insight.avgEnergyAfter.toFixed(1)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400">平均精力</div>
                        <div className="text-xs font-semibold text-gray-600">
                          {insight.avgEnergyOverall.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {review.topHabits.length > 0 && (
            <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-4">
              <h3 className="text-sm font-semibold text-emerald-700 mb-2">
                ✨ 本周值得坚持的习惯
              </h3>
              <div className="flex flex-wrap gap-2">
                {review.topHabits.map((name) => (
                  <span
                    key={name}
                    className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
            <h3 className="text-sm font-semibold text-amber-700 mb-2">
              💭 建议
            </h3>
            <ul className="space-y-1.5 text-xs text-amber-700">
              <li>• 完成率低于30%的习惯，试试降低目标频率</li>
              <li>• 和精力负相关的习惯，可能需要调整强度或时间</li>
              <li>• 和精力正相关的习惯，是值得优先保留的</li>
              <li>• 数据越多，分析越准确，坚持记录是关键</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

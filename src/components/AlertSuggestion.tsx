import { useMemo, useState } from 'react'
import { Lightbulb, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { detectAnomalies, generateSuggestions } from '@/utils/anomaly'
import type { AdjustmentSuggestion } from '@/types'
import { cn } from '@/lib/utils'

interface AlertSuggestionProps {
  planId: string
}

interface ParamRowProps {
  label: string
  current: number
  suggested: number
  applied?: boolean
}

function ParamRow({ label, current, suggested, applied }: ParamRowProps) {
  const diff = suggested - current
  const colorClass = diff < 0
    ? 'text-red-400'
    : diff === 0
      ? 'text-emerald-400'
      : 'text-blue-400'

  return (
    <tr className="border-b border-gray-700/50">
      <td className="py-2 pr-4 text-sm text-gray-300">{label}</td>
      <td className="py-2 px-4 text-right text-sm text-gray-400">{current}%</td>
      <td className="py-2 px-2 text-center text-sm text-gray-500">→</td>
      <td className={cn('py-2 pl-4 text-right text-sm font-medium', applied ? 'text-emerald-400' : colorClass)}>
        {suggested}%
      </td>
    </tr>
  )
}

interface AppliedRecord {
  targetDay: number
  suggestion: AdjustmentSuggestion
}

export default function AlertSuggestion({ planId }: AlertSuggestionProps) {
  const observations = useStore(s => s.observations.filter(o => o.planId === planId))
  const schedules = useStore(s => s.schedules.filter(s => s.planId === planId))
  const applySuggestion = useStore(s => s.applySuggestion)

  const [appliedMap, setAppliedMap] = useState<Record<number, AppliedRecord>>({})

  const anomalies = useMemo(() => detectAnomalies(observations), [observations])
  const suggestions = useMemo(
    () => generateSuggestions(anomalies, schedules, observations),
    [anomalies, schedules, observations]
  )

  const pendingSuggestions = suggestions.filter(s => !(s.targetDay in appliedMap))

  const allDisplayItems = [
    ...pendingSuggestions.map(s => ({ ...s, applied: false as const })),
    ...Object.values(appliedMap).map(a => ({ ...a.suggestion, applied: true as const })),
  ].sort((a, b) => a.targetDay - b.targetDay)

  const hasAnyContent = allDisplayItems.length > 0

  const handleApply = (suggestion: AdjustmentSuggestion) => {
    applySuggestion(planId, suggestion.targetDay, {
      blueRatio: suggestion.suggestedBlue,
      whiteRatio: suggestion.suggestedWhite,
      purpleRatio: suggestion.suggestedPurple,
      brightness: suggestion.suggestedBrightness,
    })
    setAppliedMap(prev => ({
      ...prev,
      [suggestion.targetDay]: { targetDay: suggestion.targetDay, suggestion },
    }))
  }

  if (!hasAnyContent) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p className="text-sm">暂无调光建议</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {allDisplayItems.map(item => (
        <div
          key={item.targetDay}
          className={cn(
            'rounded-lg border p-4 transition-all',
            item.applied
              ? 'border-emerald-500/20 bg-gray-900/60'
              : 'border-purple-500/30 bg-gray-900'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.applied ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Lightbulb className="h-4 w-4 text-purple-400" />
              )}
              <span className={cn('text-sm font-medium', item.applied ? 'text-emerald-400' : 'text-purple-300')}>
                第{item.targetDay + 1}天 {item.applied ? '已处理' : '调光建议'}
              </span>
            </div>
            {item.applied && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                已应用
              </span>
            )}
          </div>

          <table className="mt-3 w-full">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="text-left font-normal">参数</th>
                <th className="text-right font-normal">原值</th>
                <th className="font-normal" />
                <th className="text-right font-normal">{item.applied ? '调整后' : '建议值'}</th>
              </tr>
            </thead>
            <tbody>
              <ParamRow label="蓝光" current={item.currentBlue} suggested={item.suggestedBlue} applied={item.applied} />
              <ParamRow label="白光" current={item.currentWhite} suggested={item.suggestedWhite} applied={item.applied} />
              <ParamRow label="紫光" current={item.currentPurple} suggested={item.suggestedPurple} applied={item.applied} />
              <ParamRow label="亮度" current={item.currentBrightness} suggested={item.suggestedBrightness} applied={item.applied} />
            </tbody>
          </table>

          <p className="mt-3 text-xs text-gray-400">{item.reason}</p>

          {!item.applied && (
            <button
              onClick={() => handleApply(item)}
              className="mt-3 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-500"
            >
              应用建议
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

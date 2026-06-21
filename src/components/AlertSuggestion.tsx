import { useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { detectAnomalies, generateSuggestions } from '@/utils/anomaly'
import { cn } from '@/lib/utils'

interface AlertSuggestionProps {
  planId: string
}

interface ParamRowProps {
  label: string
  current: number
  suggested: number
}

function ParamRow({ label, current, suggested }: ParamRowProps) {
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
      <td className={cn('py-2 pl-4 text-right text-sm font-medium', colorClass)}>
        {suggested}%
      </td>
    </tr>
  )
}

export default function AlertSuggestion({ planId }: AlertSuggestionProps) {
  const observations = useStore(s => s.observations.filter(o => o.planId === planId))
  const schedules = useStore(s => s.schedules.filter(s => s.planId === planId))
  const applySuggestion = useStore(s => s.applySuggestion)

  const anomalies = useMemo(() => detectAnomalies(observations), [observations])
  const suggestions = useMemo(
    () => generateSuggestions(anomalies, schedules, observations),
    [anomalies, schedules, observations]
  )

  if (suggestions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        <p className="text-sm">暂无调光建议</p>
      </div>
    )
  }

  const handleApply = (suggestion: typeof suggestions[number]) => {
    applySuggestion(planId, suggestion.targetDay, {
      blueRatio: suggestion.suggestedBlue,
      whiteRatio: suggestion.suggestedWhite,
      purpleRatio: suggestion.suggestedPurple,
      brightness: suggestion.suggestedBrightness,
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {suggestions.map((suggestion, idx) => (
        <div
          key={idx}
          className="rounded-lg border border-purple-500/30 bg-gray-900 p-4"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-300">
              第{suggestion.targetDay + 1}天 调光建议
            </span>
          </div>

          <table className="mt-3 w-full">
            <thead>
              <tr className="text-xs text-gray-500">
                <th className="text-left font-normal">参数</th>
                <th className="text-right font-normal">当前值</th>
                <th className="font-normal" />
                <th className="text-right font-normal">建议值</th>
              </tr>
            </thead>
            <tbody>
              <ParamRow label="蓝光" current={suggestion.currentBlue} suggested={suggestion.suggestedBlue} />
              <ParamRow label="白光" current={suggestion.currentWhite} suggested={suggestion.suggestedWhite} />
              <ParamRow label="紫光" current={suggestion.currentPurple} suggested={suggestion.suggestedPurple} />
              <ParamRow label="亮度" current={suggestion.currentBrightness} suggested={suggestion.suggestedBrightness} />
            </tbody>
          </table>

          <p className="mt-3 text-xs text-gray-400">{suggestion.reason}</p>

          <button
            onClick={() => handleApply(suggestion)}
            className="mt-3 rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-purple-500"
          >
            应用建议
          </button>
        </div>
      ))}
    </div>
  )
}

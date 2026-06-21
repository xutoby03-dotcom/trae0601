import { useMemo } from 'react'
import { Activity, ArrowDownCircle, UtensilsCrossed, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { detectAnomalies } from '@/utils/anomaly'
import { cn } from '@/lib/utils'

const anomalyConfig: Record<string, { label: string; icon: React.ElementType }> = {
  extension: { label: '舒展度异常', icon: Activity },
  float: { label: '漂浮异常', icon: ArrowDownCircle },
  feeding: { label: '摄食异常', icon: UtensilsCrossed },
  collision: { label: '撞壁异常', icon: AlertTriangle },
}

interface AlertPanelProps {
  planId: string
}

export default function AlertPanel({ planId }: AlertPanelProps) {
  const observations = useStore(s => s.observations.filter(o => o.planId === planId))

  const anomalies = useMemo(
    () => detectAnomalies(observations),
    [observations]
  )

  if (anomalies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-emerald-400">
        <CheckCircle2 className="h-12 w-12 animate-pulse" />
        <p className="text-base font-medium">暂无异常，驯化进展正常</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {anomalies.map((anomaly, idx) => {
        const config = anomalyConfig[anomaly.type] ?? { label: anomaly.type, icon: AlertTriangle }
        const Icon = config.icon
        const isCritical = anomaly.severity === 'critical'

        return (
          <div
            key={idx}
            className={cn(
              'rounded-lg border-l-4 bg-gray-900 p-4',
              isCritical ? 'border-l-red-500' : 'border-l-yellow-500'
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn('h-5 w-5', isCritical ? 'text-red-400' : 'text-yellow-400')} />
                <span className="font-medium text-gray-100">{config.label}</span>
              </div>
              <span
                className={cn(
                  'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  isCritical
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'bg-yellow-500/20 text-yellow-400'
                )}
              >
                {isCritical ? '严重' : '警告'}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {anomaly.dayIndices.map(day => (
                <span
                  key={day}
                  className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-300"
                >
                  第{day + 1}天
                </span>
              ))}
            </div>

            <p className="mt-2 text-sm text-gray-400">{anomaly.message}</p>
          </div>
        )
      })}
    </div>
  )
}

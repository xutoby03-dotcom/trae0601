import { useState, useEffect, useCallback } from 'react'
import type { SafetyAlert } from '@/types'
import { cn } from '@/lib/utils'
import { AlertTriangle, CloudRain, Lightbulb, UserX, X } from 'lucide-react'

interface SafetyBannerProps {
  alerts: SafetyAlert[]
  onDismiss: (id: string) => void
}

const ALERT_ICONS: Record<SafetyAlert['type'], typeof AlertTriangle> = {
  late_night: AlertTriangle,
  poor_lighting: Lightbulb,
  rain: CloudRain,
  solo_return: UserX,
}

export default function SafetyBanner({ alerts, onDismiss }: SafetyBannerProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [autoAlerts, setAutoAlerts] = useState<SafetyAlert[]>([])

  const detectConditions = useCallback(() => {
    const detected: SafetyAlert[] = []
    const now = new Date()

    if (now.getHours() >= 22 || now.getHours() < 5) {
      detected.push({
        id: 'auto-late-night',
        type: 'late_night',
        message: '深夜跑步提醒 — 请选择灯光明亮的路线，结伴而行',
        timestamp: now.toISOString(),
      })
    }

    const isRaining = Math.random() < 0.15
    if (isRaining) {
      detected.push({
        id: 'auto-rain',
        type: 'rain',
        message: '检测到降雨 — 注意路面湿滑，减速慢行',
        timestamp: now.toISOString(),
      })
    }

    return detected
  }, [])

  useEffect(() => {
    setAutoAlerts(detectConditions())
    const interval = setInterval(() => {
      setAutoAlerts(detectConditions())
    }, 60000)
    return () => clearInterval(interval)
  }, [detectConditions])

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id))
    onDismiss(id)
  }

  const allAlerts = [...alerts, ...autoAlerts]
  const visible = allAlerts.filter((a) => !dismissed.has(a.id))

  if (visible.length === 0) return null

  return (
    <div
      className={cn(
        'animate-safety-breathe',
        'relative w-full',
        'bg-gradient-to-r from-orange-950/80 via-amber-900/70 to-orange-950/80',
        'border-b border-orange-500/40',
        'backdrop-blur-sm'
      )}
    >
      <div className="mx-auto max-w-5xl px-4 py-2.5 space-y-1.5">
        {visible.map((alert) => {
          const Icon = ALERT_ICONS[alert.type]
          return (
            <div key={alert.id} className="flex items-center gap-2 text-sm">
              <Icon className="h-4 w-4 shrink-0 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              <span className="text-amber-100/90 flex-1">{alert.message}</span>
              <button
                onClick={() => handleDismiss(alert.id)}
                className="shrink-0 p-0.5 rounded text-amber-400/60 hover:text-amber-300 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

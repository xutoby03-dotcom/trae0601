import { useState, useEffect } from 'react'
import { formatCountdown } from '@/lib/utils'

interface Props {
  openDate: string
  moodColor: string
}

export default function CountdownTimer({ openDate, moodColor }: Props) {
  const [countdown, setCountdown] = useState(formatCountdown(openDate))

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(openDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [openDate])

  if (countdown.isPast) {
    return (
      <div className="flex items-center gap-1.5 text-sm" style={{ color: moodColor }}>
        <span className="inline-block h-2 w-2 animate-pulse rounded-full" style={{ background: moodColor }} />
        <span className="font-medium">可以拆信了</span>
      </div>
    )
  }

  const units = [
    { value: countdown.days, label: '天' },
    { value: countdown.hours, label: '时' },
    { value: countdown.minutes, label: '分' },
    { value: countdown.seconds, label: '秒' },
  ]

  return (
    <div className="flex items-center gap-1">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-0.5">
          <span
            className="inline-flex h-7 min-w-[1.75rem] items-center justify-center rounded-md px-1 text-xs font-bold tabular-nums"
            style={{ background: `${moodColor}20`, color: moodColor }}
          >
            {String(u.value).padStart(u.label === '天' ? 1 : 2, '0')}
          </span>
          <span className="text-[10px]" style={{ color: `${moodColor}99` }}>
            {u.label}
          </span>
          {i < units.length - 1 && <span className="mx-0.5 text-[10px]" style={{ color: `${moodColor}40` }}>:</span>}
        </div>
      ))}
    </div>
  )
}

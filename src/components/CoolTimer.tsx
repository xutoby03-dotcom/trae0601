import { useState, useEffect } from 'react'
import { getTimeRemaining } from '@/utils/helpers'

interface CoolTimerProps {
  targetDate: string
  isExpired: boolean
}

export default function CoolTimer({ targetDate, isExpired }: CoolTimerProps) {
  const [time, setTime] = useState(getTimeRemaining(targetDate))

  useEffect(() => {
    const id = setInterval(() => {
      setTime(getTimeRemaining(targetDate))
    }, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  const circumference = 2 * Math.PI * 26
  const progress = Math.max(0, Math.min(1, time.total / (24 * 60 * 60 * 1000)))
  const dashoffset = circumference * (1 - progress)
  const strokeColor = isExpired ? '#ff6b6b' : '#c4b5fd'

  const hours = String(time.hours).padStart(2, '0')
  const minutes = String(time.minutes).padStart(2, '0')

  return (
    <div className={isExpired ? 'animate-pulse' : ''}>
      <svg width={64} height={64} viewBox="0 0 64 64">
        <circle
          cx={32}
          cy={32}
          r={26}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={4}
        />
        <circle
          cx={32}
          cy={32}
          r={26}
          fill="none"
          stroke={strokeColor}
          strokeWidth={4}
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
        <text
          x={32}
          y={32}
          textAnchor="middle"
          dominantBaseline="central"
          fill={isExpired ? '#ff6b6b' : 'white'}
          fontSize={isExpired ? 12 : 11}
          fontWeight={600}
        >
          {isExpired ? '到期' : `${hours}:${minutes}`}
        </text>
      </svg>
    </div>
  )
}

import { useState, useEffect } from 'react'

interface CountdownProps {
  targetTime: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export default function Countdown({ targetTime }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetTime).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        return
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      })
    }
    calculate()
    const timer = setInterval(calculate, 1000)
    return () => clearInterval(timer)
  }, [targetTime])

  const isZero = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0

  if (isZero) {
    return <span className="text-xs text-zinc-500">已开始</span>
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="text-zinc-500">倒计时</span>
      {timeLeft.days > 0 && (
        <span className="rounded bg-status/20 px-1.5 py-0.5 font-mono text-status">{timeLeft.days}d</span>
      )}
      <span className="rounded bg-status/20 px-1.5 py-0.5 font-mono text-status">
        {String(timeLeft.hours).padStart(2, '0')}h
      </span>
      <span className="rounded bg-status/20 px-1.5 py-0.5 font-mono text-status">
        {String(timeLeft.minutes).padStart(2, '0')}m
      </span>
      <span className="rounded bg-status/20 px-1.5 py-0.5 font-mono text-status">
        {String(timeLeft.seconds).padStart(2, '0')}s
      </span>
    </div>
  )
}

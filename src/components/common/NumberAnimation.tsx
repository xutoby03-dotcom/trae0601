import { useEffect, useState } from 'react'

interface NumberAnimationProps {
  value: number
  suffix?: string
  decimals?: number
}

export default function NumberAnimation({ value, suffix, decimals = 1 }: NumberAnimationProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 1000
    const steps = 60
    const stepDuration = duration / steps
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(increment * step, value)
      setDisplayValue(current)

      if (step >= steps) {
        clearInterval(timer)
        setDisplayValue(value)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="font-mono">
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  )
}

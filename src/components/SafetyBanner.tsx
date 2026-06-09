import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, Clock, Car } from 'lucide-react'

const reminders = [
  { icon: Shield, text: '严禁占用消防通道，违者后果自负', color: 'text-red-400' },
  { icon: Car, text: '车牌必须如实登记，信息不符将拒绝入场', color: 'text-amber-300' },
  { icon: Clock, text: '超时未离场将自动提醒车主，请守时归还', color: 'text-blue-300' },
  { icon: AlertTriangle, text: '占错车位请及时联系车主挪车', color: 'text-orange-300' },
]

export default function SafetyBanner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % reminders.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const reminder = reminders[index]
  const Icon = reminder.icon

  return (
    <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white px-4 py-3 flex items-center gap-3 overflow-hidden relative">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <Icon className={`w-4 h-4 ${reminder.color}`} />
      </div>
      <p className="text-sm font-medium flex-1 truncate transition-all duration-500">
        {reminder.text}
      </p>
      <div className="flex gap-1 flex-shrink-0">
        {reminders.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'bg-white scale-125' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

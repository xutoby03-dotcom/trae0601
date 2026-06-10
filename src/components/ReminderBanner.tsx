import { useState, useEffect } from 'react'

interface ReminderBannerProps {
  message: string
  type?: 'info' | 'warning' | 'success'
  duration?: number
  onClose: () => void
}

export default function ReminderBanner({ message, type = 'info', duration = 4000, onClose }: ReminderBannerProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 400)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const bgColors = {
    info: 'bg-ocean-300/90',
    warning: 'bg-coral-400/90',
    success: 'bg-mint-400/90',
  }

  const icons = {
    info: '💧',
    warning: '⚠️',
    success: '🎉',
  }

  return (
    <div
      className={`animate-slide-down ${bgColors[type]} text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg ${
        visible ? 'opacity-100' : 'opacity-0 transition-opacity duration-400'
      }`}
    >
      <span className="text-base">{icons[type]}</span>
      <span className="text-sm font-medium font-body flex-1">{message}</span>
      <button
        className="text-white/60 hover:text-white text-lg leading-none"
        onClick={() => { setVisible(false); setTimeout(onClose, 200) }}
      >
        ×
      </button>
    </div>
  )
}

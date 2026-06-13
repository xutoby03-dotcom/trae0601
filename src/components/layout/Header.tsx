import { Bell, RefreshCw, User } from 'lucide-react'
import { useEffect, useState } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  onRefresh?: () => void
  urgentCount?: number
  refrigeratedCount?: number
}

export default function Header({ title, subtitle, onRefresh, urgentCount = 0, refrigeratedCount = 0 }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const hasAlerts = urgentCount > 0 || refrigeratedCount > 0

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
      <div>
        <h2 className="font-serif font-bold text-xl text-slate-800">{title}</h2>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col items-end">
          <span className="text-sm font-medium text-slate-700">
            {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </span>
          <span className="text-xs text-slate-500">
            {currentTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <button
          onClick={onRefresh}
          className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors"
          title="刷新数据"
        >
          <RefreshCw size={18} />
        </button>

        <div className="relative">
          <button className="w-10 h-10 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
            <Bell size={18} />
          </button>
          {hasAlerts && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-warning-500 animate-pulse-slow" />
          )}
        </div>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">前台管理员</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}

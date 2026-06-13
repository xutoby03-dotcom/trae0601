import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ReactNode
  gradient: string
  iconBg: string
  trend?: { value: string; positive: boolean }
}

export default function StatCard({ title, value, subtitle, icon, gradient, iconBg, trend }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl ${gradient} p-5 card-shadow hover:card-shadow-hover transition-all duration-300 hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="mt-2 font-serif font-bold text-3xl text-white">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-white/70">{subtitle}</p>}
          {trend && (
            <div className={`mt-3 inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/20 ${trend.positive ? 'text-green-100' : 'text-red-100'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {trend.positive ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
              </svg>
              {trend.value}
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center backdrop-blur-sm`}>
          {icon}
        </div>
      </div>
      <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5" />
    </div>
  )
}

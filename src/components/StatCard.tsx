import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  tone: 'primary' | 'accent' | 'success' | 'warning'
  subtext?: string
  iconNode?: ReactNode
}

const toneStyles: Record<StatCardProps['tone'], { bg: string; iconBg: string; icon: string; accent?: string }> = {
  primary: {
    bg: 'from-primary-600 to-primary-700',
    iconBg: 'bg-white/15',
    icon: 'text-white',
  },
  accent: {
    bg: 'from-accent-400 to-accent-500',
    iconBg: 'bg-white/15',
    icon: 'text-white',
  },
  success: {
    bg: 'from-emerald-500 to-emerald-600',
    iconBg: 'bg-white/15',
    icon: 'text-white',
  },
  warning: {
    bg: 'from-amber-400 to-amber-500',
    iconBg: 'bg-white/15',
    icon: 'text-white',
  },
}

export default function StatCard({
  label, value, icon: Icon, tone, subtext }: StatCardProps) {
  const s = toneStyles[tone]
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-6 text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover`}
      style={{
        background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
      }}
    >
      <div
      className={`absolute inset-0 bg-gradient-to-br opacity-90`}
      style={{
        backgroundImage: `linear-gradient(135deg)`,
      }}
    />
      <div className={`absolute inset-0 bg-gradient-to-br ${s.bg}`} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm/6 text-white/80 font-medium">
              {label}
            </div>
            <div className="mt-3 text-3xl font-bold font-mono tracking-tight">
              {value}
            </div>
            {subtext && (
              <div className="mt-2 text-xs text-white/70">{subtext}</div>
            )}
          </div>
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl ${s.iconBg} ${s.icon} backdrop-blur-sm`}
          >
            <Icon size={24} strokeWidth={2} />
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-40 h-40 rounded-full bg-white/8" />
      </div>
    </div>
  )
}

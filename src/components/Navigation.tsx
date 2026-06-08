import { NavLink } from 'react-router-dom'
import { Home, BookOpen, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/', icon: Home, label: '推荐' },
  { to: '/library', icon: BookOpen, label: '清单' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/80 backdrop-blur-xl border-t border-slate-800/60">
      <div className="max-w-xl mx-auto flex items-center justify-around py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors',
                isActive
                  ? 'text-amber-300'
                  : 'text-slate-600 hover:text-slate-400'
              )
            }
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

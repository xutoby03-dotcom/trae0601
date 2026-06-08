import { NavLink, Outlet } from 'react-router-dom'
import {
  CalendarHeart,
  Users,
  HeartPulse,
  ClipboardPlus,
  ListChecks,
  BarChart3,
} from 'lucide-react'

const navItems = [
  { to: '/', icon: CalendarHeart, label: '看护日历' },
  { to: '/elders', icon: Users, label: '老人档案' },
  { to: '/chronic', icon: HeartPulse, label: '慢病管理' },
  { to: '/followup', icon: ClipboardPlus, label: '复诊记录' },
  { to: '/tasks', icon: ListChecks, label: '家属分工' },
  { to: '/stats', icon: BarChart3, label: '数据统计' },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden md:flex w-56 flex-col border-r border-stone-200 bg-white">
        <div className="flex items-center gap-2 px-5 py-5 border-b border-stone-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E8725A] to-[#C95A43] flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-base text-[#2D3748]">慢病看护</span>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FDF6EC] text-[#E8725A] shadow-sm'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-stone-100">
          <p className="text-xs text-stone-400">用心看护，温暖陪伴</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="md:hidden sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center gap-3 overflow-x-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#E8725A] text-white shadow-sm'
                    : 'bg-stone-100 text-stone-500'
                }`
              }
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </NavLink>
          ))}
        </div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

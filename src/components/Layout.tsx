import { NavLink, Outlet } from 'react-router-dom'
import { Home, Briefcase, CalendarDays, Wallet, ArrowRightLeft, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/jobs', icon: Briefcase, label: '兼职' },
  { to: '/shifts', icon: CalendarDays, label: '排班' },
  { to: '/income', icon: Wallet, label: '收入' },
  { to: '/leave', icon: ArrowRightLeft, label: '请假' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <div className="mx-auto max-w-[480px] min-h-screen bg-white relative pb-20 shadow-sm">
        <div className="overflow-y-auto h-screen pb-20">
          <Outlet />
        </div>
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-white border-t border-stone-200 z-50">
          <div className="flex justify-around items-center h-16">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-2 py-1 rounded-lg transition-colors ${
                    isActive ? 'text-orange-500' : 'text-stone-400 hover:text-stone-600'
                  }`
                }
              >
                <item.icon size={20} strokeWidth={2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

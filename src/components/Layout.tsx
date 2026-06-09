import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Home, BookOpen, PenLine, Gift, BarChart3 } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/books', icon: BookOpen, label: '书架' },
  { path: '/checkin', icon: PenLine, label: '打卡' },
  { path: '/rewards', icon: Gift, label: '奖励' },
  { path: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 pb-20 overflow-y-auto">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white/90 backdrop-blur-lg border-t border-warm-100 z-50 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path
            return (
              <NavLink
                key={path}
                to={path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-warm-600 bg-warm-50 scale-105'
                    : 'text-stone-400 hover:text-warm-500'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { Home, PlusCircle, Search, User, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/requests', icon: Search, label: '求购' },
  { to: '/publish', icon: PlusCircle, label: '发布' },
  { to: '/stats', icon: BarChart3, label: '统计' },
  { to: '/profile', icon: User, label: '我的' },
]

export default function Layout() {
  return (
    <div className="min-h-screen pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-orange-100 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-orange-500 bg-orange-50'
                    : 'text-gray-400 hover:text-orange-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-[10px] font-semibold">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

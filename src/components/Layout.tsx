import { NavLink, Outlet } from 'react-router-dom'
import { Home, Users, Gift, CalendarCheck, BarChart3 } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/relatives', label: '亲戚', icon: Users },
  { to: '/gifts', label: '礼品', icon: Gift },
  { to: '/visits', label: '拜访', icon: CalendarCheck },
  { to: '/stats', label: '统计', icon: BarChart3 },
]

function SidebarNav({ mode }: { mode: 'sidebar' | 'tabbar' }) {
  const location = useLocation()

  return (
    <nav className={mode === 'sidebar' ? 'flex flex-col gap-1 px-3 mt-6' : 'flex items-center justify-around w-full h-full px-1'}>
      {navItems.map(({ to, label, icon: Icon }) => {
        const isActive = location.pathname === to
        return (
          <NavLink
            key={to}
            to={to}
            className={
              mode === 'sidebar'
                ? `group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-red-900 shadow-md shadow-amber-400/30'
                      : 'text-amber-100 hover:bg-red-700/60 hover:text-amber-200'
                  }`
                : `flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-amber-600'
                      : 'text-gray-500 hover:text-red-600'
                  }`
            }
          >
            <Icon
              className={
                mode === 'sidebar'
                  ? `w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-red-900' : ''}`
                  : `w-5 h-5 ${isActive ? 'text-amber-600' : ''}`
              }
            />
            <span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FFFBEB] flex flex-col md:flex-row">
      <aside className="hidden md:flex flex-col w-60 min-h-screen bg-gradient-to-b from-red-700 via-red-600 to-red-800 border-r border-red-900/30 shadow-xl shadow-red-900/20">
        <div className="px-5 pt-6 pb-4">
          <div className="animate-lantern inline-block">
            <div className="text-3xl mb-1 text-center">🏮</div>
          </div>
          <h1 className="text-xl font-bold text-amber-300 tracking-wider font-serif-cn"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.3), 0 0 12px rgba(217,119,6,0.3)' }}
          >
            拜年清单
          </h1>
          <div className="mt-1 h-0.5 w-16 bg-gradient-to-r from-transparent via-amber-400 to-transparent rounded-full" />
        </div>
        <SidebarNav mode="sidebar" />
        <div className="mt-auto px-5 py-4 border-t border-red-800/40">
          <p className="text-xs text-amber-200/50 text-center">🧧 新春快乐</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen md:h-screen pb-20 md:pb-0">
        <Outlet />
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-red-200/50 shadow-[0_-2px_10px_rgba(220,38,38,0.08)] z-50">
        <SidebarNav mode="tabbar" />
      </div>
    </div>
  )
}

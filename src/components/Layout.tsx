import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Umbrella, Plus, BarChart3, Home } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/register', icon: Plus, label: '登记' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-amber-50/20">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1B3A5C] to-[#2D5F8B] flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Umbrella className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-[#1B3A5C] leading-tight font-display">雨伞共享架</h1>
              <p className="text-[10px] text-slate-400 leading-tight">社区互助 · 雨天无忧</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#1B3A5C]/10 text-[#1B3A5C] font-semibold'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-8">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 border-t border-slate-200/60 safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 ${
                  isActive ? 'text-[#1B3A5C]' : 'text-slate-400'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] ${isActive ? 'font-bold' : ''}`}>{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

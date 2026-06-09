import { NavLink, Outlet } from 'react-router-dom'
import { Home, PawPrint, CalendarPlus, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/pets', icon: PawPrint, label: '宠物' },
  { to: '/appointments/new', icon: CalendarPlus, label: '预约' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-[#3D2B1F] text-[#FFF8F0] shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="font-display text-2xl tracking-wide">🐾 毛孩美容档案</h1>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-sm border-t border-[#E8A87C]/30 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="max-w-6xl mx-auto flex justify-around py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-[#E8A87C] scale-105'
                    : 'text-[#8B7E74] hover:text-[#3D2B1F]'
                }`
              }
            >
              <Icon size={22} strokeWidth={2} />
              <span className="text-[11px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

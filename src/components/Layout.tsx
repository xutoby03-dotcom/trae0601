import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Home, ArrowLeftRight, BarChart3, Plus, Target } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '展示柜' },
  { to: '/exchange', icon: ArrowLeftRight, label: '交换区' },
  { to: '/progress', icon: Target, label: '进度' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 cabinet-shelf">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧸</span>
            <h1 className="text-xl font-extrabold text-amber-primary tracking-wide">盲盒柜</h1>
          </div>
          <NavLink
            to="/add"
            className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4"
          >
            <Plus size={16} />
            <span>新增</span>
          </NavLink>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-cabinet-wood/95 backdrop-blur-md border-t border-amber-900/50">
        <div className="container mx-auto flex justify-around items-center py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-primary'
                    : 'text-amber-light/40 hover:text-amber-light/70'
                }`
              }
            >
              <Icon size={20} />
              <span className="text-xs font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

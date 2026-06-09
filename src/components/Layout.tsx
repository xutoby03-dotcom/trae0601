import { NavLink, Outlet } from 'react-router-dom'
import { Droplets, Settings, History, LineChart, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Droplets, label: '首页' },
  { to: '/purifiers', icon: Settings, label: '净水器' },
  { to: '/replacements', icon: History, label: '换芯' },
  { to: '/water-quality', icon: LineChart, label: '水质' },
  { to: '/statistics', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-brand-50/30 to-cyan-50/20">
      <aside className="fixed left-0 top-0 bottom-0 w-[72px] bg-white/70 backdrop-blur-md border-r border-slate-200/60 z-50 hidden md:flex flex-col items-center py-6 gap-2">
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Droplets className="w-5 h-5 text-white" />
          </div>
        </div>
        <nav className="flex-1 flex flex-col items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200/60 z-50 md:hidden">
        <div className="flex items-center justify-around py-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-[10px] transition-all duration-200 ${
                  isActive
                    ? 'text-brand-600'
                    : 'text-slate-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="md:ml-[72px] pb-20 md:pb-6 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}

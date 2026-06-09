import { NavLink, Outlet } from 'react-router-dom'
import { Home, Building2, BarChart3, Sparkles } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: '首页看板', icon: Home },
  { to: '/properties', label: '房源管理', icon: Building2 },
  { to: '/statistics', label: '数据统计', icon: BarChart3 },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-warm-50">
      <aside className="w-60 flex-shrink-0 border-r border-warm-200 bg-warm-100/80 backdrop-blur-sm flex flex-col">
        <div className="px-6 py-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-warm-500 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-warm-800 text-lg leading-tight">净居</h1>
            <p className="text-[10px] text-warm-400 tracking-widest">CLEAN INSPECT</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-warm-500 text-white shadow-md shadow-warm-500/25'
                    : 'text-warm-600 hover:bg-warm-200/60 hover:text-warm-700'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-warm-200">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-sage-400 flex items-center justify-center text-white text-xs font-bold">张</div>
            <div className="text-xs">
              <p className="font-medium text-warm-700">张房东</p>
              <p className="text-warm-400">房东</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto scrollbar-thin">
        <Outlet />
      </main>
    </div>
  )
}

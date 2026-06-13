import { NavLink, Outlet } from 'react-router-dom'
import { Shirt, WashingMachine, ArrowLeftRight, Wrench, BarChart3 } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/coats', icon: Shirt, label: '实验服档案' },
  { to: '/wash', icon: WashingMachine, label: '送洗登记' },
  { to: '/return', icon: ArrowLeftRight, label: '取回登记' },
  { to: '/repair', icon: Wrench, label: '待维修区' },
  { to: '/stats', icon: BarChart3, label: '统计看板' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-[#F7F8FA]">
      <aside className="w-60 flex-shrink-0 bg-[#0D7377] text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">实验服管理</h1>
              <p className="text-[10px] text-white/50 mt-0.5">清洗登记系统</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-white/15 text-white font-medium shadow-sm'
                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-[10px] text-white/30 text-center">v1.0 · 实验室资产管理系统</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Gamepad2, ArrowRightLeft, Dice5 } from 'lucide-react'

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/games', label: '游戏库', icon: Gamepad2 },
  { to: '/lending', label: '外借管理', icon: ArrowRightLeft },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 flex-shrink-0 border-r border-[var(--color-wood-200)] bg-gradient-to-b from-[var(--color-wood-100)] to-[var(--color-wood-50)] p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--color-wood-400)] to-[var(--color-wood-600)] flex items-center justify-center shadow-md">
            <Dice5 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-serif-title text-lg font-bold text-[var(--color-wood-800)] leading-tight">收盒管家</h1>
            <p className="text-[10px] text-[var(--color-wood-500)]">桌游清点与外借管理</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="card-wood rounded-lg p-3 mt-4">
          <p className="text-xs text-[var(--color-wood-600)] font-medium">提示</p>
          <p className="text-[11px] text-[var(--color-wood-500)] mt-1">开盒清点确认配件齐全，收盒复点记录缺件去向</p>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

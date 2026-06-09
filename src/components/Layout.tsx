import { NavLink, Outlet } from 'react-router-dom'
import {
  LayoutDashboard,
  DoorOpen,
  AlertTriangle,
  BarChart3,
  ArrowRightLeft,
  Wrench,
} from 'lucide-react'

const navItems = [
  { to: '/', label: '报修看板', icon: LayoutDashboard },
  { to: '/rooms', label: '会议室', icon: DoorOpen },
  { to: '/report', label: '提交报修', icon: AlertTriangle },
  { to: '/alternatives', label: '替代建议', icon: ArrowRightLeft },
  { to: '/stats', label: '统计概览', icon: BarChart3 },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900">
              <Wrench className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-base font-bold leading-tight text-slate-900">会议室设备报修台</h1>
              <p className="text-[11px] leading-tight text-slate-400">设备故障 · 快速报修 · 高效维修</p>
            </div>
          </div>
          <nav className="ml-10 flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-[1600px] px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}

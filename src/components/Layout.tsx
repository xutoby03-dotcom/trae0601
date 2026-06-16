import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, ClipboardCheck, RotateCcw, Archive, Wrench, ShieldCheck } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: '管理看板', icon: LayoutDashboard },
  { to: '/checkout', label: '领用管理', icon: ClipboardCheck },
  { to: '/return', label: '归还管理', icon: RotateCcw },
  { to: '/inventory', label: '护目镜台账', icon: Archive },
  { to: '/maintenance', label: '维修补购', icon: Wrench },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-slate-900 flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700/50">
          <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-sm font-semibold leading-tight">护目镜管理</h1>
            <p className="text-slate-500 text-xs">实验室安全装备系统</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-semibold">
              管
            </div>
            <div>
              <p className="text-white text-sm font-medium">管理员</p>
              <p className="text-slate-500 text-xs">实验室管理中心</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

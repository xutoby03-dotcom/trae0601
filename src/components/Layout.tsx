import { NavLink, Outlet } from 'react-router-dom'
import { Home, ShieldPlus, Users, BarChart3, ShieldCheck } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/policy/new', icon: ShieldPlus, label: '添加保单' },
  { to: '/members', icon: Users, label: '家庭成员' },
  { to: '/statistics', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-60 flex-shrink-0 bg-gradient-to-b from-[var(--navy-900)] to-[var(--navy-700)] flex flex-col">
        <div className="px-5 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[var(--amber-500)] flex items-center justify-center">
              <ShieldCheck size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold text-base leading-tight">保管家</h1>
              <p className="text-[var(--navy-300)] text-xs mt-0.5">家庭保险续费提醒</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active text-white' : 'text-[var(--navy-200)] hover:text-white'}`
              }
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-[var(--navy-400)] text-xs">数据存储在浏览器本地</p>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

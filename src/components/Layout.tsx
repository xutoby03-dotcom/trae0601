import { NavLink, Outlet } from 'react-router-dom'
import { Bus, LayoutDashboard, BarChart3 } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '首页', icon: Bus },
  { to: '/admin', label: '管理', icon: LayoutDashboard, adminOnly: true },
  { to: '/stats', label: '统计', icon: BarChart3 },
]

export default function Layout() {
  const { role, toggleRole } = useAppStore()

  return (
    <div className="min-h-screen bg-gray-50 font-[system-ui,-apple-system,'Segoe UI',Roboto,sans-serif]">
      <header className="sticky top-0 z-50 bg-[#1e3a5f] text-white shadow-lg">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Bus className="h-6 w-6 text-[#ff6b35]" />
            <span className="text-lg font-bold tracking-wide">通勤班车</span>
          </div>

          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
            <button
              onClick={() => role !== 'employee' && toggleRole()}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-all',
                role === 'employee'
                  ? 'bg-[#ff6b35] text-white shadow'
                  : 'text-white/70 hover:text-white'
              )}
            >
              员工
            </button>
            <button
              onClick={() => role !== 'admin' && toggleRole()}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-all',
                role === 'admin'
                  ? 'bg-[#ff6b35] text-white shadow'
                  : 'text-white/70 hover:text-white'
              )}
            >
              管理员
            </button>
          </div>
        </div>

        <nav className="mx-auto max-w-2xl border-t border-white/10">
          <div className="flex items-center justify-center gap-1 px-4 py-1">
            {navItems.map((item) => {
              if (item.adminOnly && role !== 'admin') return null
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        <Outlet />
      </main>
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Armchair, ClipboardCheck, SprayCan, Wrench, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/devices', icon: Armchair, label: '设备档案' },
  { to: '/pre-check', icon: ClipboardCheck, label: '使用前检查' },
  { to: '/post-record', icon: SprayCan, label: '使用后记录' },
  { to: '/maintenance', icon: Wrench, label: '维修提醒' },
]

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-zinc-200 shadow-sm">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-zinc-100">
          <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
            <Armchair className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-800 font-display">助浴椅管理</h1>
            <p className="text-[10px] text-zinc-400 tracking-wider">BATH CHAIR TRACKER</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-sm'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-zinc-100">
          <p className="text-[10px] text-zinc-300 text-center">安全第一 · 有据可查</p>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/30" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50">
            <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center">
                  <Armchair className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-base font-bold text-zinc-800 font-display">助浴椅管理</h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            <nav className="px-3 py-4 space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-zinc-500 hover:bg-zinc-50'
                    }`
                  }
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        </div>
      )}

      <div className="flex-1 md:ml-60">
        <header className="md:hidden sticky top-0 z-40 bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5 text-zinc-600" />
          </button>
          <h1 className="text-sm font-bold text-zinc-800 font-display">助浴椅管理</h1>
          <div className="w-5" />
        </header>
        <main className="p-4 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

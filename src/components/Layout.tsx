import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { FileEdit, ClipboardCheck, LayoutGrid, BarChart3, LogOut, User } from 'lucide-react'
import { useStore } from '@/store'

const NAV_ITEMS = [
  { to: '/apply', label: '申请', icon: FileEdit, roles: ['club'] },
  { to: '/review', label: '审批', icon: ClipboardCheck, roles: ['admin'] },
  { to: '/boards', label: '展板', icon: LayoutGrid, roles: ['club', 'admin'] },
  { to: '/dashboard', label: '汇总', icon: BarChart3, roles: ['admin'] },
]

export default function Layout() {
  const currentUser = useStore(s => s.currentUser)
  const logout = useStore(s => s.logout)
  const navigate = useNavigate()

  if (!currentUser) return null

  const visibleNavItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.role))

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen font-body">
      <aside className="fixed left-0 top-0 bottom-0 w-56 flex flex-col bg-brand-dark">
        <div className="px-6 py-6">
          <h1 className="font-display text-2xl text-brand-orange">展板管家</h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {visibleNavItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-brand-orange text-white'
                    : 'text-white/70 hover:text-white'
                }`
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 px-4 py-4">
          <div className="flex items-center gap-2 mb-3">
            <User className="h-4 w-4 text-white/50" />
            <span className="text-sm text-white/70 truncate">{currentUser.name}</span>
            <span className="text-xs text-white/40">
              {currentUser.role === 'admin' ? '管理员' : '社团'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <main className="ml-56 flex-1 overflow-auto p-6 bg-brand-cream">
        <Outlet />
      </main>
    </div>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, DoorOpen, BarChart3, Wrench } from 'lucide-react'

const navItems = [
  { path: '/', label: '维修白板', icon: LayoutDashboard },
  { path: '/rooms', label: '房间视图', icon: DoorOpen },
  { path: '/stats', label: '统计', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-[220px] min-h-screen bg-dark-900 text-white flex flex-col shrink-0">
      <div className="px-5 py-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-500 flex items-center justify-center shadow-button">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight">维修工单本</h1>
          <p className="text-[10px] text-white/40 mt-0.5">Home Repair Tracker</p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2">
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/' || location.pathname.startsWith('/order')
            : location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-white/10">
        <div className="text-[10px] text-white/30 text-center">数据存储在本地浏览器</div>
      </div>
    </aside>
  )
}

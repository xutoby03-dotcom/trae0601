import { NavLink, useLocation } from 'react-router-dom'
import { Package, Coffee, AlertTriangle, BarChart3, RotateCcw } from 'lucide-react'
import { useStore } from '@/hooks/useStore'

const navItems = [
  { path: '/receiving', label: '开箱入库', icon: Package },
  { path: '/stations', label: '吧台管理', icon: Coffee },
  { path: '/complaints', label: '客诉追踪', icon: AlertTriangle },
  { path: '/inventory', label: '库存总览', icon: BarChart3 },
]

export default function Sidebar() {
  const location = useLocation()
  const resetStore = useStore((s) => s.resetStore)

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-tea-900 text-tea-100 flex flex-col z-50">
      <div className="px-6 py-6 border-b border-tea-700">
        <h1 className="text-lg font-semibold tracking-wide">杯盖批次追踪</h1>
        <p className="text-xs text-tea-400 mt-1">Lid Batch Tracker</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-amber text-tea-900 font-semibold shadow-md'
                  : 'text-tea-300 hover:bg-tea-800 hover:text-tea-100'
              }`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={resetStore}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-tea-400 hover:bg-tea-800 hover:text-tea-200 transition-all w-full"
        >
          <RotateCcw size={16} />
          <span>重置数据</span>
        </button>
      </div>
    </aside>
  )
}

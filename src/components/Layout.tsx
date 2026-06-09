import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  CalendarPlus,
  Settings,
  BarChart3,
  Moon,
} from 'lucide-react'

const NAV_ITEMS = [
  { to: '/', label: '座位总览', icon: LayoutGrid },
  { to: '/reserve', label: '预约午休', icon: CalendarPlus },
  { to: '/admin', label: '管理后台', icon: Settings },
  { to: '/stats', label: '数据统计', icon: BarChart3 },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-[var(--bg-secondary)] border-r border-slate-700/50 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <Moon className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">午休预约</h1>
              <p className="text-xs text-slate-400">办公室座位管理系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs text-slate-400 mb-1">当前模式</p>
            <p className="text-sm font-medium text-slate-200">
              {location.pathname === '/admin' ? '管理员' : '员工'}
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="p-8"
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { PawPrint, Calendar, BarChart3 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePetStore } from '@/store/usePetStore'
import { MEMBER_COLORS } from '@/types'

const NAV_ITEMS = [
  { path: '/', label: '宠物管理', icon: PawPrint },
  { path: '/schedule', label: '日程排班', icon: Calendar },
  { path: '/stats', label: '统计', icon: BarChart3 },
]

export default function Layout() {
  const members = usePetStore((s) => s.members)
  const fosterModeActive = usePetStore((s) => s.fosterModeActive)

  return (
    <div className="flex h-screen bg-orange-50/50">
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-orange-100 bg-white">
        <div className="flex items-center gap-2 px-6 py-5 border-b border-orange-100">
          <span className="text-2xl">🐾</span>
          <h1 className="font-display text-xl font-bold text-brand-orange">
            宠物喂养轮班表
          </h1>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-100 text-brand-orange'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-brand-orange'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-orange-100">
          {fosterModeActive && (
            <div className="mb-3 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-center">
              <span className="text-xs font-semibold text-red-600">托管模式</span>
            </div>
          )}
          <p className="text-xs text-gray-400 mb-2">家庭成员</p>
          <div className="flex -space-x-1.5">
            {members.map((m, i) => (
              <div
                key={m.id}
                className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white"
                style={{ backgroundColor: MEMBER_COLORS[i % MEMBER_COLORS.length] }}
                title={m.name}
              >
                {m.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 pb-20 md:pb-0 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 inset-x-0 md:hidden bg-white border-t border-orange-100 flex justify-around items-center h-16 z-50">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-brand-orange' : 'text-gray-400'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

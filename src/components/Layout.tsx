import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, Users, BookOpen, Package, ClipboardList, BarChart3, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', icon: CalendarDays, label: '排班日历' },
  { to: '/members', icon: Users, label: '家庭成员' },
  { to: '/recipes', icon: BookOpen, label: '早餐菜谱' },
  { to: '/inventory', icon: Package, label: '食材库存' },
  { to: '/records', icon: ClipboardList, label: '就餐记录' },
  { to: '/stats', icon: BarChart3, label: '统计分析' },
]

export default function Layout() {
  return (
    <div className="flex h-screen bg-orange-50/50">
      <aside className="w-56 flex-shrink-0 border-r border-orange-100 bg-white/80 backdrop-blur-sm flex flex-col">
        <div className="px-5 py-5 flex items-center gap-2.5 border-b border-orange-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200">
            <Sun className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-orange-900 tracking-tight">早餐排班</h1>
            <p className="text-[10px] text-orange-400 -mt-0.5">Breakfast Planner</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-orange-100 text-orange-700 shadow-sm'
                    : 'text-orange-900/60 hover:bg-orange-50 hover:text-orange-700'
                )
              }
            >
              <item.icon className="w-[18px] h-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-orange-100">
          <p className="text-[10px] text-orange-300">家庭早餐备餐排班系统 v1.0</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <div className="max-w-[1200px] mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

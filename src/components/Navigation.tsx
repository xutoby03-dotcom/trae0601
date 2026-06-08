import { NavLink } from 'react-router-dom'
import { LayoutGrid, BarChart3, Download } from 'lucide-react'

const navItems = [
  { path: '/', label: '任务墙', icon: LayoutGrid },
  { path: '/stats', label: '统计', icon: BarChart3 },
  { path: '/export', label: '导出', icon: Download },
]

export default function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 metal-bar">
      <div className="max-w-[1200px] mx-auto flex items-center justify-around py-2 px-4">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 font-handwritten text-lg ${
                isActive
                  ? 'text-fridge-metal animate-magnet-bounce bg-white/30'
                  : 'text-fridge-dark hover:text-fridge-metal hover:bg-white/20'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                <span className={isActive ? 'font-bold' : ''}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

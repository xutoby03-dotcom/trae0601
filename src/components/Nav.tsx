import { NavLink } from 'react-router-dom'
import { Home, Users, PlusCircle, BarChart3 } from 'lucide-react'

export default function Nav() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
      isActive
        ? 'text-ocean-700 bg-ocean-50 shadow-sm'
        : 'text-gray-400 hover:text-ocean-500 hover:bg-ocean-50/50'
    }`

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-white/30">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        <NavLink to="/" className={linkClass} end>
          <Home size={22} strokeWidth={2.5} />
          <span className="text-xs font-medium font-display">首页</span>
        </NavLink>
        <NavLink to="/record" className={linkClass}>
          <PlusCircle size={22} strokeWidth={2.5} />
          <span className="text-xs font-medium font-display">记录</span>
        </NavLink>
        <NavLink to="/members" className={linkClass}>
          <Users size={22} strokeWidth={2.5} />
          <span className="text-xs font-medium font-display">成员</span>
        </NavLink>
        <NavLink to="/stats" className={linkClass}>
          <BarChart3 size={22} strokeWidth={2.5} />
          <span className="text-xs font-medium font-display">统计</span>
        </NavLink>
      </div>
    </nav>
  )
}

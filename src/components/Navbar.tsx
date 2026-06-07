import { NavLink, useLocation } from 'react-router-dom'
import { Home, Clock, Download, PenLine } from 'lucide-react'
import { THEME_COLORS } from '@/lib/utils'

const navItems = [
  { to: '/', icon: Home, label: '信封墙' },
  { to: '/timeline', icon: Clock, label: '时间线' },
  { to: '/backup', icon: Download, label: '备份' },
]

export default function Navbar() {
  const location = useLocation()
  const isCreate = location.pathname.startsWith('/create')

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#4A3228]/40 backdrop-blur-xl"
      style={{ background: `${THEME_COLORS.darkBrown}E6` }}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-around px-4 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors duration-200 ${
                isActive && !isCreate ? 'text-[#D4A574]' : 'text-[#8B7355] hover:text-[#E8C99B]'
              }`
            }
          >
            <Icon size={20} strokeWidth={1.5} />
            <span>{label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/create"
          className={`flex flex-col items-center gap-0.5 px-3 py-1.5 text-xs transition-colors duration-200 ${
            isCreate ? 'text-[#D4A574]' : 'text-[#8B7355] hover:text-[#E8C99B]'
          }`}
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110"
            style={{ background: `linear-gradient(135deg, ${THEME_COLORS.gold}, ${THEME_COLORS.lightGold})` }}
          >
            <PenLine size={18} className="text-[#2C1810]" strokeWidth={2} />
          </div>
          <span className="mt-0.5">写信</span>
        </NavLink>
      </div>
    </nav>
  )
}

import { NavLink } from 'react-router-dom'
import { Store, PlusCircle, BarChart3 } from 'lucide-react'

const links = [
  { to: '/', label: '集市', icon: Store },
  { to: '/publish', label: '发布', icon: PlusCircle },
  { to: '/stats', label: '统计', icon: BarChart3 },
]

export default function Navbar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-carbon-700/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between h-14 px-4">
        <span className="font-display text-brand-400 text-2xl select-none">
          闲估集市
        </span>

        <div className="flex items-center gap-6">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-brand-400 underline underline-offset-4'
                    : 'text-carbon-200 hover:text-brand-300'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}

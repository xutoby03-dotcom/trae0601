import { NavLink } from 'react-router-dom'
import { Recycle, Home, Plus, Wrench, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '灵感板' },
  { to: '/register', icon: Plus, label: '登记' },
  { to: '/materials', icon: Wrench, label: '材料箱' },
  { to: '/stats', icon: BarChart3, label: '统计' },
]

export default function Navbar() {
  return (
    <>
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-cream-100/80 backdrop-blur-md border-b border-cream-300/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-terra-500 to-sage-400 flex items-center justify-center shadow-soft group-hover:shadow-card transition-shadow">
              <Recycle className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-sage-800">
              旧衣改造
            </span>
          </NavLink>
          <div className="flex items-center gap-1">
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-terra-500/10 text-terra-600'
                      : 'text-sage-600 hover:bg-cream-200 hover:text-sage-800'
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

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-cream-50/90 backdrop-blur-md border-t border-cream-300/50 pb-safe">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-terra-500'
                    : 'text-sage-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

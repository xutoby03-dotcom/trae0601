import { NavLink } from 'react-router-dom'
import { Shirt, Palette, Clock, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', label: '衣橱', icon: Shirt },
  { to: '/outfit', label: '搭配', icon: Palette },
  { to: '/idle', label: '闲置', icon: Clock },
  { to: '/stats', label: '统计', icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream font-body">
      <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-white/80 backdrop-blur-sm border-r border-warm-300/50 flex flex-col z-40">
        <div className="p-6 border-b border-warm-300/30">
          <h1 className="font-display text-2xl font-bold text-warm-500 tracking-tight">
            Wardrobe
          </h1>
          <p className="text-xs text-warm-400 mt-1 tracking-wider uppercase">
            Rotation
          </p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-warm-500 text-white shadow-md shadow-warm-500/25'
                    : 'text-charcoal/70 hover:bg-warm-200/60 hover:text-warm-500'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 m-3 rounded-xl bg-gradient-to-br from-warm-500 to-warm-600 text-white">
          <p className="text-xs font-medium opacity-90">穿搭轮换</p>
          <p className="text-[10px] mt-1 opacity-70">让每件衣物都被看见</p>
        </div>
      </aside>
      <main className="ml-[220px] min-h-screen">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-warm-300/30 md:hidden z-50">
        <div className="flex justify-around py-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium ${
                  isActive ? 'text-warm-500' : 'text-charcoal/50'
                }`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

import { NavLink, Outlet } from 'react-router-dom'
import { Car, Wrench, AlertTriangle, BarChart3, Home } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/vehicles', icon: Car, label: '车辆' },
  { to: '/maintenance', icon: Wrench, label: '保养' },
  { to: '/faults', icon: AlertTriangle, label: '故障' },
  { to: '/statistics', icon: BarChart3, label: '统计' },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Car className="w-7 h-7 text-blue-600" />
          <h1 className="text-lg font-bold text-gray-900">车辆保养账本</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="max-w-5xl mx-auto flex">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  isActive
                    ? 'text-blue-600 font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-0.5" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, BookOpen, BarChart3 } from 'lucide-react'
import { useUserStore } from '@/store/userStore'

const navItems = [
  { path: '/', label: '工具柜', icon: Home },
  { path: '/register', label: '登记', icon: PlusCircle },
  { path: '/borrowings', label: '借还', icon: BookOpen },
  { path: '/stats', label: '统计', icon: BarChart3 },
]

export default function Navbar() {
  const location = useLocation()
  const getCurrentUser = useUserStore(s => s.getCurrentUser)
  const user = getCurrentUser()

  return (
    <nav className="bg-wood-800 text-wood-50 shadow-wood-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-grass-600 flex items-center justify-center shadow-wood group-hover:bg-grass-500 transition-colors">
              <Home size={18} className="text-white" />
            </div>
            <span className="font-serif-sc text-lg font-semibold tracking-wide">邻里工具柜</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-wood-700 text-grass-300'
                      : 'text-wood-200 hover:bg-wood-700 hover:text-wood-50'
                  }`}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full border-2 border-grass-500"
              />
              <div className="hidden sm:block">
                <div className="text-xs font-medium leading-tight">{user.name}</div>
                <div className="text-xs text-grass-400 leading-tight">
                  信用 {user.creditScore}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden border-t border-wood-700">
        <div className="flex justify-around py-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg text-xs transition-all ${
                  isActive ? 'text-grass-400' : 'text-wood-300'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

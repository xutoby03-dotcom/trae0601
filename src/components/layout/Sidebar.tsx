import { cn } from '@/lib/utils'
import { BookOpen, LayoutDashboard, Music, Users } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface MenuItem {
  to: string
  label: string
  icon: React.ElementType
}

const menuItems: MenuItem[] = [
  { to: '/', label: '看板', icon: LayoutDashboard },
  { to: '/scores', label: '曲谱档案', icon: Music },
  { to: '/members', label: '队员档案', icon: Users },
  { to: '/borrow', label: '借阅管理', icon: BookOpen },
]

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-primary-800 flex flex-col fixed left-0 top-0">
      <div className="p-6 border-b border-primary-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-500 flex items-center justify-center">
            <Music className="w-5 h-5 text-primary-900" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">合唱队曲谱</h1>
            <p className="text-primary-300 text-xs">借阅管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200',
                    isActive
                      ? 'bg-primary-700 text-white shadow-inner'
                      : 'text-primary-200 hover:bg-primary-700/50 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-accent-400 flex items-center justify-center">
            <span className="text-primary-900 text-sm font-semibold">管</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">管理员</p>
            <p className="text-primary-400 text-xs">admin@choir.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

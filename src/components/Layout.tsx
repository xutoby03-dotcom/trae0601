import { NavLink, Outlet } from 'react-router-dom'
import { Home, PlusCircle, BarChart3, Search, PawPrint } from 'lucide-react'

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/add-pet', icon: PlusCircle, label: '添加' },
  { to: '/stats', icon: BarChart3, label: '统计' },
  { to: '/search', icon: Search, label: '查询' },
]

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-20 lg:w-56 flex-col border-r border-warm-100 bg-white/80 backdrop-blur-sm fixed h-full z-10">
        <div className="flex items-center gap-2 px-4 lg:px-6 py-6 border-b border-warm-100">
          <div className="w-10 h-10 bg-warm-400 rounded-xl flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div className="hidden lg:block">
            <h1 className="font-serif font-semibold text-warm-800 text-sm leading-tight">宠物档案本</h1>
            <p className="text-[10px] text-warm-400">健康管理小助手</p>
          </div>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2 lg:px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-warm-400 text-white shadow-sm'
                    : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 hidden lg:block">
          <div className="bg-warm-50 rounded-xl p-3 text-center">
            <PawPrint className="w-6 h-6 text-warm-300 mx-auto mb-1" />
            <p className="text-[10px] text-warm-400">守护毛孩子健康</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-20 lg:ml-56 pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-warm-100 z-10">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'text-warm-500' : 'text-warm-400'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

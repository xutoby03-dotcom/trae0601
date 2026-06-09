import { NavLink, Outlet } from 'react-router-dom'
import { Refrigerator, PackagePlus, HandCoins, SprayCan, BarChart3 } from 'lucide-react'

const navItems = [
  { path: '/', label: '冰箱看板', icon: Refrigerator },
  { path: '/register', label: '食物登记', icon: PackagePlus },
  { path: '/claim', label: '领取食物', icon: HandCoins },
  { path: '/cleaning', label: '清洁记录', icon: SprayCan },
  { path: '/stats', label: '统计看板', icon: BarChart3 },
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Refrigerator className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">社区共享冰箱</h1>
                <p className="text-[10px] text-emerald-100 -mt-0.5">爱心冰箱 · 传递温暖 · 减少浪费</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="bg-stone-100 border-t border-stone-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-stone-400">
          社区共享冰箱看板 · 让每一份食物都不被浪费
        </div>
      </footer>
    </div>
  )
}

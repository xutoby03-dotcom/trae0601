import { NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Ear,
  ClipboardList,
  Bell,
  Wrench,
  BarChart3,
  Volume2,
} from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/devices', label: '助听器', icon: Ear },
  { path: '/daily', label: '每日记录', icon: ClipboardList },
  { path: '/reminders', label: '提醒', icon: Bell },
  { path: '/maintenance', label: '维护', icon: Wrench },
  { path: '/statistics', label: '统计', icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#FDF8F3] flex">
      <aside className="hidden md:flex md:w-60 lg:w-64 flex-col bg-indigo text-white p-6 fixed h-full z-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-amber flex items-center justify-center">
            <Volume2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight">助听器管家</h1>
            <p className="text-xs text-indigo-100 opacity-70">电量无忧，听力安心</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base transition-all duration-200 ${
                  isActive
                    ? 'bg-amber text-white font-semibold shadow-lg shadow-amber/30'
                    : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto pt-4 border-t border-white/10">
          <p className="text-xs text-indigo-100 opacity-50">关爱听力 · 温暖生活</p>
        </div>
      </aside>

      <main className="flex-1 md:ml-60 lg:ml-64 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-indigo-50 z-20 px-2 py-1">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-2 rounded-lg transition-all duration-200 min-w-[48px] ${
                  isActive
                    ? 'text-amber font-semibold'
                    : 'text-indigo/40 hover:text-indigo/70'
                }`}
              >
                <Icon size={20} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

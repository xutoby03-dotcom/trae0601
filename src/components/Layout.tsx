import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  ClipboardList,
  Ticket,
  Megaphone,
  BarChart3,
  Menu,
  X,
  Recycle,
} from 'lucide-react'

const menuItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/points', label: '点位管理', icon: MapPin },
  { path: '/inspections', label: '巡查记录', icon: ClipboardList },
  { path: '/tickets', label: '问题派单', icon: Ticket },
  { path: '/promotions', label: '宣传记录', icon: Megaphone },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-gray-50">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-emerald-700 to-emerald-800 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center px-4 border-b border-emerald-600/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">垃圾分类督导</h1>
                <p className="text-xs text-emerald-200">管理系统</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path)
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-emerald-600/30">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-emerald-200 hover:bg-white/10 hover:text-white transition-colors"
          >
            {sidebarOpen ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {menuItems.find((m) => location.pathname.startsWith(m.path))?.label || '系统'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">张督导</p>
              <p className="text-xs text-gray-500">管理员</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <span className="text-emerald-700 font-medium">张</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

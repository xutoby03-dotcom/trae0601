import { NavLink, Outlet } from 'react-router-dom'
import { Map, Clock, Upload, BookOpen, Download } from 'lucide-react'

const tabs = [
  { to: '/', label: '地图路线', icon: Map },
  { to: '/timeline', label: '时间线', icon: Clock },
  { to: '/upload', label: '上传照片', icon: Upload },
  { to: '/story', label: '故事', icon: BookOpen },
  { to: '/export', label: '导出', icon: Download },
]

export default function Layout() {
  return (
    <div className="font-body min-h-screen bg-warm-cream text-warm-brown">
      <main className="pb-20">
        <Outlet />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-warm-brown/10 bg-warm-cream/95 backdrop-blur-sm">
        <div className="flex items-center justify-around">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-3 py-2 text-xs transition-colors ${
                  isActive
                    ? 'text-warm-orange'
                    : 'text-warm-brown/50 hover:text-warm-brown/80'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

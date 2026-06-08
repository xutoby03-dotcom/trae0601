import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, Wrench, BarChart3, Activity } from 'lucide-react'

const navItems = [
  { path: '/', icon: Home, label: '装备架' },
  { path: '/record', icon: Activity, label: '记录' },
  { path: '/add', icon: Plus, label: '添加' },
  { path: '/maintenance', icon: Wrench, label: '保养' },
  { path: '/stats', icon: BarChart3, label: '统计' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#0F1F17] text-[#F5F0EB]">
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-6">{children}</div>
      <nav className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#0F1F17]/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 rounded-xl px-4 py-2 transition-all duration-200 ${
                  isActive
                    ? 'text-[#FF6B35]'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

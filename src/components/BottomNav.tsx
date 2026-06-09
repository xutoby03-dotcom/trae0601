import { useLocation, useNavigate } from 'react-router-dom'
import { Smartphone, BarChart3 } from 'lucide-react'

const NAV_ITEMS = [
  { path: '/', label: '手机列表', icon: Smartphone },
  { path: '/stats', label: '统计', icon: BarChart3 },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const hidden = location.pathname.startsWith('/add') || location.pathname.startsWith('/phone/')

  if (hidden) return null

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {NAV_ITEMS.map((item) => {
          const active = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-0.5 px-4 py-1"
            >
              <item.icon
                size={22}
                className="transition-colors"
                style={{ color: active ? '#1B4332' : '#9ca3af' }}
              />
              <span
                className="text-xs transition-colors"
                style={{ color: active ? '#1B4332' : '#9ca3af', fontWeight: active ? 600 : 400 }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

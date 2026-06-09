import { useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { path: '/', label: '首页', icon: Home },
  { path: '/add', label: '添加', icon: PlusCircle },
  { path: '/stats', label: '统计', icon: BarChart3 },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-around py-2">
        {TABS.map((tab) => {
          const isActive = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-6 py-1.5 transition-colors',
                isActive ? 'text-sky-500' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <tab.icon className={cn('h-5 w-5', isActive && 'stroke-[2.5]')} />
              <span className={cn('text-xs', isActive && 'font-semibold')}>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

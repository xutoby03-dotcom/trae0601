import { Home, PlusCircle, ClipboardList, BarChart3 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const tabs = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/register', icon: PlusCircle, label: '登记' },
  { path: '/my-spots', icon: ClipboardList, label: '我的' },
  { path: '/stats', icon: BarChart3, label: '统计' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(tab.path)
          const Icon = tab.icon
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

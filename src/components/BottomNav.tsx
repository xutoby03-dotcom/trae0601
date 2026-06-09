import { useLocation, useNavigate } from 'react-router-dom'
import { Home, PenSquare, BookOpen, BarChart3 } from 'lucide-react'
import { motion } from 'framer-motion'

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/record', icon: PenSquare, label: '记录' },
  { path: '/rules', icon: BookOpen, label: '规则' },
  { path: '/stats', icon: BarChart3, label: '统计' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-stone-200 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="navIndicator"
                  className="absolute inset-0 bg-emerald-50 rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <item.icon
                className={`relative z-10 w-5 h-5 transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-stone-400'
                }`}
              />
              <span
                className={`relative z-10 text-xs font-medium transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-stone-400'
                }`}
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

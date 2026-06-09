import { useLocation, useNavigate } from 'react-router-dom'
import { Map, BarChart3, Plus, Footprints, User } from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', Icon: Map },
  { path: '/stats', label: '统计', Icon: BarChart3 },
  { path: '/create', label: '发起', Icon: Plus },
  { path: '/my', label: '我的', Icon: Footprints },
  { path: '#', label: '我的', Icon: User },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0B1120]/90 backdrop-blur-xl border-t border-white/5">
      <div className="flex items-end justify-around max-w-lg mx-auto h-16 px-2">
        {navItems.map(({ path, label, Icon }) => {
          const isActive = location.pathname === path
          const isCreate = path === '/create'

          return (
            <button
              key={path}
              onClick={() => path !== '#' && navigate(path)}
              className={`relative flex flex-col items-center justify-center gap-0.5 pt-1 pb-2 flex-1 transition-colors duration-200 ${
                isCreate ? '' : isActive ? 'text-[#00FF88]' : 'text-[#4B5563]'
              }`}
            >
              {isActive && !isCreate && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-[#00FF88] shadow-[0_0_8px_#00FF88]" />
              )}
              {isCreate ? (
                <span className="relative -mt-5 flex items-center justify-center w-14 h-14 rounded-full bg-[#00FF88] shadow-[0_0_20px_rgba(0,255,136,0.5)] animate-[neonPulse_2s_ease-in-out_infinite]">
                  <Icon size={26} className="text-[#0B1120]" strokeWidth={2.5} />
                </span>
              ) : (
                <Icon size={22} strokeWidth={1.8} />
              )}
              <span className={`text-[10px] ${isCreate ? 'text-[#00FF88] font-semibold mt-0.5' : ''}`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
      <style>{`
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,136,0.5); }
          50% { box-shadow: 0 0 32px rgba(0,255,136,0.8), 0 0 60px rgba(0,255,136,0.3); }
        }
      `}</style>
    </nav>
  )
}

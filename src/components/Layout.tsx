import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, PlusCircle, Leaf, BarChart3, AlertTriangle, X } from 'lucide-react'
import { usePlantStore } from '@/store/plantStore'

const NAV_ITEMS = [
  { to: '/', label: '绿植墙', icon: Home },
  { to: '/register', label: '登记植物', icon: PlusCircle },
  { to: '/my-plants', label: '我的绿植', icon: Leaf },
  { to: '/stats', label: '统计', icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const alerts = usePlantStore((s) => s.alerts)
  const unresolvedCount = alerts.filter((a) => !a.resolved).length
  const [alertDismissed, setAlertDismissed] = useState(false)

  const showBanner = unresolvedCount > 0 && !alertDismissed

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="sticky top-0 z-30 bg-emerald-700 text-white shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-wide">
            <span>🌱</span>
            <span>绿植领养墙</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white'
                      : 'text-emerald-100 hover:bg-emerald-600/50 hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {showBanner && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-2.5">
            <button
              onClick={() => navigate('/alerts')}
              className="flex items-center gap-2 text-amber-800 text-sm hover:text-amber-900 transition-colors cursor-pointer text-left"
            >
              <AlertTriangle size={16} className="shrink-0" />
              <span>
                当前有 <strong>{unresolvedCount}</strong> 条未处理预警，点击查看详情 →
              </span>
            </button>
            <button
              onClick={() => setAlertDismissed(true)}
              className="text-amber-600 hover:text-amber-800 transition-colors p-0.5 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-white border-t border-stone-200 shadow-[0_-1px_4px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-around h-14">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors px-2 py-1 ${
                  active ? 'text-emerald-700' : 'text-stone-400 hover:text-emerald-600'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

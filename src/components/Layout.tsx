import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCarpoolStore } from '@/store/useCarpoolStore'
import { Car, Clock, PlusCircle, Calculator, History, Home } from 'lucide-react'

const navItems = [
  { path: '/', label: '拼车', icon: Home },
  { path: '/publish', label: '发布', icon: PlusCircle },
  { path: '/calculator', label: '计算器', icon: Calculator },
  { path: '/history', label: '历史', icon: History },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const initMockData = useCarpoolStore((s) => s.initMockData)

  useEffect(() => {
    initMockData()
  }, [initMockData])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/30 to-white">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-orange-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-md shadow-orange-200 group-hover:shadow-lg group-hover:shadow-orange-300 transition-shadow">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 tracking-tight">邻里拼车</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-orange-100 text-orange-700 shadow-sm'
                      : 'text-slate-500 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white/90 backdrop-blur-xl border-t border-orange-100">
        <nav className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  isActive ? 'text-orange-600' : 'text-slate-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

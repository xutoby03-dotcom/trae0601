import { Link, Outlet, useLocation } from 'react-router-dom'
import { Home, PlusCircle, ShoppingCart, Download, Pill } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', label: '药箱', icon: Home },
  { path: '/add', label: '添加', icon: PlusCircle },
  { path: '/restock', label: '补货', icon: ShoppingCart },
  { path: '/export', label: '导出', icon: Download },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <header className="sticky top-0 z-50 bg-[#FFF8F0]/90 backdrop-blur-md border-b border-amber-100/50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200 group-hover:shadow-lg group-hover:shadow-emerald-300 transition-all">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-amber-900 tracking-tight">家庭药箱</span>
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-amber-100/50 shadow-[0_-2px_20px_rgba(0,0,0,0.04)]">
        <div className="max-w-5xl mx-auto flex items-center justify-around h-16">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-emerald-600 scale-105'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-sm')} />
                <span className={cn('text-[11px] font-medium', isActive && 'font-semibold')}>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

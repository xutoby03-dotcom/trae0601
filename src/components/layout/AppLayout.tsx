import { useState } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import { PawPrint, Home, ClipboardList, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/foster', label: '寄养交接', icon: ClipboardList },
]

export default function AppLayout() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r-2 border-warm-200 bg-cream lg:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <PawPrint className="h-8 w-8 text-warm-500" />
          <h1 className="font-display text-xl font-bold text-warm-800">
            宠物寄养托付清单
          </h1>
        </div>

        <nav className="mt-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.to)
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-warm-500 text-warm-50 shadow-md'
                    : 'text-warm-600 hover:bg-warm-100'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto px-6 pb-8">
          <div className="flex flex-wrap justify-center gap-4 opacity-10">
            {[...Array(6)].map((_, i) => (
              <PawPrint
                key={i}
                className="h-8 w-8 text-warm-500"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            ))}
          </div>
        </div>
      </aside>

      <div className="fixed left-0 right-0 top-0 z-30 flex h-14 items-center border-b-2 border-warm-200 bg-cream px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-warm-600 hover:bg-warm-100"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <div className="ml-3 flex items-center gap-2">
          <PawPrint className="h-5 w-5 text-warm-500" />
          <span className="font-display text-base font-bold text-warm-800">
            宠物寄养托付清单
          </span>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-20 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-warm-900/30" />
          <nav
            className="absolute left-0 top-14 w-60 border-r-2 border-warm-200 bg-cream p-3 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to)
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all',
                    isActive
                      ? 'bg-warm-500 text-warm-50'
                      : 'text-warm-600 hover:bg-warm-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      <main className="min-h-screen flex-1 lg:ml-60">
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-4 lg:px-8 lg:pt-8">
          <div className="mt-14 lg:mt-0">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}

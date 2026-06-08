import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, BarChart3, Flower2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', label: '我的菜园', icon: Home },
  { path: '/add', label: '添加植物', icon: PlusCircle },
  { path: '/stats', label: '统计', icon: BarChart3 },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-wood-100/90 backdrop-blur-sm border-b border-wood-300/40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:animate-wiggle">🌱</span>
            <h1 className="font-handwriting text-xl text-leaf-700">露台小菜园观察本</h1>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path ||
                (item.path === '/' && location.pathname.startsWith('/plant'))
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-serif transition-all duration-200',
                    isActive
                      ? 'bg-leaf-100 text-leaf-700 font-semibold shadow-sm'
                      : 'text-earth-600 hover:bg-leaf-50 hover:text-leaf-600'
                  )}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <nav className="md:hidden sticky bottom-0 z-50 bg-wood-100/95 backdrop-blur-sm border-t border-wood-300/40 shadow-lg">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-leaf-600'
                    : 'text-earth-400 hover:text-leaf-500'
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-serif">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      <footer className="text-center py-4 text-earth-400 text-xs font-serif">
        <div className="flex items-center justify-center gap-1">
          <Flower2 size={12} />
          <span>用心记录，静待花开</span>
          <Flower2 size={12} />
        </div>
      </footer>
    </div>
  )
}

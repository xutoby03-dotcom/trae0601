import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, BarChart3 } from 'lucide-react'

function NavLink({ to, children }: { to: string; children: ReactNode }) {
  const location = useLocation()
  const active = location.pathname === to
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        active
          ? 'bg-primary text-white shadow-md'
          : 'text-gray-600 hover:bg-orange-50 hover:text-primary'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-warm-bg">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-warm-border shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🍊</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">临期拼单墙</h1>
              <p className="text-xs text-gray-400">邻里互助 · 减少浪费</p>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/">
              <Home size={16} />
              <span className="hidden sm:inline">拼单墙</span>
            </NavLink>
            <NavLink to="/publish">
              <PlusCircle size={16} />
              <span className="hidden sm:inline">发布</span>
            </NavLink>
            <NavLink to="/stats">
              <BarChart3 size={16} />
              <span className="hidden sm:inline">统计</span>
            </NavLink>
          </nav>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4 pb-24">
        {children}
      </main>
    </div>
  )
}

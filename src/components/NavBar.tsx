import { Link, useLocation } from 'react-router-dom'
import { Film, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 bg-night/95 backdrop-blur-md border-b border-night-lighter/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-orange flex items-center justify-center
                          group-hover:bg-orange-light transition-colors duration-200">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-cream">
              星光影院
            </span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              to="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive('/') ? 'bg-orange/20 text-orange' : 'text-cream/70 hover:text-cream hover:bg-night-lighter/50'}`}
            >
              <Film className="w-4 h-4" />
              放映场次
            </Link>
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive('/dashboard') ? 'bg-orange/20 text-orange' : 'text-cream/70 hover:text-cream hover:bg-night-lighter/50'}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              管理看板
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

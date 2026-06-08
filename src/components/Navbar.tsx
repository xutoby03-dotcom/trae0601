import { Link, useLocation } from 'react-router-dom'
import { Plus, History, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b border-dark-border bg-dark-surface/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <span className="font-heading text-xl font-bold text-white">
            活动报名看板
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/history"
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              location.pathname === '/history'
                ? 'bg-dark-hover text-accent'
                : 'text-zinc-400 hover:bg-dark-hover hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">历史活动</span>
          </Link>
          <Link
            to="/activity/new"
            className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">新建活动</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}

import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Boxes, ClipboardList, Package } from 'lucide-react'

const menuItems = [
  { to: '/', icon: LayoutDashboard, label: '数据看板' },
  { to: '/lockers', icon: Boxes, label: '柜格档案' },
  { to: '/packages', icon: ClipboardList, label: '包裹记录' },
]

interface SidebarProps {
  onQuickAction?: (action: 'check-in' | 'check-out') => void
}

export default function Sidebar({ onQuickAction }: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-slate-900 text-white flex flex-col shrink-0">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-700/50">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
          <Package size={22} className="text-white" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-lg tracking-wide">快递代收柜</h1>
          <p className="text-xs text-slate-400">前台管理系统</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {menuItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={20} />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 space-y-2 border-t border-slate-700/50">
        <p className="px-4 text-xs text-slate-500 mb-1">快捷操作</p>
        <button
          onClick={() => onQuickAction?.('check-in')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-500/10 text-primary-400 hover:bg-primary-500/20 transition-colors border border-primary-500/30"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
          <span className="font-medium">包裹入柜</span>
        </button>
        <button
          onClick={() => onQuickAction?.('check-out')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-warning-500/10 text-warning-400 hover:bg-warning-500/20 transition-colors border border-warning-500/30"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          <span className="font-medium">包裹取件</span>
        </button>
      </div>
    </aside>
  )
}

import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Server,
  Flame,
  Sparkles,
  AlertTriangle,
  Wind,
} from 'lucide-react'
import { useStore } from '@/store/useStore'

const navItems = [
  { path: '/', label: '首页', icon: LayoutDashboard },
  { path: '/device', label: '设备档案', icon: Server },
  { path: '/drying', label: '烘干记录', icon: Flame },
  { path: '/cleaning', label: '清理记录', icon: Sparkles },
]

export default function Sidebar() {
  const location = useLocation()
  const devices = useStore((s) => s.devices)
  const dryingRecords = useStore((s) => s.dryingRecords)
  const getConsecutiveUncleaned = useStore((s) => s.getConsecutiveUncleaned)
  const isDurationAbnormal = useStore((s) => s.isDurationAbnormal)

  const hasUncleanedWarning = devices.some(
    (d) => getConsecutiveUncleaned(d.id) >= 3
  )
  const hasDurationWarning = dryingRecords.some((r) => isDurationAbnormal(r))

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-surface-800 border-r border-surface-500/30 flex flex-col z-50">
      <div className="px-5 py-6 border-b border-surface-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <Wind className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h1 className="font-display text-sm tracking-wider text-brand-400">
              LINT GUARD
            </h1>
            <p className="text-xs text-surface-300 font-body">绒毛卫士</p>
          </div>
        </div>
      </div>

      {(hasUncleanedWarning || hasDurationWarning) && (
        <div className="mx-3 mt-4 p-3 rounded-lg bg-danger-500/10 border border-danger-500/30">
          <div className="flex items-center gap-2 text-danger-400 text-xs font-medium">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            <span>安全警告</span>
          </div>
          {hasUncleanedWarning && (
            <p className="text-[11px] text-danger-400/80 mt-1">
              滤网连续未清理
            </p>
          )}
          {hasDurationWarning && (
            <p className="text-[11px] text-danger-400/80 mt-1">
              烘干时间异常
            </p>
          )}
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500/15 text-brand-400 shadow-lg shadow-brand-500/5'
                  : 'text-surface-300 hover:bg-surface-600/50 hover:text-white'
              }`}
            >
              <item.icon className="w-[18px] h-[18px]" />
              <span className="font-body">{item.label}</span>
              {item.path === '/drying' && hasDurationWarning && (
                <span className="ml-auto w-2 h-2 rounded-full bg-danger-500 animate-pulse" />
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="px-4 py-4 border-t border-surface-500/30">
        <p className="text-[10px] text-surface-400 font-display tracking-wider">
          v1.0.0
        </p>
      </div>
    </aside>
  )
}

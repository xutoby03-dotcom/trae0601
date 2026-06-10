import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Calendar, FileText, ClipboardList,
  BarChart3, Building2, Sparkles, UserCircle2, ChevronRight,
  AlertTriangle, CalendarClock
} from 'lucide-react'
import { useApp } from '@/store/app'
import { useRole } from '@/store/role'
import { cn } from '@/lib/utils'

function Sidebar() {
  const navigate = useNavigate()
  const { exhibitions, currentExhibitionId, setCurrentExhibition } = useApp()
  const { role, setRole } = useRole()

  const adminNav: { label: string; to: string; icon: any; disabled?: boolean }[] = [
    { label: '场地平面图', to: '/', icon: LayoutGrid },
    { label: '展会管理', to: '/exhibitions', icon: Calendar },
    { label: '申请审核', to: `/exhibitions/${currentExhibitionId || 0}/applications`, icon: ClipboardList, disabled: !currentExhibitionId },
    { label: '布展管理', to: `/setup/${currentExhibitionId || 0}`, icon: CalendarClock, disabled: !currentExhibitionId },
    { label: '统计面板', to: '/stats', icon: BarChart3 },
  ]
  const vendorNav: { label: string; to: string; icon: any; disabled?: boolean }[] = [
    { label: '可申请展会', to: '/apply', icon: Sparkles },
    { label: '我的申请', to: '/apply/my', icon: FileText },
  ]
  const navItems = role === 'admin' ? adminNav : vendorNav

  const statusMap: Record<string, { label: string; cls: string }> = {
    draft: { label: '草稿', cls: 'bg-gray-100 text-gray-600' },
    published: { label: '已发布', cls: 'bg-green-100 text-green-700' },
    ongoing: { label: '进行中', cls: 'bg-blue-100 text-blue-700' },
    ended: { label: '已结束', cls: 'bg-zinc-100 text-zinc-500' },
  }

  return (
    <aside className="w-72 shrink-0 h-screen flex flex-col border-r border-forest-100 bg-gradient-to-b from-forest-50/80 to-white overflow-hidden">
      <div className="px-5 py-5 border-b border-forest-100/60">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-700 to-forest-900 flex items-center justify-center shadow-copper">
            <Building2 className="w-6 h-6 text-copper-200" strokeWidth={1.8} />
          </div>
          <div>
            <div className="font-serif text-lg font-semibold text-forest-800 leading-tight">市集排期通</div>
            <div className="text-xs text-forest-500 mt-0.5">Booth Schedule Manager</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-forest-100/60 border border-forest-200/60">
          <button
            onClick={() => setRole('admin')}
            className={cn('flex-1 text-xs font-medium rounded-lg px-3 py-2 transition-all',
              role === 'admin' ? 'bg-white shadow-soft text-forest-800' : 'text-forest-600 hover:text-forest-800')}
          >
            <div className="flex items-center justify-center gap-1.5">
              <UserCircle2 className="w-3.5 h-3.5" />
              管理员
            </div>
          </button>
          <button
            onClick={() => setRole('vendor')}
            className={cn('flex-1 text-xs font-medium rounded-lg px-3 py-2 transition-all',
              role === 'vendor' ? 'bg-white shadow-soft text-forest-800' : 'text-forest-600 hover:text-forest-800')}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              摊主
            </div>
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <div className="px-2 py-2 text-[11px] uppercase tracking-widest font-semibold text-forest-400">
          {role === 'admin' ? '管理面板' : '摊主中心'}
        </div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.disabled ? '#' : item.to}
            onClick={e => { if (item.disabled) e.preventDefault() }}
            className={({ isActive }) => cn(
              'nav-link group',
              isActive && 'nav-link-active',
              item.disabled && 'opacity-40 pointer-events-none'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
            <span className="flex-1 truncate">{item.label}</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity" />
          </NavLink>
        ))}

        {role === 'admin' && (
          <>
            <div className="px-2 pt-5 pb-2 text-[11px] uppercase tracking-widest font-semibold text-forest-400">
              当前展会
            </div>
            <div className="space-y-1">
              {exhibitions.map(ex => {
                const active = ex.id === currentExhibitionId
                const status = statusMap[ex.status] || statusMap.draft
                const rate = ex.total ? Math.round((ex.occupied || 0) / ex.total * 100) : 0
                return (
                  <button
                    key={ex.id}
                    onClick={() => { setCurrentExhibition(ex.id); navigate('/') }}
                    className={cn(
                      'w-full text-left px-4 py-3 rounded-xl transition-all duration-200',
                      active ? 'bg-white shadow-soft border border-forest-200' : 'hover:bg-forest-50 border border-transparent'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className={cn('font-medium text-sm truncate', active ? 'text-forest-800' : 'text-forest-700')}>
                          {ex.name}
                        </div>
                        <div className="text-xs text-forest-500 mt-0.5 truncate">{ex.venue}</div>
                      </div>
                      <span className={cn('badge shrink-0', status.cls)}>{status.label}</span>
                    </div>
                    {ex.total ? (
                      <div className="mt-2.5 flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-forest-100 rounded-full overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all',
                            rate >= 90 ? 'bg-red-400' : rate >= 70 ? 'bg-copper-500' : 'bg-forest-500')}
                            style={{ width: `${rate}%` }} />
                        </div>
                        <span className="text-[11px] font-medium text-forest-600 tabular-nums">{rate}%</span>
                        {(ex.conflicts || 0) > 0 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-red-500">
                            <AlertTriangle className="w-3 h-3" />{ex.conflicts}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </nav>

      <div className="px-4 py-3 border-t border-forest-100/60 bg-white/60">
        <div className="text-xs text-forest-500">
          {role === 'admin' ? `共 ${exhibitions.length} 场展会进行中` : '摊主中心 · 申请摊位更便捷'}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

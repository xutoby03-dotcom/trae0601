import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '@/store/app'
import { useRole } from '@/store/role'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import type { Booth, Conflict } from '../../shared/types'
import {
  Search, Filter, AlertTriangle, Zap, Users, Flame,
  Table, Armchair, Phone, User, Sparkles, LayoutPanelTop,
  Ban, ArrowRight, X, Plus, ChevronDown
} from 'lucide-react'

const statusStyleMap: Record<string, { bg: string; ring: string; text: string; label: string }> = {
  available: { bg: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100', ring: '', text: 'text-emerald-700', label: '空位' },
  applied: { bg: 'bg-amber-50 border-amber-200 hover:bg-amber-100', ring: '', text: 'text-amber-700', label: '已申请' },
  confirmed: { bg: 'bg-sky-50 border-sky-200 hover:bg-sky-100', ring: '', text: 'text-sky-700', label: '已确认' },
  conflict: { bg: 'bg-red-50 border-red-300 hover:bg-red-100', ring: 'conflict-pulse', text: 'text-red-700', label: '冲突' },
}

function BoothCell({ booth, onClick, highlight }: { booth: Booth; onClick: () => void; highlight?: boolean }) {
  const style = booth.type === 'aisle'
    ? { bg: 'bg-gradient-to-br from-zinc-100 to-zinc-200/60 border-zinc-200', text: 'text-zinc-400' }
    : booth.type === 'empty'
      ? { bg: 'bg-forest-50/40 border-dashed border-forest-200', text: 'text-forest-300' }
      : { bg: statusStyleMap[booth.status]?.bg || '', text: statusStyleMap[booth.status]?.text || '' }

  return (
    <button
      onClick={onClick}
      className={cn(
        'booth-cell relative rounded-2xl border aspect-[4/3] flex flex-col items-center justify-center text-center p-2',
        booth.type === 'booth' ? style.bg : style.bg,
        booth.type === 'booth' && booth.status === 'conflict' && statusStyleMap.conflict.ring,
        highlight && 'ring-2 ring-copper-500 ring-offset-2 scale-[1.03]',
        booth.type !== 'booth' && 'cursor-default'
      )}
    >
      {booth.type === 'aisle' ? (
        <>
          <span className="text-[10px] font-medium tracking-widest uppercase text-zinc-400">通道</span>
          <span className="text-[10px] text-zinc-300 mt-0.5">Aisle</span>
        </>
      ) : booth.type === 'empty' ? (
        <span className="text-[10px] text-forest-300">— 空地 —</span>
      ) : (
        <>
          <div className={cn('font-serif text-sm font-semibold tracking-tight', style.text)}>
            {booth.booth_number}
          </div>
          <div className={cn('text-[10px] mt-0.5 max-w-full truncate px-1', style.text, 'opacity-80')}>
            {booth.application?.brand || booth.application?.vendor_name || statusStyleMap[booth.status]?.label}
          </div>
          {booth.application?.has_open_flame && (
            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
              <Flame className="w-2.5 h-2.5 text-orange-600" />
            </div>
          )}
          {booth.application?.power_watts && booth.application.power_watts >= 1500 && (
            <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center">
              <Zap className="w-2.5 h-2.5 text-yellow-600" />
            </div>
          )}
        </>
      )}
    </button>
  )
}

function Legend() {
  const items = [
    { ...statusStyleMap.available, icon: null, key: 'available' },
    { ...statusStyleMap.applied, icon: null, key: 'applied' },
    { ...statusStyleMap.confirmed, icon: null, key: 'confirmed' },
    { ...statusStyleMap.conflict, icon: AlertTriangle, key: 'conflict' },
  ]
  return (
    <div className="flex items-center gap-4 flex-wrap">
      {items.map(it => {
        const Icon = it.icon
        return (
          <div key={it.key} className="flex items-center gap-2">
            <div className={cn('w-5 h-5 rounded-lg border', it.bg)} />
            <span className="text-xs font-medium text-forest-600">{it.label}</span>
            {Icon && <Icon className="w-3 h-3 text-red-500" />}
          </div>
        )
      })}
      <div className="w-px h-5 bg-forest-200 mx-1" />
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg border bg-gradient-to-br from-zinc-100 to-zinc-200/60 border-zinc-200" />
        <span className="text-xs font-medium text-forest-600">通道</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-lg border-dashed border bg-forest-50/40 border-forest-200" />
        <span className="text-xs font-medium text-forest-600">空地</span>
      </div>
    </div>
  )
}

function ConflictList({ conflicts, onJump, onClose }: {
  conflicts: { booth: Booth; appConflicts: Conflict[] }[]
  onJump: (b: Booth) => void
  onClose: () => void
}) {
  const typeInfo: Record<string, { label: string; icon: any; cls: string }> = {
    adjacent_type: { label: '相邻品类重复', icon: Users, cls: 'bg-orange-100 text-orange-700 border-orange-200' },
    power_overload: { label: '用电超负荷', icon: Zap, cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    aisle_blocked: { label: '通道被挡', icon: Ban, cls: 'bg-red-100 text-red-700 border-red-200' },
  }
  return (
    <div className="card p-4 animate-slide-right">
      <div className="flex items-center justify-between mb-3">
        <div className="section-title">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          冲突提醒 <span className="ml-1 badge bg-red-100 text-red-600">{conflicts.length}</span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-forest-50 text-forest-400">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
        {conflicts.map(({ booth, appConflicts }) => (
          <button
            key={booth.id}
            onClick={() => onJump(booth)}
            className="w-full text-left p-3 rounded-xl border border-red-100 bg-red-50/60 hover:bg-red-50 transition-colors group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-serif font-semibold text-forest-800">{booth.booth_number}</span>
                <span className="text-xs text-forest-500 truncate max-w-[140px]">{booth.application?.brand || booth.application?.vendor_name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {appConflicts.map((c, i) => {
                const t = typeInfo[c.type]
                const Icon = t.icon
                return (
                  <span key={i} className={cn('badge border', t.cls)}>
                    <Icon className="w-3 h-3" />{t.label}
                  </span>
                )
              })}
            </div>
            <div className="mt-2 text-xs text-red-600/80">
              {appConflicts[0]?.message}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function BoothDetailModal({ booth, onClose, onApply }: {
  booth: Booth; onClose: () => void; onApply: () => void
}) {
  const { role } = useRole()
  const typeInfo: Record<string, { label: string; icon: any; cls: string }> = {
    adjacent_type: { label: '相邻品类重复', icon: Users, cls: 'bg-orange-100 text-orange-700' },
    power_overload: { label: '用电超负荷', icon: Zap, cls: 'bg-yellow-100 text-yellow-700' },
    aisle_blocked: { label: '通道被挡', icon: Ban, cls: 'bg-red-100 text-red-700' },
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="card w-full max-w-lg p-6 animate-slide-up shadow-lift" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-xs text-forest-400 mb-1">摊位</div>
            <h3 className="font-serif text-2xl font-semibold text-forest-800">{booth.booth_number}</h3>
            <div className="text-sm text-forest-500 mt-0.5">{booth.zone} 区 · 供电上限 {booth.max_power_watts}W</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('badge', statusStyleMap[booth.status]?.bg?.split(' ')[0]?.replace('bg-', 'bg-') + ' border-0',
              booth.status === 'available' && 'bg-emerald-100 text-emerald-700',
              booth.status === 'applied' && 'bg-amber-100 text-amber-700',
              booth.status === 'confirmed' && 'bg-sky-100 text-sky-700',
              booth.status === 'conflict' && 'bg-red-100 text-red-700',
            )}>
              {statusStyleMap[booth.status]?.label}
            </span>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 text-forest-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {booth.application ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <InfoCell icon={Sparkles} label="品牌" value={booth.application.brand} />
              <InfoCell icon={User} label="摊主" value={booth.application.vendor_name} />
              <InfoCell icon={LayoutPanelTop} label="商品类型" value={booth.application.product_type} />
              <InfoCell icon={Zap} label="用电需求" value={`${booth.application.power_watts}W`} />
              <InfoCell icon={Table} label="桌子" value={`${booth.application.tables} 张`} />
              <InfoCell icon={Armchair} label="椅子" value={`${booth.application.chairs} 把`} />
              <InfoCell icon={Flame} label="明火" value={booth.application.has_open_flame ? '有' : '无'} />
              <InfoCell icon={User} label="负责人" value={booth.application.contact_name} />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <InfoCell icon={Phone} label="联系电话" value={booth.application.contact_phone} />
              <InfoCell icon={Filter} label="申请状态" value={booth.application.status === 'approved' ? '已批准' : booth.application.status === 'pending' ? '审核中' : '已拒绝'} />
            </div>

            {booth.application.conflicts?.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 mb-4">
                <div className="section-title mb-2 text-red-700">
                  <AlertTriangle className="w-4 h-4" />检测到冲突
                </div>
                <ul className="space-y-2">
                  {booth.application.conflicts.map((c, i) => {
                    const t = typeInfo[c.type]
                    const Icon = t.icon
                    return (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className={cn('badge mt-0.5 shrink-0', t.cls)}>
                          <Icon className="w-3 h-3" />{t.label}
                        </span>
                        <span className="text-red-700">{c.message}</span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </>
        ) : booth.type === 'booth' ? (
          <div className="py-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 mx-auto flex items-center justify-center mb-3">
              <Plus className="w-7 h-7 text-emerald-600" />
            </div>
            <div className="font-serif text-lg font-medium text-forest-700 mb-1">该摊位目前空闲</div>
            <div className="text-sm text-forest-500 mb-4">{booth.zone} 区 · 供电上限 {booth.max_power_watts}W</div>
            {role === 'vendor' && (
              <button onClick={onApply} className="btn-secondary">
                <Sparkles className="w-4 h-4" />申请该摊位
              </button>
            )}
            {role === 'admin' && (
              <div className="text-sm text-forest-400">切换至「摊主」角色即可申请</div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}

function InfoCell({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-forest-100 bg-forest-50/40 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[11px] text-forest-500 mb-0.5">
        <Icon className="w-3 h-3 text-copper-500" />{label}
      </div>
      <div className="text-sm font-medium text-forest-800 truncate">{value}</div>
    </div>
  )
}

export default function FloorPlanPage() {
  const navigate = useNavigate()
  const { currentExhibitionId, currentExhibition, booths, fetchBooths } = useApp()
  const [selected, setSelected] = useState<Booth | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [highlight, setHighlight] = useState<Booth | null>(null)
  const [showConflicts, setShowConflicts] = useState(true)

  useEffect(() => {
    if (currentExhibitionId) fetchBooths(currentExhibitionId)
  }, [currentExhibitionId])

  const grid = useMemo(() => {
    const rows = currentExhibition?.grid_rows || 5
    const cols = currentExhibition?.grid_cols || 8
    const map = new Map<string, Booth>()
    booths.forEach(b => map.set(`${b.row}-${b.col}`, b))
    const cells: (Booth | null)[][] = []
    for (let r = 0; r < rows; r++) {
      const row: (Booth | null)[] = []
      for (let c = 0; c < cols; c++) row.push(map.get(`${r}-${c}`) || null)
      cells.push(row)
    }
    return cells
  }, [booths, currentExhibition])

  const filteredBooths = useMemo(() => {
    const q = search.trim().toLowerCase()
    return booths.filter(b => {
      if (b.type !== 'booth') return false
      if (statusFilter !== 'all' && b.status !== statusFilter) return false
      if (!q) return true
      return b.booth_number.toLowerCase().includes(q) ||
        b.application?.brand.toLowerCase().includes(q) ||
        b.application?.vendor_name.toLowerCase().includes(q) ||
        b.application?.product_type.toLowerCase().includes(q)
    })
  }, [booths, search, statusFilter])

  const conflictBooths = useMemo(
    () => booths.filter(b => b.status === 'conflict' || (b.application?.conflicts?.length || 0) > 0)
      .map(b => ({ booth: b, appConflicts: b.application?.conflicts || [] as any })),
    [booths]
  )

  const stats = useMemo(() => {
    const s = { available: 0, applied: 0, confirmed: 0, conflict: 0, total: 0 }
    booths.forEach(b => {
      if (b.type !== 'booth') return
      s.total++
      s[b.status] = (s as any)[b.status] + 1 || 1
    })
    return s
  }, [booths])

  if (!currentExhibition || booths.length === 0) {
    return (
      <>
        <PageHeader title="场地平面图" subtitle="加载中..." />
        <div className="flex-1 flex items-center justify-center text-forest-400">暂无展会数据</div>
      </>
    )
  }

  const cols = currentExhibition.grid_cols
  const cellWidth = 100 / cols

  const handleApply = (booth: Booth) => {
    setSelected(null)
    navigate(`/apply?exhibition=${currentExhibitionId}&booth=${booth.id}`)
  }

  return (
    <>
      <PageHeader
        title="场地平面图"
        subtitle="实时查看摊位状态，快速定位冲突，一图掌控全场"
      />

      <div className="flex-1 flex overflow-hidden">
        <section className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="搜索摊位号 / 品牌 / 类型"
                  className="input-base pl-9 w-64"
                />
              </div>
              <div className="relative">
                <Filter className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="input-base pl-9 pr-8 appearance-none"
                >
                  <option value="all">全部状态</option>
                  <option value="available">空位</option>
                  <option value="applied">已申请</option>
                  <option value="confirmed">已确认</option>
                  <option value="conflict">冲突待处理</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-forest-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <Legend />
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { key: 'total', label: '摊位总数', value: stats.total, icon: LayoutPanelTop, cls: 'bg-forest-700 text-white' },
              { key: 'available', label: '空位', value: stats.available, icon: Plus, cls: 'bg-emerald-500 text-white' },
              { key: 'confirmed', label: '已确认', value: stats.confirmed, icon: Users, cls: 'bg-sky-500 text-white' },
              { key: 'conflict', label: '冲突数', value: stats.conflict, icon: AlertTriangle, cls: stats.conflict > 0 ? 'bg-red-500 text-white' : 'bg-zinc-400 text-white' },
            ].map(it => {
              const Icon = it.icon
              return (
                <div key={it.key} className={cn('rounded-2xl p-4 shadow-soft', it.cls)}>
                  <div className="flex items-center justify-between mb-2">
                    <Icon className="w-4.5 h-4.5 opacity-80" />
                    <span className="text-xs opacity-70 font-medium">{it.label}</span>
                  </div>
                  <div className="font-serif text-3xl font-semibold leading-tight tabular-nums">{it.value}</div>
                </div>
              )
            })}
          </div>

          <div className="card p-6 relative overflow-hidden">
            <div className="text-[11px] uppercase tracking-widest font-semibold text-forest-400 mb-4">
              入口 ↑ ENTRANCE
            </div>
            <div
              className="grid gap-3 mx-auto"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, maxWidth: `${cols * 140}px` }}
            >
              {grid.flat().map((b, idx) => (
                b ? (
                  <BoothCell
                    key={b.id}
                    booth={b}
                    highlight={highlight?.id === b.id || (search && filteredBooths.find(f => f.id === b.id) !== undefined)}
                    onClick={() => b.type === 'booth' && setSelected(b)}
                  />
                ) : <div key={idx} />
              ))}
            </div>
            <div className="mt-5 text-[11px] uppercase tracking-widest font-semibold text-forest-400 text-center">
              出口 ↓ EXIT
            </div>
          </div>

          {search && filteredBooths.length > 0 && (
            <div className="mt-6 card p-4">
              <div className="section-title mb-3">
                <Search className="w-4 h-4 text-copper-500" />
                搜索结果 <span className="ml-1 badge bg-copper-100 text-copper-700">{filteredBooths.length}</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredBooths.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b)}
                    className={cn(
                      'p-2 rounded-xl border text-center text-xs transition-all',
                      statusStyleMap[b.status]?.bg || 'bg-white',
                      'hover:shadow-soft'
                    )}
                  >
                    <div className={cn('font-serif font-semibold', statusStyleMap[b.status]?.text)}>{b.booth_number}</div>
                    <div className="text-[10px] mt-0.5 truncate opacity-70">{b.application?.brand || '空位'}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        {showConflicts && conflictBooths.length > 0 && (
          <aside className="w-80 shrink-0 p-6 pl-0 border-l border-forest-100/60 overflow-hidden">
            <ConflictList
              conflicts={conflictBooths}
              onJump={b => { setHighlight(b); setTimeout(() => setHighlight(null), 3000) }}
              onClose={() => setShowConflicts(false)}
            />
          </aside>
        )}
      </div>

      {selected && (
        <BoothDetailModal
          booth={selected}
          onClose={() => setSelected(null)}
          onApply={() => handleApply(selected)}
        />
      )}
    </>
  )
}

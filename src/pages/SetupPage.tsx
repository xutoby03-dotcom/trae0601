import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useApp } from '@/store/app'
import PageHeader from '@/components/PageHeader'
import { cn } from '@/lib/utils'
import {
  UserCheck, Clock, ArrowRightLeft,
  Sparkles, X, Clock3, AlertTriangle, ArrowRight, Search,
  LogIn,
} from 'lucide-react'

export default function SetupPage() {
  const params = useParams()
  const id = params.id ? Number(params.id) : 0
  const { setup, fetchSetup, setCurrentExhibition, currentExhibition, checkIn, swapBooths, addAlert } = useApp()
  const [swapMode, setSwapMode] = useState<number | null>(null)
  const [swapModal, setSwapModal] = useState<{ appId: number; boothId: number } | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (id) { setCurrentExhibition(id); fetchSetup(id) }
  }, [id])

  const all = useMemo(() => {
    if (!setup) return []
    type Row = {
      id: number
      booth_id: number
      booth_number: string
      swapped_booth?: string
      swap_reason?: string
      vendor_name: string
      brand: string
      product_type: string
      app_status: string
      check_in_time: string | null
      is_late: boolean
      checked: boolean
    }
    return [
      ...(setup.checked_in || []).map((r: any) => ({
        id: r.application_id,
        booth_id: r.booth_id,
        booth_number: r.current_booth,
        swapped_booth: r.swapped_booth as string | undefined,
        swap_reason: r.swap_reason as string | undefined,
        vendor_name: r.vendor_name,
        brand: r.brand,
        product_type: r.product_type,
        app_status: r.app_status,
        check_in_time: r.check_in_time,
        is_late: !!r.is_late,
        checked: true,
      }) as Row),
      ...(setup.pending || []).map((r: any) => ({
        id: r.application_id,
        booth_id: r.booth_id,
        booth_number: r.current_booth,
        vendor_name: r.vendor_name,
        brand: r.brand,
        product_type: r.product_type,
        app_status: r.app_status,
        check_in_time: null,
        is_late: false,
        checked: false,
      }) as Row),
    ] as Row[]
  }, [setup])

  const counts = {
    total: all.length,
    checked: all.filter(x => x.checked).length,
    pending: all.filter(x => !x.checked).length,
    late: all.filter(x => x.is_late).length,
  }

  const q = search.trim().toLowerCase()
  const filtered = q ? all.filter(x =>
    x.vendor_name.toLowerCase().includes(q) || x.brand.toLowerCase().includes(q) ||
    x.booth_number.toLowerCase().includes(q) || x.product_type.toLowerCase().includes(q)
  ) : all

  const fmtTime = (t: string | null) => {
    if (!t) return ''
    const d = new Date(t)
    return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  const handleCheckIn = (row: any, late = false) => {
    checkIn({
      application_id: row.id,
      booth_id: row.booth_id,
      check_in_time: new Date().toISOString(),
      is_late: late ? 1 : 0,
    })
  }

  const confirmSwap = (toAppId: number, reason: string) => {
    if (!swapModal) return
    swapBooths({
      from_application_id: swapModal.appId,
      to_booth_id: all.find(x => x.id === toAppId)?.booth_id || toAppId,
      reason,
    })
    setSwapModal(null)
    setSwapMode(null)
  }

  const openSwap = (row: any) => {
    setSwapModal({ appId: row.id, boothId: row.booth_id })
    setSwapMode(row.id)
  }

  const swapCandidates = all.filter(x => x.id !== swapModal?.appId && x.app_status === 'approved')

  return (
    <>
      <PageHeader
        title="布展管理"
        subtitle="布展日统一签到管理，支持迟到标记与临时摊位调换"
      />

      <section className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { key: 'total', label: '需签到摊主', value: counts.total, icon: Sparkles, cls: 'bg-forest-700 text-white' },
            { key: 'checked', label: '已签到', value: counts.checked, icon: UserCheck, cls: 'bg-emerald-500 text-white' },
            { key: 'pending', label: '未签到', value: counts.pending, icon: Clock3, cls: 'bg-amber-500 text-white' },
            { key: 'late', label: '迟到', value: counts.late, icon: AlertTriangle, cls: counts.late > 0 ? 'bg-red-500 text-white' : 'bg-zinc-400 text-white' },
          ].map(it => {
            const Icon = it.icon
            const rate = it.key === 'total' ? 100 : counts.total ? Math.round(counts[it.key as any] / counts.total * 100) : 0
            return (
              <div key={it.key} className={cn('rounded-2xl p-5 shadow-soft relative overflow-hidden', it.cls)}>
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center')}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold opacity-70 tabular-nums">{rate}%</span>
                </div>
                <div className="font-serif text-3xl font-semibold mb-1 tabular-nums">{counts[it.key as any]}</div>
                <div className="text-xs opacity-70">{it.label}</div>
                <div className="absolute bottom-0 left-0 h-1 bg-white/30" style={{ width: `${rate}%` }} />
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-forest-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="搜索摊主/品牌/摊位号..."
              className="input-base pl-9"
            />
          </div>
          {counts.pending > 0 && (
            <div className="text-xs text-forest-500 flex items-center gap-1">
              <Clock3 className="w-3.5 h-3.5" />
              预计签到截止：{currentExhibition?.open_time || '09:00'}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="grid grid-cols-12 px-5 py-3 bg-forest-50/80 text-xs font-semibold uppercase tracking-wider text-forest-600 border-b border-forest-100/80">
            <div className="col-span-2">摊位</div>
            <div className="col-span-3">摊主 · 品牌</div>
            <div className="col-span-2">商品类型</div>
            <div className="col-span-2">签到信息</div>
            <div className="col-span-3 text-right">操作</div>
          </div>
          <div className="divide-y divide-forest-100/60">
            {filtered.map((row, i) => (
              <div
                key={row.id}
                className={cn(
                  'grid grid-cols-12 items-center px-5 py-3.5 transition-colors',
                  row.is_late ? 'bg-red-50/30 hover:bg-red-50/60' : swapMode === row.id ? 'bg-copper-50/50' : 'hover:bg-forest-50/40'
                )}
                style={{ animation: `slideUp 0.3s ease-out ${i * 30}ms both` }}
              >
                <div className="col-span-2 flex items-center gap-2">
                  <span className="font-serif font-semibold text-forest-800">{row.booth_number}</span>
                  {row.swapped_booth && (
                    <span className="flex items-center gap-1 badge bg-copper-100 text-copper-700">
                      <ArrowRightLeft className="w-3 h-3" />→ {row.swapped_booth}
                    </span>
                  )}
                </div>
                <div className="col-span-3 min-w-0">
                  <div className="text-sm font-medium text-forest-800 truncate">{row.brand}</div>
                  <div className="text-xs text-forest-500 truncate flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-copper-500 shrink-0" />{row.vendor_name}
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="badge bg-forest-100 text-forest-700">{row.product_type}</span>
                </div>
                <div className="col-span-2">
                  {row.checked ? (
                    <div className="flex items-center gap-2">
                      <span className={cn('badge',
                        row.is_late ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700')}>
                        {row.is_late ? <AlertTriangle className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        {row.is_late ? '迟到' : '准时'}
                      </span>
                      <span className="text-xs text-forest-600 tabular-nums">{fmtTime(row.check_in_time)}</span>
                    </div>
                  ) : (
                    <span className="badge bg-zinc-100 text-zinc-500">
                      <Clock className="w-3 h-3" />未签到
                    </span>
                  )}
                </div>
                <div className="col-span-3 flex items-center justify-end gap-2">
                  {!row.checked && row.app_status === 'approved' && (
                    <>
                      <button onClick={() => handleCheckIn(row, false)} className="btn-primary !py-2 !px-3 text-xs">
                        <LogIn className="w-3.5 h-3.5" />签到
                      </button>
                      <button onClick={() => handleCheckIn(row, true)} className="btn-danger !py-2 !px-3 text-xs">
                        <AlertTriangle className="w-3.5 h-3.5" />迟到
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => openSwap(row)}
                    disabled={row.app_status !== 'approved'}
                    className={cn(
                      'p-2 rounded-lg text-xs transition-all',
                      row.app_status === 'approved' ? 'bg-white border border-forest-200 text-forest-600 hover:bg-forest-50 hover:border-forest-400' : 'opacity-40 cursor-not-allowed bg-forest-50 text-forest-400'
                    )}
                    title="临时换位"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-forest-400 text-sm">暂无签到数据</div>
            )}
          </div>
        </div>
      </section>

      {swapModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={() => { setSwapModal(null); setSwapMode(null) }}
        >
          <div className="card w-full max-w-lg p-6 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="title-lg">临时换位</h3>
                <p className="text-xs text-forest-500 mt-1">选择要互换的摊主，并填写换位原因</p>
              </div>
              <button
                onClick={() => { setSwapModal(null); setSwapMode(null) }}
                className="p-2 rounded-lg hover:bg-forest-50 text-forest-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="mb-5">
              <div className="label">换位摊主</div>
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                {swapCandidates.length === 0 && (
                  <div className="text-sm text-forest-400 py-6 text-center">暂无可互换的摊主</div>
                )}
                <SwapList
                  items={swapCandidates}
                  selectedFromId={swapModal.appId}
                  selectedFromBooth={all.find(x => x.id === swapModal.appId)?.booth_number || ''}
                  onConfirm={confirmSwap}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function SwapList({ items, selectedFromBooth, onConfirm }: {
  items: any[]; selectedFromId: number; selectedFromBooth: string; onConfirm: (id: number, reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const [selectedTo, setSelectedTo] = useState<number | null>(null)
  return (
    <div>
      {items.map(it => (
        <button
          key={it.id}
          onClick={() => setSelectedTo(it.id)}
          className={cn(
            'w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3',
            selectedTo === it.id ? 'border-copper-400 bg-copper-50/50' : 'border-forest-100 bg-white hover:border-forest-300'
          )}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-serif font-semibold text-copper-600">{selectedFromBooth}</span>
            <ArrowRight className="w-4 h-4 text-forest-400" />
            <span className="font-serif font-semibold text-forest-700">{it.booth_number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-forest-800 truncate">{it.brand}</div>
            <div className="text-xs text-forest-500 truncate">{it.vendor_name} · {it.product_type}</div>
          </div>
        </button>
      ))}
      {selectedTo !== null && (
        <div className="mt-4 pt-4 border-t border-forest-100/60 space-y-3 animate-slide-up">
          <div>
            <div className="label">换位原因</div>
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="input-base"
              placeholder="如：场地大小不合适、光线需求等"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setSelectedTo(null)} className="btn-outline">取消</button>
            <button
              onClick={() => onConfirm(selectedTo, reason || '临时调整')}
              className="btn-primary"
              disabled={!reason}
            >
              <ArrowRightLeft className="w-4 h-4" />确认换位
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

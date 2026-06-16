import { useState, useMemo } from 'react'
import { useStore } from '@/store'
import { STATUS_LABELS, STATUS_COLORS, type Goggle, type GoggleStatus } from '@/types'
import { X, Check, ArrowRight } from 'lucide-react'

const FLOW_STATUSES: { value: GoggleStatus; label: string; desc: string }[] = [
  { value: 'pending_clean', label: '待清洗', desc: '归还后等待清洗消毒' },
  { value: 'disinfected', label: '已消毒', desc: '已完成清洗消毒' },
  { value: 'drying', label: '晾干中', desc: '消毒后正在晾干' },
  { value: 'stored', label: '已入柜', desc: '已入柜，可再次借出' },
]

interface StatusFlowModalProps {
  goggles: Goggle[]
  onClose: () => void
  title?: string
}

export default function StatusFlowModal({ goggles, onClose, title = '状态流转处理' }: StatusFlowModalProps) {
  const { batchUpdateGoggleStatus } = useStore()
  const [targetStatus, setTargetStatus] = useState<GoggleStatus | ''>('')
  const [toast, setToast] = useState('')

  const currentStatus = useMemo(() => {
    if (goggles.length === 0) return null
    const firstStatus = goggles[0].status
    const allSame = goggles.every(g => g.status === firstStatus)
    return allSame ? firstStatus : null
  }, [goggles])

  const canGoNext = useMemo(() => {
    if (!currentStatus) return null
    const currentIdx = FLOW_STATUSES.findIndex(s => s.value === currentStatus)
    if (currentIdx === -1 || currentIdx >= FLOW_STATUSES.length - 1) return null
    return FLOW_STATUSES[currentIdx + 1]
  }, [currentStatus])

  const handleConfirm = () => {
    if (!targetStatus) return
    batchUpdateGoggleStatus(goggles.map(g => g.id), targetStatus)
    setToast(`已将 ${goggles.length} 副护目镜状态更新为「${STATUS_LABELS[targetStatus]}」`)
    setTimeout(() => {
      setToast('')
      onClose()
    }, 1500)
  }

  const handleQuickNext = () => {
    if (!canGoNext) return
    batchUpdateGoggleStatus(goggles.map(g => g.id), canGoNext.value)
    setToast(`已将 ${goggles.length} 副护目镜状态更新为「${canGoNext.label}」`)
    setTimeout(() => {
      setToast('')
      onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {toast && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
            <Check className="w-4 h-4" />
            {toast}
          </div>
        )}

        <div className="mb-5">
          <p className="text-sm text-slate-500 mb-2">
            已选中 <span className="font-semibold text-slate-800">{goggles.length}</span> 副护目镜
            {currentStatus && (
              <>
                ，当前状态：
                <span className={`badge ${STATUS_COLORS[currentStatus]} ml-1`}>
                  {STATUS_LABELS[currentStatus]}
                </span>
              </>
            )}
          </p>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-auto p-2 bg-slate-50 rounded-lg">
            {goggles.map(g => (
              <span key={g.id} className="inline-flex items-center px-2 py-1 bg-white rounded-md text-xs border border-slate-200">
                <span className="font-medium text-slate-700">{g.code}</span>
                <span className={`badge ${STATUS_COLORS[g.status]} ml-1.5`}>{STATUS_LABELS[g.status]}</span>
              </span>
            ))}
          </div>
        </div>

        {canGoNext && (
          <div className="mb-5 p-4 bg-brand-50 rounded-xl border border-brand-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-brand-900">快捷推进到下一步</p>
                <p className="text-xs text-brand-600 mt-0.5">
                  {currentStatus && STATUS_LABELS[currentStatus]}
                  <ArrowRight className="w-3 h-3 inline mx-1" />
                  {canGoNext.label} — {canGoNext.desc}
                </p>
              </div>
              <button onClick={handleQuickNext} className="btn-primary text-sm">
                一键推进
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">选择目标状态</label>
          <div className="grid grid-cols-2 gap-3">
            {FLOW_STATUSES.map(s => (
              <button
                key={s.value}
                onClick={() => setTargetStatus(s.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  targetStatus === s.value
                    ? 'border-brand-400 bg-brand-50 ring-2 ring-brand-200'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`badge ${STATUS_COLORS[s.value]}`}>{s.label}</span>
                  {targetStatus === s.value && (
                    <Check className="w-3.5 h-3.5 text-brand-600 ml-auto" />
                  )}
                </div>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
          <button onClick={onClose} className="btn-secondary flex-1">取消</button>
          <button
            onClick={handleConfirm}
            className="btn-primary flex-1"
            disabled={!targetStatus}
          >
            <Check className="w-4 h-4" />
            确认更新状态
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { FilterType, OdorLevel } from '@/types'
import { FILTER_TYPE_OPTIONS } from '@/types'
import { useStore } from '@/store'
import { X } from 'lucide-react'

interface ReplacementFormProps {
  open: boolean
  onClose: () => void
}

export function ReplacementFormModal({ open, onClose }: ReplacementFormProps) {
  const { purifiers, addReplacement } = useStore()
  const [purifierId, setPurifierId] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('PP棉')
  const [replaceDate, setReplaceDate] = useState(new Date().toISOString().split('T')[0])
  const [cost, setCost] = useState('')

  if (!open) return null

  const handleSubmit = () => {
    if (!purifierId) return
    const fc = useStore.getState().filterConfigs.find(
      (f) => f.purifierId === purifierId && f.filterType === filterType
    )
    if (!fc) return
    addReplacement({
      filterConfigId: fc.id,
      purifierId,
      replaceDate,
      cost: Number(cost) || 0,
    })
    onClose()
    setPurifierId('')
    setFilterType('PP棉')
    setReplaceDate(new Date().toISOString().split('T')[0])
    setCost('')
  }

  const availableFilterTypes = purifierId
    ? useStore.getState().filterConfigs.filter((f) => f.purifierId === purifierId).map((f) => f.filterType)
    : []

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-800">记录换芯</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">选择净水器</label>
            <select
              value={purifierId}
              onChange={(e) => { setPurifierId(e.target.value); setFilterType('PP棉') }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">请选择</option>
              {purifiers.map((p) => (
                <option key={p.id} value={p.id}>{p.brand} {p.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">滤芯类型</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {availableFilterTypes.length > 0
                ? availableFilterTypes.map((t) => <option key={t} value={t}>{t}</option>)
                : FILTER_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)
              }
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">更换日期</label>
            <input
              type="date"
              value={replaceDate}
              onChange={(e) => setReplaceDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">花费（元）</label>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">取消</button>
          <button
            onClick={handleSubmit}
            disabled={!purifierId || !cost}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            记录
          </button>
        </div>
      </div>
    </div>
  )
}

interface WaterQualityFormProps {
  open: boolean
  onClose: () => void
}

export function WaterQualityFormModal({ open, onClose }: WaterQualityFormProps) {
  const { purifiers, addWaterQualityLog } = useStore()
  const [purifierId, setPurifierId] = useState('')
  const [flowRate, setFlowRate] = useState('')
  const [tdsValue, setTdsValue] = useState('')
  const [odorLevel, setOdorLevel] = useState<OdorLevel>('none')
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0])

  if (!open) return null

  const handleSubmit = () => {
    if (!purifierId || !flowRate || !tdsValue) return
    addWaterQualityLog({
      purifierId,
      flowRate: Number(flowRate),
      tdsValue: Number(tdsValue),
      odorLevel,
      logDate,
    })
    onClose()
    setPurifierId('')
    setFlowRate('')
    setTdsValue('')
    setOdorLevel('none')
    setLogDate(new Date().toISOString().split('T')[0])
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-800">记录水质</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">选择净水器</label>
            <select
              value={purifierId}
              onChange={(e) => setPurifierId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">请选择</option>
              {purifiers.map((p) => (
                <option key={p.id} value={p.id}>{p.brand} {p.model}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">日期</label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">出水速度 (ml/min)</label>
              <input
                type="number"
                value={flowRate}
                onChange={(e) => setFlowRate(e.target.value)}
                placeholder="如 200"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">TDS (ppm)</label>
              <input
                type="number"
                value={tdsValue}
                onChange={(e) => setTdsValue(e.target.value)}
                placeholder="如 10"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">异味反馈</label>
            <div className="flex gap-2">
              {([
                ['none', '无异味', 'bg-brand-50 text-brand-700 border-brand-200'],
                ['mild', '轻微异味', 'bg-amber-50 text-amber-700 border-amber-200'],
                ['obvious', '明显异味', 'bg-red-50 text-red-700 border-red-200'],
              ] as const).map(([val, label, cls]) => (
                <button
                  key={val}
                  onClick={() => setOdorLevel(val as OdorLevel)}
                  className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                    odorLevel === val ? cls : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">取消</button>
          <button
            onClick={handleSubmit}
            disabled={!purifierId || !flowRate || !tdsValue}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            记录
          </button>
        </div>
      </div>
    </div>
  )
}

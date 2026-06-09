import { useState } from 'react'
import type { FilterType, FilterConfig } from '@/types'
import { FILTER_TYPE_OPTIONS } from '@/types'
import { useStore } from '@/store'
import { X, Plus, Trash2 } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  purifierId: string | null
  initialData?: {
    brand: string
    model: string
    installDate: string
    purchaseLink: string
    filterConfigs: FilterConfig[]
  }
}

export default function PurifierFormModal({ open, onClose, purifierId, initialData }: Props) {
  const { addPurifier, updatePurifier, addFilterConfig, deleteFilterConfig, updateFilterConfig } = useStore()
  const [brand, setBrand] = useState(initialData?.brand || '')
  const [model, setModel] = useState(initialData?.model || '')
  const [installDate, setInstallDate] = useState(initialData?.installDate || new Date().toISOString().split('T')[0])
  const [purchaseLink, setPurchaseLink] = useState(initialData?.purchaseLink || '')
  const [filters, setFilters] = useState<{ id?: string; filterType: FilterType; suggestedLifespanDays: number; purchaseLink: string }[]>(
    initialData?.filterConfigs?.map((f) => ({
      id: f.id,
      filterType: f.filterType,
      suggestedLifespanDays: f.suggestedLifespanDays,
      purchaseLink: f.purchaseLink,
    })) || [{ filterType: 'PP棉', suggestedLifespanDays: 90, purchaseLink: '' }]
  )

  if (!open) return null

  const handleSubmit = () => {
    if (!brand.trim() || !model.trim()) return

    if (purifierId) {
      updatePurifier(purifierId, { brand, model, installDate, purchaseLink })
      filters.forEach((f) => {
        if (f.id) {
          updateFilterConfig(f.id, {
            filterType: f.filterType,
            suggestedLifespanDays: f.suggestedLifespanDays,
            purchaseLink: f.purchaseLink,
          })
        }
      })
      const newFilters = filters.filter((f) => !f.id)
      newFilters.forEach((f) => {
        addFilterConfig({
          purifierId,
          filterType: f.filterType,
          suggestedLifespanDays: f.suggestedLifespanDays,
          purchaseLink: f.purchaseLink,
        })
      })
      const existingIds = filters.filter((f) => f.id).map((f) => f.id)
      const removedConfigs = initialData?.filterConfigs?.filter((c) => !existingIds.includes(c.id)) || []
      removedConfigs.forEach((c) => deleteFilterConfig(c.id))
    } else {
      const newId = addPurifier({ brand, model, installDate, purchaseLink })
      filters.forEach((f) => {
        addFilterConfig({
          purifierId: newId,
          filterType: f.filterType,
          suggestedLifespanDays: f.suggestedLifespanDays,
          purchaseLink: f.purchaseLink,
        })
      })
    }
    onClose()
  }

  const addFilter = () => {
    setFilters([...filters, { filterType: 'PP棉', suggestedLifespanDays: 90, purchaseLink: '' }])
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, field: string, value: string | number) => {
    setFilters(filters.map((f, i) => (i === index ? { ...f, [field]: value } : f)))
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md rounded-t-2xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-800">
            {purifierId ? '编辑净水器' : '添加净水器'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">品牌</label>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="如：沁园"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">型号</label>
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="如：QR-RU-502A"
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">安装日期</label>
            <input
              type="date"
              value={installDate}
              onChange={(e) => setInstallDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">购买链接（选填）</label>
            <input
              value={purchaseLink}
              onChange={(e) => setPurchaseLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-medium text-slate-500">滤芯配置</label>
              <button onClick={addFilter} className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> 添加滤芯
              </button>
            </div>
            <div className="space-y-2">
              {filters.map((f, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                  <select
                    value={f.filterType}
                    onChange={(e) => updateFilter(i, 'filterType', e.target.value)}
                    className="px-2 py-1.5 rounded-lg border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    {FILTER_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={f.suggestedLifespanDays}
                      onChange={(e) => updateFilter(i, 'suggestedLifespanDays', Number(e.target.value))}
                      className="w-16 px-2 py-1.5 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">天</span>
                  </div>
                  <input
                    value={f.purchaseLink}
                    onChange={(e) => updateFilter(i, 'purchaseLink', e.target.value)}
                    placeholder="购买链接"
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  {filters.length > 1 && (
                    <button onClick={() => removeFilter(i)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!brand.trim() || !model.trim()}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {purifierId ? '保存' : '添加'}
          </button>
        </div>
      </div>
    </div>
  )
}

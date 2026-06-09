import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, Edit2, Trash2, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import PurifierFormModal from '@/components/PurifierFormModal'
import { FILTER_TYPE_ICONS } from '@/types'
import type { Purifier, FilterConfig } from '@/types'

export default function Purifiers() {
  const { purifiers, filterConfigs, deletePurifier } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingPurifier, setEditingPurifier] = useState<Purifier | null>(null)
  const [editingFilters, setEditingFilters] = useState<FilterConfig[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleEdit = (p: Purifier) => {
    const filters = filterConfigs.filter((f) => f.purifierId === p.id)
    setEditingPurifier(p)
    setEditingFilters(filters)
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditingPurifier(null)
    setEditingFilters([])
    setShowModal(true)
  }

  const handleClose = () => {
    setShowModal(false)
    setEditingPurifier(null)
    setEditingFilters([])
  }

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">净水器管理</h1>
          <p className="text-sm text-slate-400 mt-0.5">管理你的净水器和滤芯配置</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> 添加
        </button>
      </div>

      {purifiers.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Plus className="w-8 h-8 text-brand-300" />
          </div>
          <p className="text-sm text-slate-400">还没有净水器，点击上方添加</p>
        </div>
      ) : (
        <div className="space-y-4">
          {purifiers.map((p) => {
            const filters = filterConfigs.filter((f) => f.purifierId === p.id)
            const isExpanded = expandedId === p.id

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-fade-in">
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-slate-800">{p.brand}</h3>
                      <p className="text-sm text-slate-400">{p.model}</p>
                      <p className="text-xs text-slate-300 mt-1">
                        安装于 {format(new Date(p.installDate), 'yyyy年M月d日', { locale: zhCN })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {p.purchaseLink && (
                        <a
                          href={p.purchaseLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-slate-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(p)}
                        className="p-2 rounded-lg text-slate-300 hover:text-brand-600 hover:bg-brand-50 transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定删除此净水器及其所有滤芯配置？')) deletePurifier(p.id)
                        }}
                        className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : p.id)}
                    className="mt-3 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
                  >
                    {filters.length} 个滤芯配置
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-50 bg-slate-50/50 p-4">
                    <div className="space-y-2">
                      {filters.map((f) => (
                        <div key={f.id} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 text-sm">
                          <span>{FILTER_TYPE_ICONS[f.filterType]}</span>
                          <span className="font-medium text-slate-700">{f.filterType}</span>
                          <span className="text-xs text-slate-400">{f.suggestedLifespanDays} 天寿命</span>
                          {f.purchaseLink && (
                            <a
                              href={f.purchaseLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-auto text-xs text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors"
                            >
                              购买 <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <PurifierFormModal
        open={showModal}
        onClose={handleClose}
        purifierId={editingPurifier?.id || null}
        initialData={
          editingPurifier
            ? {
                brand: editingPurifier.brand,
                model: editingPurifier.model,
                installDate: editingPurifier.installDate,
                purchaseLink: editingPurifier.purchaseLink,
                filterConfigs: editingFilters,
              }
            : undefined
        }
      />
    </div>
  )
}

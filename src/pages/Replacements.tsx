import { useState } from 'react'
import { useStore } from '@/store'
import { Plus, Trash2 } from 'lucide-react'
import { ReplacementFormModal } from '@/components/FormModals'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { FILTER_TYPE_ICONS } from '@/types'

export default function Replacements() {
  const { replacements, filterConfigs, purifiers, deleteReplacement } = useStore()
  const [showModal, setShowModal] = useState(false)

  const sorted = [...replacements].sort((a, b) => b.replaceDate.localeCompare(a.replaceDate))

  const getFilterConfig = (id: string) => filterConfigs.find((f) => f.id === id)
  const getPurifier = (id: string) => purifiers.find((p) => p.id === id)

  const grouped: Record<string, typeof sorted> = {}
  sorted.forEach((r) => {
    const monthKey = r.replaceDate.slice(0, 7)
    if (!grouped[monthKey]) grouped[monthKey] = []
    grouped[monthKey].push(r)
  })

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">换芯记录</h1>
          <p className="text-sm text-slate-400 mt-0.5">查看和记录滤芯更换历史</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-700 hover:to-cyan-700 shadow-lg shadow-brand-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> 记录换芯
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-50 flex items-center justify-center">
            <Plus className="w-8 h-8 text-brand-300" />
          </div>
          <p className="text-sm text-slate-400">还没有换芯记录</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([monthKey, records]) => {
            const monthDate = new Date(monthKey + '-01')
            return (
              <div key={monthKey}>
                <h2 className="font-display text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  {format(monthDate, 'yyyy年M月', { locale: zhCN })}
                </h2>
                <div className="relative pl-6 space-y-3">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-200" />
                  {records.map((r) => {
                    const fc = getFilterConfig(r.filterConfigId)
                    const pur = getPurifier(r.purifierId)
                    return (
                      <div key={r.id} className="relative bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all group animate-slide-up">
                        <div className="absolute left-[-21px] top-5 w-3 h-3 rounded-full bg-brand-500 border-2 border-white shadow-sm" />
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {fc && <span className="text-base">{FILTER_TYPE_ICONS[fc.filterType]}</span>}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-display font-semibold text-sm text-slate-800">
                                  {fc?.filterType || '未知滤芯'}
                                </span>
                                <span className="text-xs text-slate-400">→</span>
                                <span className="text-xs text-slate-500">
                                  {pur ? `${pur.brand} ${pur.model}` : '未知净水器'}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">
                                {format(new Date(r.replaceDate), 'M月d日', { locale: zhCN })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {r.cost > 0 && (
                              <span className="text-sm font-display font-semibold text-brand-600">¥{r.cost.toFixed(2)}</span>
                            )}
                            <button
                              onClick={() => deleteReplacement(r.id)}
                              className="p-1.5 rounded-lg text-slate-200 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ReplacementFormModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  )
}

import { useState } from 'react'
import { useStore } from '@/store/useStore'
import { speciesTemplates } from '@/data/templates'
import { cn } from '@/lib/utils'

interface PlanFormProps {
  open: boolean
  onClose: () => void
}

export default function PlanForm({ open, onClose }: PlanFormProps) {
  const createPlan = useStore(s => s.createPlan)

  const [tankNumber, setTankNumber] = useState('')
  const [species, setSpecies] = useState('')
  const [speciesTemplate, setSpeciesTemplate] = useState(speciesTemplates[0]?.id ?? '')
  const [totalDays, setTotalDays] = useState(speciesTemplates[0]?.defaultDays ?? 14)
  const [startDate, setStartDate] = useState('')

  const selectedTemplate = speciesTemplates.find(t => t.id === speciesTemplate)

  const handleTemplateChange = (id: string) => {
    setSpeciesTemplate(id)
    const tmpl = speciesTemplates.find(t => t.id === id)
    if (tmpl) {
      setTotalDays(tmpl.defaultDays)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tankNumber.trim() || !species.trim() || !startDate) return
    createPlan({ tankNumber: tankNumber.trim(), species: species.trim(), speciesTemplate, totalDays, startDate })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        <h2 className="text-xl font-semibold text-cyan-400 mb-6">新建驯化计划</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">缸号</label>
            <input
              type="text"
              value={tankNumber}
              onChange={e => setTankNumber(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              placeholder="输入缸号"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">品种</label>
            <input
              type="text"
              value={species}
              onChange={e => setSpecies(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              placeholder="输入品种名称"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">模板</label>
            <select
              value={speciesTemplate}
              onChange={e => handleTemplateChange(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition appearance-none cursor-pointer"
            >
              {speciesTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedTemplate && (
              <p className="text-xs text-gray-500 mt-1">{selectedTemplate.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">驯化天数</label>
            <input
              type="number"
              min={7}
              max={30}
              value={totalDays}
              onChange={e => setTotalDays(Math.min(30, Math.max(7, Number(e.target.value))))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
            />
            <p className="text-xs text-gray-500 mt-1">范围 7 - 30 天</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1.5">开始日期</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg border border-gray-600 text-gray-300',
                'hover:bg-gray-800 transition'
              )}
            >
              取消
            </button>
            <button
              type="submit"
              className={cn(
                'flex-1 px-4 py-2.5 rounded-lg bg-cyan-500 text-gray-900 font-medium',
                'hover:bg-cyan-400 transition'
              )}
            >
              创建
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

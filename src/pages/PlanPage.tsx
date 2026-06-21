import { useState } from 'react'
import { useStore } from '@/store/useStore'
import PlanForm from '@/components/PlanForm'
import SpectrumTimeline from '@/components/SpectrumTimeline'
import SpectrumPreview from '@/components/SpectrumPreview'
import TemplateCards from '@/components/TemplateCards'
import { Plus, Trash2 } from 'lucide-react'

export default function PlanPage() {
  const { plans, activePlanId, setActivePlan, deletePlan, applyTemplate, schedules } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [previewDay, setPreviewDay] = useState(0)

  const activePlan = plans.find(p => p.id === activePlanId)

  const previewSchedule = activePlan
    ? schedules.find(s => s.planId === activePlan.id && s.dayIndex === previewDay)
    : null

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
              驯化计划
            </h1>
            <p className="text-sm text-slate-400 mt-1">规划灯谱渐变时间线，科学引导水母适应新缸光照</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,229,199,0.15)] transition-all duration-300"
          >
            <Plus size={18} />
            新建计划
          </button>
        </div>

        {plans.length > 0 && (
          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
            {plans.map(plan => (
              <div
                key={plan.id}
                onClick={() => { setActivePlan(plan.id); setPreviewDay(0) }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 min-w-fit ${
                  activePlanId === plan.id
                    ? 'bg-cyan-500/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,229,199,0.1)]'
                    : 'bg-slate-800/50 border border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="text-sm">
                  <span className="text-white font-medium">{plan.tankNumber}</span>
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-slate-300">{plan.species}</span>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deletePlan(plan.id) }}
                  className="text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activePlan && (
          <div className="space-y-6">
            <TemplateCards
              activeTemplateId={activePlan.speciesTemplate}
              onApply={(templateId) => applyTemplate(activePlan.id, templateId)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SpectrumTimeline planId={activePlan.id} onDayChange={setPreviewDay} />
              </div>
              <div>
                <SpectrumPreview
                  blueRatio={previewSchedule?.blueRatio ?? 0}
                  whiteRatio={previewSchedule?.whiteRatio ?? 0}
                  purpleRatio={previewSchedule?.purpleRatio ?? 0}
                  brightness={previewSchedule?.brightness ?? 0}
                />
              </div>
            </div>
          </div>
        )}

        {!activePlan && plans.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-slate-500">
            <div className="text-6xl mb-4 opacity-50">🪼</div>
            <p className="text-lg mb-2">尚未创建驯化计划</p>
            <p className="text-sm">点击「新建计划」开始配置灯谱渐变方案</p>
          </div>
        )}

        <PlanForm open={showForm} onClose={() => setShowForm(false)} />
      </div>
    </div>
  )
}

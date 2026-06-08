import { usePlanStore } from '@/store/planStore'
import { detectPitfalls } from '@/utils/pitfallDetect'
import { AlertTriangle, AlertOctagon } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PitfallAlert() {
  const { plans } = usePlanStore()

  if (plans.length === 0) return null

  const pitfalls = detectPitfalls(plans)

  if (pitfalls.length === 0) {
    return (
      <div>
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
          <span className="text-xl">⚠️</span>
          坑点提醒
        </h3>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-6 text-center">
          <p className="text-sm font-medium text-emerald-700">
            目前未检测到明显坑点，但仍建议仔细阅读合约条款
          </p>
        </div>
      </div>
    )
  }

  const dangerItems = pitfalls.filter((p) => p.type === 'danger')
  const warningItems = pitfalls.filter((p) => p.type === 'warning')

  return (
    <div>
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
        <span className="text-xl">⚠️</span>
        坑点提醒
        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
          {pitfalls.length}
        </span>
      </h3>

      <div className="space-y-3">
        {dangerItems.length > 0 && (
          <div className="space-y-2">
            {dangerItems.map((pitfall, i) => (
              <div
                key={`danger-${i}`}
                className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
              >
                <AlertOctagon size={20} className="mt-0.5 shrink-0 text-red-500" />
                <div>
                  <h4 className="text-sm font-bold text-red-800">
                    {pitfall.title}
                  </h4>
                  <p className="mt-0.5 text-sm text-red-700">
                    {pitfall.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {warningItems.length > 0 && (
          <div className="space-y-2">
            {warningItems.map((pitfall, i) => (
              <div
                key={`warning-${i}`}
                className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <AlertTriangle size={20} className="mt-0.5 shrink-0 text-amber-500" />
                <div>
                  <h4 className="text-sm font-bold text-amber-800">
                    {pitfall.title}
                  </h4>
                  <p className="mt-0.5 text-sm text-amber-700">
                    {pitfall.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
        <p className="text-xs text-slate-500">
          💡 提示：以上提醒基于你录入的数据自动分析，实际请以运营商合同为准。建议关注合约细则中的自动续约条款、速率承诺方式等。
        </p>
      </div>
    </div>
  )
}

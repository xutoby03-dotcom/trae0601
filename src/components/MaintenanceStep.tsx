import { ChevronDown, ChevronUp, Wrench } from 'lucide-react'
import { useState } from 'react'
import type { MaintenanceTemplate } from '@/types'

interface MaintenanceStepProps {
  template: MaintenanceTemplate
}

export default function MaintenanceStep({ template }: MaintenanceStepProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] transition-all duration-200 hover:border-white/10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-3.5"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]/10">
            <Wrench size={14} className="text-[#FF6B35]" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium text-[#F5F0EB]">
              {template.name}
            </div>
            <div className="text-[11px] text-white/30">
              {template.cycleDays > 0 ? `每 ${template.cycleDays} 天` : '按使用量判断'}
              {template.maxUsage > 0 &&
                ` · 上限 ${template.maxUsage}${template.maxUsageUnit}`}
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-white/30" />
        ) : (
          <ChevronDown size={16} className="text-white/30" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-white/[0.04] px-4 py-3">
          <div className="mb-3">
            <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
              保养步骤
            </h4>
            <ol className="space-y-2">
              {template.steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#FF6B35]/10 text-[10px] font-bold text-[#FF6B35]">
                    {i + 1}
                  </span>
                  <span className="text-white/60">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          {template.tools.length > 0 && (
            <div>
              <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-white/40">
                所需工具
              </h4>
              <div className="flex flex-wrap gap-2">
                {template.tools.map((tool, i) => (
                  <span
                    key={i}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-white/50"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

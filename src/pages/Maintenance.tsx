import { useState } from 'react'
import { maintenanceTemplates } from '@/utils/maintenanceTemplates'
import MaintenanceStep from '@/components/MaintenanceStep'
import type { GearType } from '@/types'
import { GEAR_TYPE_LABELS, GEAR_TYPE_ICONS } from '@/types'

const allTypes: GearType[] = ['running_shoe', 'racket', 'bicycle', 'yoga_mat']
const typeColors: Record<string, string> = {
  running_shoe: '#34D399',
  racket: '#60A5FA',
  bicycle: '#FBBF24',
  yoga_mat: '#C084FC',
}

export default function Maintenance() {
  const [selectedType, setSelectedType] = useState<GearType | 'all'>('all')

  const filtered =
    selectedType === 'all'
      ? maintenanceTemplates
      : maintenanceTemplates.filter((t) => t.gearType === selectedType)

  const grouped = allTypes
    .filter((t) => selectedType === 'all' || selectedType === t)
    .map((t) => ({
      type: t,
      templates: filtered.filter((tmpl) => tmpl.gearType === t),
    }))
    .filter((g) => g.templates.length > 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[#F5F0EB]">
          保养清单
        </h1>
        <p className="mt-1 text-sm text-white/30">
          按装备类型查看保养步骤和所需工具
        </p>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setSelectedType('all')}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
            selectedType === 'all'
              ? 'border-[#FF6B35]/40 bg-[#FF6B35]/15 text-[#FF6B35]'
              : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10'
          }`}
        >
          全部
        </button>
        {allTypes.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedType(t)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
              selectedType === t
                ? 'border-[#FF6B35]/40 bg-[#FF6B35]/15 text-[#FF6B35]'
                : 'border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/10'
            }`}
          >
            <span>{GEAR_TYPE_ICONS[t]}</span>
            {GEAR_TYPE_LABELS[t]}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {grouped.map(({ type, templates }) => (
          <div key={type}>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-base">{GEAR_TYPE_ICONS[type]}</span>
              <h2
                className="text-sm font-semibold"
                style={{ color: typeColors[type] }}
              >
                {GEAR_TYPE_LABELS[type]}
              </h2>
              <div
                className="h-px flex-1"
                style={{
                  background: `linear-gradient(90deg, ${typeColors[type]}40, transparent)`,
                }}
              />
            </div>
            <div className="space-y-2">
              {templates.map((tmpl, i) => (
                <MaintenanceStep key={i} template={tmpl} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

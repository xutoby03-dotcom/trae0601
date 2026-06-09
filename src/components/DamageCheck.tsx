import type { DamageType } from '@/types'
import { DAMAGE_TYPE_LABELS } from '@/types'
import { cn } from '@/lib/utils'
import { Bone, Wind, MousePointerClick, HelpCircle } from 'lucide-react'

const DAMAGE_ICONS: Record<DamageType, typeof Bone> = {
  rib_broken: Bone,
  canopy_torn: Wind,
  button_malfunction: MousePointerClick,
  other: HelpCircle,
}

interface Props {
  selected: DamageType[]
  onChange: (types: DamageType[]) => void
}

export default function DamageCheck({ selected, onChange }: Props) {
  const toggle = (type: DamageType) => {
    if (selected.includes(type)) {
      onChange(selected.filter((t) => t !== type))
    } else {
      onChange([...selected, type])
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.entries(DAMAGE_TYPE_LABELS) as [DamageType, string][]).map(([type, label]) => {
        const Icon = DAMAGE_ICONS[type]
        const isActive = selected.includes(type)
        return (
          <button
            key={type}
            onClick={() => toggle(type)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
              isActive
                ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
            )}
          >
            <Icon className={cn('w-4 h-4', isActive ? 'text-orange-500' : 'text-slate-400')} />
            <span className={cn('text-sm font-medium', isActive && 'font-semibold')}>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

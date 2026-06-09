import type { PhoneGroup } from '@/types'
import { GROUP_LABELS } from '@/types'

interface GroupTabsProps {
  activeGroup: PhoneGroup
  onGroupChange: (group: PhoneGroup) => void
  counts: { recyclable: number; backup: number; parts: number }
}

const GROUPS: PhoneGroup[] = ['recyclable', 'backup', 'parts']

export default function GroupTabs({ activeGroup, onGroupChange, counts }: GroupTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {GROUPS.map((group) => {
        const isActive = activeGroup === group
        return (
          <button
            key={group}
            onClick={() => onGroupChange(group)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-[#1B4332] text-white'
                : 'border border-[#1B4332] text-[#1B4332]'
            }`}
          >
            {GROUP_LABELS[group]}
            <span
              className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                isActive
                  ? 'bg-white/25 text-white'
                  : 'bg-[#1B4332]/10 text-[#1B4332]'
              }`}
            >
              {counts[group]}
            </span>
          </button>
        )
      })}
    </div>
  )
}

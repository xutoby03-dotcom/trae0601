import { cn } from '@/lib/utils'
import { TIMESLOT_CONFIG, type TimeSlot } from '@/lib/types'

interface Props {
  selected: TimeSlot | null
  onSelect: (slot: TimeSlot) => void
}

const SLOTS: TimeSlot[] = ['20min', '1hr', 'evening']

export default function TimeSelector({ selected, onSelect }: Props) {
  return (
    <div className="flex gap-3 justify-center">
      {SLOTS.map((slot) => {
        const config = TIMESLOT_CONFIG[slot]
        const isSelected = selected === slot

        return (
          <button
            key={slot}
            onClick={() => onSelect(slot)}
            className={cn(
              'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer border',
              isSelected
                ? 'bg-amber-600/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-900/20'
                : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600/50 hover:text-slate-300'
            )}
          >
            {config.label}
          </button>
        )
      })}
    </div>
  )
}

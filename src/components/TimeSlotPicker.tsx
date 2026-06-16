import { Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface TimeSlotPickerProps {
  slots: string[];
  selected: string;
  onChange: (slot: string) => void;
  disabledSlots?: string[];
}

export default function TimeSlotPicker({ slots, selected, onChange, disabledSlots = [] }: TimeSlotPickerProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Clock className="h-4 w-4" />
        <span>选择时段</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {slots.map((slot) => {
          const isDisabled = disabledSlots.includes(slot);
          const isSelected = selected === slot;
          return (
            <button
              key={slot}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onChange(slot)}
              className={cn(
                'relative rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-200',
                isSelected
                  ? 'border-teal-500 bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/25 scale-[1.02]'
                  : isDisabled
                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:bg-teal-50 hover:scale-[1.02]'
              )}
            >
              {slot}
              {isSelected && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

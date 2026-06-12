import type { ColorGrade } from '@/types';

interface ColorGradePickerProps {
  value: ColorGrade;
  onChange: (v: ColorGrade) => void;
}

const options: { value: ColorGrade; label: string; emoji: string; color: string }[] = [
  { value: 'light', label: '偏浅', emoji: '🌤️', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'good', label: '刚好', emoji: '✨', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'dark', label: '偏深', emoji: '🌰', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'burnt', label: '烤焦', emoji: '🔥', color: 'bg-red-100 text-red-800 border-red-300' },
];

export default function ColorGradePicker({ value, onChange }: ColorGradePickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
              active
                ? `${opt.color} border-current shadow-md scale-[1.03]`
                : 'bg-white border-copper-200 text-espresso-400 hover:border-copper-400 hover:text-espresso-700'
            }`}
          >
            <div className="text-xl mb-0.5">{opt.emoji}</div>
            <div className="text-sm">{opt.label}</div>
          </button>
        );
      })}
    </div>
  );
}

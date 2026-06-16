import { checkItems } from '../data/mockData';
import { Magnet, Droplets, Sparkles, Wind, Armchair } from 'lucide-react';
import type { Inspection } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  Magnet: <Magnet size={24} />,
  Droplets: <Droplets size={24} />,
  Sparkles: <Sparkles size={24} />,
  Wind: <Wind size={24} />,
  Armchair: <Armchair size={24} />,
};

interface CheckboxGroupProps {
  value: Partial<Pick<Inspection, 'adsorptionOk' | 'drainageOk' | 'cleaningOk' | 'dryingOk' | 'handrailOk'>>;
  onChange: (key: string, checked: boolean) => void;
}

export const CheckboxGroup = ({ value, onChange }: CheckboxGroupProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {checkItems.map((item, index) => {
        const isChecked = value[item.key];
        return (
          <label
            key={item.key}
            className={`relative flex items-start gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${isChecked ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/30'}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isChecked ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'}`}
            >
              {iconMap[item.icon]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className={`font-semibold ${isChecked ? 'text-emerald-700' : 'text-gray-800'}`}>
                  {item.label}
                </span>
                {isChecked && (
                  <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                    ✓ 正常
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            </div>
            <input
              type="checkbox"
              checked={isChecked || false}
              onChange={(e) => onChange(item.key, e.target.checked)}
              className="sr-only"
            />
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isChecked ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}
            >
              {isChecked && (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
};

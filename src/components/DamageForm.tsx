import { Check, X } from 'lucide-react';
import type { DamageCheck } from '../types';

interface DamageFormProps {
  value: DamageCheck;
  onChange: (value: DamageCheck) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
}

const items: { key: keyof DamageCheck; label: string; icon: string; desc: string }[] = [
  { key: 'missingPages', label: '缺页', icon: '📄', desc: '是否有页面缺失' },
  { key: 'doodles', label: '涂画', icon: '🎨', desc: '页面上是否有涂鸦' },
  { key: 'tornPages', label: '撕拉页', icon: '💔', desc: '页面是否有撕痕' },
  { key: 'stickers', label: '贴纸', icon: '⭐', desc: '是否有粘贴贴纸' },
  { key: 'accessories', label: '附件缺失', icon: '🧩', desc: '配套附件是否齐全' },
];

export default function DamageForm({ value, onChange, notes, onNotesChange }: DamageFormProps) {
  const toggle = (key: keyof DamageCheck) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((item) => {
          const checked = value[item.key];
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => toggle(item.key)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                checked
                  ? 'border-coral-400 bg-coral-400/10 shadow-soft'
                  : 'border-cream-200 bg-cream-50 hover:border-orange-300 hover:bg-orange-50/50'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                checked ? 'bg-coral-400/20' : 'bg-white'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${checked ? 'text-coral-600' : 'text-gray-700'}`}>
                    {item.label}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                checked ? 'bg-coral-500 text-white' : 'bg-gray-200'
              }`}>
                {checked ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
          );
        })}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">补充说明</label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          rows={3}
          className="input-field resize-none"
          placeholder="记录其他损坏情况或特殊说明..."
        />
      </div>
    </div>
  );
}

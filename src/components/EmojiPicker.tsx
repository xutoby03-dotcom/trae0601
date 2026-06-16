import React from 'react';
import { cn } from '../lib/utils';

interface EmojiOption {
  emoji: string;
  label: string;
  value: number;
}

interface EmojiPickerProps {
  value: number;
  onChange: (value: number) => void;
  options: EmojiOption[];
  label?: string;
  className?: string;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange, options, label, className }) => {
  return (
    <div className={className}>
      {label && <label className="label-base">{label}</label>}
      <div className="flex gap-2">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 p-3 rounded-xl transition-all duration-200',
                selected
                  ? 'bg-primary/20 border-2 border-primary scale-105'
                  : 'bg-warm-gray/50 border-2 border-transparent hover:bg-warm-gray'
              )}
            >
              <span className="text-2xl">{option.emoji}</span>
              <span className="text-xs font-medium text-warm-dark">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export const odorOptions: EmojiOption[] = [
  { emoji: '✨', label: '无异味', value: 0 },
  { emoji: '🌿', label: '轻微', value: 1 },
  { emoji: '😐', label: '明显', value: 2 },
  { emoji: '🤢', label: '严重', value: 3 },
];

export default EmojiPicker;

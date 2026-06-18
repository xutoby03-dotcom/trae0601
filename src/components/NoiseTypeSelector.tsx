import { Phone, Keyboard, Coffee, UserCheck, MessageSquare, Speaker } from 'lucide-react';
import type { NoiseType } from '@/types';
import { NOISE_TYPE_LABELS } from '@/types';

interface NoiseTypeSelectorProps {
  value: NoiseType | null;
  onChange: (value: NoiseType) => void;
}

const typeIcons: Record<NoiseType, typeof Phone> = {
  call: Phone,
  keyboard: Keyboard,
  eating: Coffee,
  occupied: UserCheck,
  talking: MessageSquare,
  equipment: Speaker,
};

const typeColors: Record<NoiseType, string> = {
  call: 'border-red-400 bg-red-50 text-red-700',
  keyboard: 'border-amber-400 bg-amber-50 text-amber-700',
  eating: 'border-orange-400 bg-orange-50 text-orange-700',
  occupied: 'border-purple-400 bg-purple-50 text-purple-700',
  talking: 'border-blue-400 bg-blue-50 text-blue-700',
  equipment: 'border-teal-400 bg-teal-50 text-teal-700',
};

const typeActiveColors: Record<NoiseType, string> = {
  call: 'border-red-500 bg-red-500 text-white',
  keyboard: 'border-amber-500 bg-amber-500 text-white',
  eating: 'border-orange-500 bg-orange-500 text-white',
  occupied: 'border-purple-500 bg-purple-500 text-white',
  talking: 'border-blue-500 bg-blue-500 text-white',
  equipment: 'border-teal-500 bg-teal-500 text-white',
};

export function NoiseTypeSelector({ value, onChange }: NoiseTypeSelectorProps) {
  const types: NoiseType[] = ['call', 'keyboard', 'eating', 'occupied', 'talking', 'equipment'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {types.map((type) => {
        const Icon = typeIcons[type];
        const isActive = value === type;
        return (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              isActive ? typeActiveColors[type] + ' shadow-md' : typeColors[type]
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-sm font-medium">{NOISE_TYPE_LABELS[type]}</span>
          </button>
        );
      })}
    </div>
  );
}

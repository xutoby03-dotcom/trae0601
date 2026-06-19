import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CheckSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  descriptions: [string, string, string, string];
}

const levelColors: Record<number, string> = {
  0: 'bg-green-500',
  1: 'bg-yellow-500',
  2: 'bg-orange-500',
  3: 'bg-red-500',
};

const levelTextColors: Record<number, string> = {
  0: 'text-green-600',
  1: 'text-yellow-600',
  2: 'text-orange-600',
  3: 'text-red-600',
};

export default function CheckSlider({ label, value, onChange, descriptions }: CheckSliderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <motion.span
          key={value}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn('text-sm font-semibold', levelTextColors[value])}
        >
          {descriptions[value]}
        </motion.span>
      </div>

      <div className="relative">
        <div className="flex items-center justify-between">
          {[0, 1, 2, 3].map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={cn(
                'w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center',
                value === level
                  ? cn(levelColors[value], 'border-transparent text-white scale-110')
                  : 'border-gray-300 hover:border-gray-400 bg-white'
              )}
            >
              <span className={cn('text-sm font-semibold', value === level ? 'text-white' : 'text-gray-500')}>
                {level}
              </span>
            </button>
          ))}
        </div>

        <div className="absolute top-1/2 left-5 right-5 -translate-y-1/2 h-1 bg-gray-200 -z-10 rounded-full overflow-hidden">
          <motion.div
            className={cn('h-full', levelColors[value])}
            initial={false}
            animate={{ width: `${(value / 3) * 100}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-400">
        <span>完好</span>
        <span>轻微</span>
        <span>明显</span>
        <span>严重</span>
      </div>
    </motion.div>
  );
}

import { useCallback } from 'react';

interface FilterSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  color?: string;
}

export const FilterSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  color = '#3b82f6',
}: FilterSliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-400">{label}</label>
        <span className="text-xs text-gray-300 font-mono w-12 text-right">
          {value > 0 ? `+${value}` : value}
        </span>
      </div>
      <div className="relative">
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1.5 rounded-l-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative w-full h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer z-10"
          style={{
            background: 'transparent',
          }}
        />
      </div>
    </div>
  );
};

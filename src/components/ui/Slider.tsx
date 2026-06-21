import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onValueChange?: (value: number) => void;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onValueChange?.(newValue);
      onChange?.(e);
    };

    return (
      <div className={cn('relative flex w-full items-center', className)}>
        <div className="absolute h-1.5 w-full rounded-full bg-slate-700">
          <div
            className="absolute h-full rounded-full bg-gradient-to-r from-cyan-500 to-cyan-400"
            style={{ width: `${((value - min) / (max - min)) * 100}%` }}
          />
        </div>
        <input
          type="range"
          ref={ref}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="relative w-full cursor-pointer appearance-none bg-transparent h-6"
          style={{
            WebkitAppearance: 'none',
          }}
          {...props}
        />
        <style>{`
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #06b6d4;
            cursor: pointer;
            border: 2px solid #0f172a;
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
            transition: all 0.2s;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.2);
            box-shadow: 0 0 15px rgba(6, 182, 212, 0.8);
          }
          input[type="range"]::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: #06b6d4;
            cursor: pointer;
            border: 2px solid #0f172a;
            box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
          }
        `}</style>
      </div>
    );
  }
);
Slider.displayName = 'Slider';

export { Slider };

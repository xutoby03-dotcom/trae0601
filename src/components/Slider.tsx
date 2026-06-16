import React from 'react';
import { cn } from '../lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  unit?: string;
  className?: string;
}

const Slider: React.FC<SliderProps> = ({ 
  value, 
  onChange, 
  min = 0, 
  max = 24, 
  step = 1,
  label,
  unit = '小时',
  className 
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="label-base mb-0">{label}</span>
          <span className="text-2xl font-bold text-primary font-display">
            {value}<span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
          </span>
        </div>
      )}
      <div className="relative h-3 bg-warm-gray rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
};

export default Slider;

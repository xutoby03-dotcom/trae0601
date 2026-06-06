import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';

interface EQKnobProps {
  value: number;
  min?: number;
  max?: number;
  label: string;
  onChange: (value: number) => void;
  color?: string;
}

export const EQKnob: React.FC<EQKnobProps> = ({
  value,
  min = -12,
  max = 12,
  label,
  onChange,
  color = '#00f5ff',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const rotation = ((value - min) / (max - min)) * 270 - 135;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = (max - min) / 200;
      const newValue = startValueRef.current + deltaY * sensitivity;
      
      onChange(Math.max(min, Math.min(max, newValue)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, onChange]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "relative w-16 h-16 rounded-full cursor-pointer select-none",
          "bg-gradient-to-br from-gray-800 to-gray-900",
          "border-2 border-gray-700 shadow-lg",
          "transition-shadow duration-150",
          isDragging && "shadow-xl"
        )}
        style={{
          boxShadow: isDragging
            ? `0 0 20px ${color}40, inset 0 2px 4px rgba(0,0,0,0.5)`
            : 'inset 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-gray-700 to-gray-900"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-4 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
          />
        </div>
        
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 64 64">
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            strokeDasharray="1 2"
            transform="rotate(-135 32 32)"
            strokeDashoffset="0"
            style={{ strokeDasharray: `${2 * Math.PI * 28 * 0.75} ${2 * Math.PI * 28 * 0.25}` }}
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke={color}
            strokeWidth="2"
            transform="rotate(-135 32 32)"
            strokeLinecap="round"
            style={{
              strokeDasharray: `${2 * Math.PI * 28 * 0.75}`,
              strokeDashoffset: `${2 * Math.PI * 28 * 0.75 * (1 - (value - min) / (max - min))}`,
            }}
          />
        </svg>
      </div>
      
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span 
        className="text-xs font-mono font-bold"
        style={{ color }}
      >
        {value > 0 ? '+' : ''}{value.toFixed(1)}dB
      </span>
    </div>
  );
};

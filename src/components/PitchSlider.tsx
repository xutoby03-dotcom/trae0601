import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';

interface PitchSliderProps {
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

export const PitchSlider: React.FC<PitchSliderProps> = ({
  value,
  onChange,
  color = '#00f5ff',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 100 / rect.height;
      const newValue = startValueRef.current + deltaY * sensitivity;
      
      onChange(Math.max(-50, Math.min(50, newValue)));
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
  }, [isDragging, onChange]);

  const percentage = ((value + 50) / 100) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
        PITCH
      </span>
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "relative w-6 h-48 rounded-full cursor-pointer select-none",
          "bg-gray-900 border-2 border-gray-700 shadow-inner"
        )}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-full bg-gray-700" />
        
        {[-50, -25, 0, 25, 50].map((v, i) => (
          <div
            key={i}
            className="absolute left-1/2 -translate-x-1/2 w-4 h-px bg-gray-600"
            style={{ top: `${100 - ((v + 50) / 100) * 100}%` }}
          />
        ))}
        
        <div
          className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-lg cursor-grab active:cursor-grabbing z-10"
          style={{
            top: `calc(${100 - percentage}% - 16px)`,
            background: 'linear-gradient(180deg, #4b5563, #1f2937)',
            border: '2px solid #6b7280',
            boxShadow: isDragging
              ? `0 0 20px ${color}80, 0 4px 12px rgba(0,0,0,0.5)`
              : '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-0.5">
            <div className="w-3 h-0.5 bg-gray-500 rounded-full" />
            <div className="w-3 h-0.5 bg-gray-500 rounded-full" />
          </div>
        </div>
      </div>
      <span 
        className="text-sm font-mono font-bold"
        style={{ color }}
      >
        {value > 0 ? '+' : ''}{value.toFixed(1)}%
      </span>
    </div>
  );
};

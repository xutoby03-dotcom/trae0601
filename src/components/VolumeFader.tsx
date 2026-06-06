import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';

interface VolumeFaderProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  color?: string;
  vertical?: boolean;
}

export const VolumeFader: React.FC<VolumeFaderProps> = ({
  value,
  onChange,
  label,
  color = '#00f5ff',
  vertical = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef(0);
  const startValueRef = useRef(0);

  const handleStart = useCallback((clientPos: number) => {
    setIsDragging(true);
    startPosRef.current = clientPos;
    startValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const delta = vertical
        ? startPosRef.current - e.clientY
        : e.clientX - startPosRef.current;
      const trackLength = vertical ? rect.height : rect.width;
      const sensitivity = 1 / trackLength;
      const newValue = startValueRef.current + delta * sensitivity;
      
      onChange(Math.max(0, Math.min(1, newValue)));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
    };
  }, [isDragging, vertical, onChange]);

  const percentage = value * 100;

  if (vertical) {
    return (
      <div className="flex flex-col items-center gap-2">
        {label && (
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {label}
          </span>
        )}
        <div
          ref={trackRef}
          onMouseDown={(e) => handleStart(e.clientY)}
          className={cn(
            "relative w-8 h-64 rounded-full cursor-pointer select-none",
            "bg-gray-900 border-2 border-gray-700",
            "shadow-inner"
          )}
        >
          <div
            className="absolute bottom-0 left-1 right-1 rounded-full transition-all duration-75"
            style={{
              height: `${percentage}%`,
              background: `linear-gradient(to top, ${color}, ${color}80)`,
              boxShadow: `0 0 10px ${color}60`,
            }}
          />
          
          <div
            className="absolute left-1/2 -translate-x-1/2 w-10 h-6 rounded-md cursor-grab active:cursor-grabbing"
            style={{
              bottom: `calc(${percentage}% - 12px)`,
              background: 'linear-gradient(180deg, #4b5563, #1f2937)',
              border: '2px solid #6b7280',
              boxShadow: isDragging
                ? `0 0 15px ${color}80, 0 4px 8px rgba(0,0,0,0.5)`
                : '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-1 bg-gray-500 rounded-full" />
          </div>
          
          <div className="absolute right-full mr-2 top-0 bottom-0 flex flex-col justify-between py-2">
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2 h-px bg-gray-600" />
              </div>
            ))}
          </div>
        </div>
        <span className="text-xs font-mono font-bold" style={{ color }}>
          {(value * 100).toFixed(0)}%
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {label}
        </span>
      )}
      <div
        ref={trackRef}
        onMouseDown={(e) => handleStart(e.clientX)}
        className={cn(
          "relative h-8 w-64 rounded-full cursor-pointer select-none",
          "bg-gray-900 border-2 border-gray-700",
          "shadow-inner"
        )}
      >
        <div
          className="absolute top-1 bottom-1 left-1 rounded-full transition-all duration-75"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(to right, ${color}, ${color}80)`,
            boxShadow: `0 0 10px ${color}60`,
          }}
        />
        
        <div
          className="absolute top-1/2 -translate-y-1/2 w-6 h-10 rounded-md cursor-grab active:cursor-grabbing"
          style={{
            left: `calc(${percentage}% - 12px)`,
            background: 'linear-gradient(90deg, #4b5563, #1f2937)',
            border: '2px solid #6b7280',
            boxShadow: isDragging
              ? `0 0 15px ${color}80, 0 4px 8px rgba(0,0,0,0.5)`
              : '0 2px 4px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-6 bg-gray-500 rounded-full" />
        </div>
      </div>
      <span className="text-xs font-mono font-bold" style={{ color }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
};

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';

interface CrossfaderProps {
  value: number;
  onChange: (value: number) => void;
}

export const Crossfader: React.FC<CrossfaderProps> = ({ value, onChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startValueRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    startValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !trackRef.current) return;
      
      const rect = trackRef.current.getBoundingClientRect();
      const deltaX = e.clientX - startXRef.current;
      const sensitivity = 2 / rect.width;
      const newValue = startValueRef.current + deltaX * sensitivity;
      
      onChange(Math.max(-1, Math.min(1, newValue)));
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

  const percentage = ((value + 1) / 2) * 100;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-bold text-cyan-400 tracking-widest">DECK A</span>
        <span className="text-xs text-gray-500 font-mono">
          {value.toFixed(2)}
        </span>
        <span className="text-sm font-bold text-fuchsia-400 tracking-widest">DECK B</span>
      </div>
      
      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "relative w-full h-12 rounded-lg cursor-pointer select-none",
          "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900",
          "border-2 border-gray-700 shadow-inner"
        )}
      >
        <div
          className="absolute top-1 bottom-1 left-1 right-1 rounded-md overflow-hidden"
          style={{
            background: 'linear-gradient(to right, #00f5ff20, transparent 50%, #ff00ff20)',
          }}
        >
          <div
            className="absolute top-0 bottom-0 transition-all duration-75"
            style={{
              left: '50%',
              width: `${Math.abs(percentage - 50) * 2}%`,
              transform: percentage > 50 ? 'translateX(0)' : 'translateX(-100%)',
              background: percentage > 50
                ? 'linear-gradient(to right, transparent, #ff00ff40)'
                : 'linear-gradient(to left, transparent, #00f5ff40)',
            }}
          />
        </div>
        
        <div
          className="absolute top-1/2 -translate-y-1/2 w-8 h-14 rounded-lg cursor-grab active:cursor-grabbing z-10"
          style={{
            left: `calc(${percentage}% - 16px)`,
            background: 'linear-gradient(180deg, #374151, #111827)',
            border: '2px solid #4b5563',
            boxShadow: isDragging
              ? '0 0 25px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.5)'
              : '0 2px 8px rgba(0,0,0,0.5)',
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-4 h-0.5 bg-gray-500 rounded-full" />
            <div className="w-4 h-0.5 bg-gray-500 rounded-full" />
            <div className="w-4 h-0.5 bg-gray-500 rounded-full" />
          </div>
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-6 bg-gray-600 rounded-full" />
      </div>
      
      <div className="flex justify-between w-full px-2">
        <div className="flex gap-1">
          {[0, 0.25, 0.5].map((v, i) => (
            <div key={i} className="w-0.5 h-2 bg-gray-600" />
          ))}
        </div>
        <div className="flex gap-1">
          {[0.5, 0.75, 1].map((v, i) => (
            <div key={i} className="w-0.5 h-2 bg-gray-600" />
          ))}
        </div>
      </div>
    </div>
  );
};

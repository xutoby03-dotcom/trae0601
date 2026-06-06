import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '../lib/utils';
import type { Effects } from '../types';

interface EffectsPanelProps {
  effects: Effects;
  onChange: (effects: Partial<Effects>) => void;
  deckColor: string;
}

interface EffectKnobProps {
  value: number;
  label: string;
  onChange: (value: number) => void;
  color: string;
}

const EffectKnob: React.FC<EffectKnobProps> = ({ value, label, onChange, color }) => {
  const [isDragging, setIsDragging] = useState(false);
  const knobRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startValueRef = useRef(0);

  const rotation = value * 270 - 135;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    startYRef.current = e.clientY;
    startValueRef.current = value;
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = startYRef.current - e.clientY;
      const sensitivity = 1 / 200;
      const newValue = startValueRef.current + deltaY * sensitivity;
      
      onChange(Math.max(0, Math.min(1, newValue)));
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

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className={cn(
          "relative w-12 h-12 rounded-full cursor-pointer select-none",
          "bg-gradient-to-br from-gray-800 to-gray-900",
          "border-2 border-gray-700 shadow-lg"
        )}
        style={{
          boxShadow: isDragging
            ? `0 0 15px ${color}40, inset 0 2px 4px rgba(0,0,0,0.5)`
            : 'inset 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <div
          className="absolute inset-1.5 rounded-full bg-gradient-to-br from-gray-700 to-gray-900"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div
            className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
          />
        </div>
        
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            transform="rotate(-135 24 24)"
            strokeDasharray={`${2 * Math.PI * 21 * 0.75}`}
          />
          <circle
            cx="24"
            cy="24"
            r="21"
            fill="none"
            stroke={color}
            strokeWidth="2"
            transform="rotate(-135 24 24)"
            strokeLinecap="round"
            style={{
              strokeDasharray: `${2 * Math.PI * 21 * 0.75}`,
              strokeDashoffset: `${2 * Math.PI * 21 * 0.75 * (1 - value)}`,
            }}
          />
        </svg>
      </div>
      
      <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-[10px] font-mono font-bold" style={{ color }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  );
};

export const EffectsPanel: React.FC<EffectsPanelProps> = ({ effects, onChange, deckColor }) => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-gray-900/50 border border-gray-700">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
        EFFECTS
      </span>
      
      <div className="flex justify-around">
        <EffectKnob
          value={effects.reverb}
          label="REVERB"
          onChange={(v) => onChange({ reverb: v })}
          color={deckColor}
        />
        <EffectKnob
          value={effects.delay}
          label="DELAY"
          onChange={(v) => onChange({ delay: v })}
          color={deckColor}
        />
        <EffectKnob
          value={effects.filter}
          label="FILTER"
          onChange={(v) => onChange({ filter: v })}
          color={deckColor}
        />
      </div>
      
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => onChange({ filterType: 'lowpass' })}
          className={cn(
            "px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all",
            "border-2",
            effects.filterType === 'lowpass'
              ? "bg-blue-600 border-blue-400 text-white"
              : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700"
          )}
        >
          LOW
        </button>
        <button
          onClick={() => onChange({ filterType: 'highpass' })}
          className={cn(
            "px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all",
            "border-2",
            effects.filterType === 'highpass'
              ? "bg-orange-600 border-orange-400 text-white"
              : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700"
          )}
        >
          HIGH
        </button>
      </div>
    </div>
  );
};

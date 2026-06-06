import React from 'react';
import { cn } from '../lib/utils';

interface BPMDisplayProps {
  bpm: number;
  detectedBPM?: number;
  isPlaying: boolean;
  beatPhase: number;
  isAligned?: boolean;
  color?: string;
}

export const BPMDisplay: React.FC<BPMDisplayProps> = ({
  bpm,
  detectedBPM,
  isPlaying,
  beatPhase,
  isAligned,
  color = '#00f5ff',
}) => {
  const isBeat = beatPhase < 0.1;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-4 h-4 rounded-full transition-all duration-75",
            isPlaying && isBeat
              ? "scale-125"
              : "scale-100 opacity-50"
          )}
          style={{
            backgroundColor: color,
            boxShadow: isPlaying && isBeat ? `0 0 15px ${color}` : 'none',
          }}
        />
        
        <div
          className={cn(
            "px-4 py-2 rounded-lg font-mono font-bold text-2xl",
            "bg-gray-900 border-2 transition-all duration-150"
          )}
          style={{
            borderColor: isAligned === false ? '#ff3333' : color,
            boxShadow: isAligned === false 
              ? '0 0 20px #ff333350' 
              : isAligned 
                ? `0 0 20px ${color}50`
                : 'none',
          }}
        >
          <span style={{ color: isAligned === false ? '#ff3333' : color }}>
            {bpm.toFixed(1)}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">BPM</span>
        {detectedBPM && detectedBPM !== bpm && (
          <span className="text-xs text-gray-600 font-mono">
            (detected: {detectedBPM})
          </span>
        )}
        {isAligned === false && (
          <span className="text-xs text-red-500 font-bold animate-pulse">
            ⚠ BEATS NOT ALIGNED
          </span>
        )}
        {isAligned && (
          <span className="text-xs text-green-500 font-bold">
            ✓ SYNCED
          </span>
        )}
      </div>
    </div>
  );
};

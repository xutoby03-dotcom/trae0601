import React from 'react';
import { cn } from '../lib/utils';

interface CueButtonsProps {
  cuePoints: number[];
  onSetCue: (index: number) => void;
  onJumpToCue: (index: number) => void;
  disabled?: boolean;
}

export const CueButtons: React.FC<CueButtonsProps> = ({
  cuePoints,
  onSetCue,
  onJumpToCue,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
        CUE POINTS
      </span>
      <div className="grid grid-cols-4 gap-2">
        {cuePoints.map((time, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <button
              onClick={() => onJumpToCue(index)}
              onDoubleClick={() => onSetCue(index)}
              disabled={disabled}
              className={cn(
                "w-10 h-10 rounded-md font-bold text-sm transition-all duration-150",
                "border-2 flex items-center justify-center",
                time > 0
                  ? "bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-500/30 hover:bg-amber-500"
                  : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              title={time > 0 ? `Jump to ${formatTime(time)} (Double-click to set)` : 'Double-click to set cue'}
            >
              {index + 1}
            </button>
            <span className="text-[10px] font-mono text-gray-500">
              {time > 0 ? formatTime(time) : '--:--'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

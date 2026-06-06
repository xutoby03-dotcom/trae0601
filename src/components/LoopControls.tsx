import React from 'react';
import { cn } from '../lib/utils';

interface LoopControlsProps {
  loopEnabled: boolean;
  loopBeats: 1 | 2 | 4 | 8;
  onToggleLoop: () => void;
  onSetBeats: (beats: 1 | 2 | 4 | 8) => void;
  disabled?: boolean;
}

export const LoopControls: React.FC<LoopControlsProps> = ({
  loopEnabled,
  loopBeats,
  onToggleLoop,
  onSetBeats,
  disabled = false,
}) => {
  const beatOptions: (1 | 2 | 4 | 8)[] = [1, 2, 4, 8];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
        LOOP
      </span>
      <div className="flex flex-col gap-2">
        <button
          onClick={onToggleLoop}
          disabled={disabled}
          className={cn(
            "px-4 py-2 rounded-md font-bold text-sm uppercase tracking-wider transition-all duration-150",
            "border-2",
            loopEnabled
              ? "bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/30 animate-pulse"
              : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {loopEnabled ? 'LOOP ON' : 'LOOP OFF'}
        </button>
        
        <div className="grid grid-cols-4 gap-1">
          {beatOptions.map((beats) => (
            <button
              key={beats}
              onClick={() => onSetBeats(beats)}
              disabled={disabled}
              className={cn(
                "py-2 rounded-md font-bold text-sm transition-all duration-150",
                "border-2",
                loopBeats === beats && loopEnabled
                  ? "bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700 hover:border-gray-500",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {beats}
            </button>
          ))}
        </div>
        
        <span className="text-[10px] text-gray-500 text-center">
          Beats
        </span>
      </div>
    </div>
  );
};

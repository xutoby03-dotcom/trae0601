import React from 'react';
import { NoteDuration, DURATION_LABELS } from '../types/score';
import { Music, Pause, Play, Square } from 'lucide-react';

interface ToolbarProps {
  currentDuration: NoteDuration;
  onDurationChange: (duration: NoteDuration) => void;
  bpm: number;
  onBpmChange: (bpm: number) => void;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onStop: () => void;
}

const durations: NoteDuration[] = ['whole', 'half', 'quarter', 'eighth', 'sixteenth'];

export const Toolbar: React.FC<ToolbarProps> = ({
  currentDuration,
  onDurationChange,
  bpm,
  onBpmChange,
  isPlaying,
  onPlayToggle,
  onStop,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">简谱编辑器</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">时值：</span>
          <div className="flex gap-1">
            {durations.map((duration) => (
              <button
                key={duration}
                onClick={() => onDurationChange(duration)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  currentDuration === duration
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {DURATION_LABELS[duration]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600">BPM：</span>
          <input
            type="range"
            min="40"
            max="200"
            value={bpm}
            onChange={(e) => onBpmChange(parseInt(e.target.value))}
            className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="text-sm font-mono text-gray-800 w-10">{bpm}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPlayToggle}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? '暂停' : '播放'}
          </button>
          <button
            onClick={onStop}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Square className="w-4 h-4" />
            停止
          </button>
        </div>
      </div>
    </div>
  );
};

import { Play, Pause, SkipBack, SkipForward, Volume2, Gauge } from 'lucide-react';
import { formatTimeShort } from '@/utils';

interface PlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onPlaybackRateChange: (rate: number) => void;
}

const playbackRates = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function PlayerControls({
  isPlaying,
  currentTime,
  duration,
  playbackRate,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  onPlaybackRateChange,
}: PlayerControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    onSeek(percent * duration);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onSkipBack}
          className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-700/50 rounded-lg"
          title="后退5秒"
        >
          <SkipBack size={20} />
        </button>

        <button
          onClick={onPlayPause}
          className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white shadow-lg shadow-orange-500/25 transition-all hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>

        <button
          onClick={onSkipForward}
          className="p-2 text-slate-400 hover:text-white transition-colors hover:bg-slate-700/50 rounded-lg"
          title="前进5秒"
        >
          <SkipForward size={20} />
        </button>

        <div className="flex-1 flex items-center gap-3">
          <span className="text-sm text-slate-400 font-mono w-14 text-right">
            {formatTimeShort(currentTime)}
          </span>
          <div
            className="flex-1 h-2 bg-slate-700 rounded-full cursor-pointer relative group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
          <span className="text-sm text-slate-500 font-mono w-14">
            {formatTimeShort(duration)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Volume2 size={16} />
          <span className="text-xs">音量</span>
        </div>

        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-slate-400" />
          <div className="flex gap-1">
            {playbackRates.map((rate) => (
              <button
                key={rate}
                onClick={() => onPlaybackRateChange(rate)}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  playbackRate === rate
                    ? 'bg-orange-500/20 text-orange-400 font-medium'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

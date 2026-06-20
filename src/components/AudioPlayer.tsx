import { memo, useCallback } from 'react';
import { Play, Pause, SkipBack, Volume2, Loader2 } from 'lucide-react';
import { VUMeter } from './VUMeter';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils/audio';

interface AudioPlayerProps {
  audioUrl: string;
  takeId: string;
  compact?: boolean;
  autoPlay?: boolean;
}

export const AudioPlayer = memo(function AudioPlayer({
  audioUrl,
  takeId,
  compact = false,
  autoPlay = false,
}: AudioPlayerProps) {
  const { isPlaying, isLoading, currentTime, duration, vuLevel, togglePlay, seek } =
    useAudioPlayer(audioUrl, takeId, { autoPlay });

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (duration <= 0) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      seek(percentage * duration);
    },
    [duration, seek]
  );

  const handleRestart = useCallback(() => {
    seek(0);
  }, [seek]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={togglePlay}
          disabled={isLoading}
          className="w-10 h-10 rounded-full bg-accent-amber text-studio-bg flex items-center justify-center flex-shrink-0 hover:bg-accent-amberHover transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <div
            className="h-1.5 bg-studio-border rounded-full overflow-hidden cursor-pointer group"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-gradient-to-r from-accent-amber to-accent-amberHover transition-all duration-100"
              style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-[10px] text-studio-textDim font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 w-full">
      <button
        onClick={togglePlay}
        disabled={isLoading}
        className="w-12 h-12 rounded-full bg-accent-amber text-studio-bg flex items-center justify-center flex-shrink-0 hover:bg-accent-amberHover transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-accent-amber/30"
      >
        {isLoading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-6 h-6" />
        ) : (
          <Play className="w-6 h-6 ml-1" />
        )}
      </button>

      <button
        onClick={handleRestart}
        className="w-8 h-8 rounded-full bg-studio-card border border-studio-border flex items-center justify-center hover:bg-studio-hover hover:border-accent-amber/50 transition-colors"
        title="重新开始"
      >
        <SkipBack className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div
          className="h-2 bg-studio-border rounded-full overflow-hidden cursor-pointer group"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-gradient-to-r from-accent-amber to-accent-purple transition-all duration-100 relative"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-studio-textDim font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <VUMeter level={vuLevel} size="sm" />
        <Volume2 className="w-4 h-4 text-studio-textDim" />
      </div>
    </div>
  );
});

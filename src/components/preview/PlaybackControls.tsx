import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { usePlaybackStore } from '@/store/usePlaybackStore';

export function PlaybackControls() {
  const { isPlaying, currentTime, duration, togglePlay, seekByFrames, setCurrentTime } = usePlaybackStore();

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    setCurrentTime(percentage * duration);
  };

  return (
    <div className="flex flex-col items-center gap-2 w-full px-4">
      <div
        className="w-full h-2 bg-zinc-700 rounded-full cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-cyan-500 rounded-full relative"
          style={{ width: `${(currentTime / duration) * 100}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => seekByFrames(-10)}
          title="后退10帧"
        >
          <SkipBack className="w-5 h-5" />
        </button>
        
        <button
          className="p-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white transition-colors"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-0.5" />
          )}
        </button>
        
        <button
          className="p-2 text-zinc-400 hover:text-white transition-colors"
          onClick={() => seekByFrames(10)}
          title="前进10帧"
        >
          <SkipForward className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2 ml-4">
          <Volume2 className="w-4 h-4 text-zinc-400" />
        </div>
      </div>
    </div>
  );
}

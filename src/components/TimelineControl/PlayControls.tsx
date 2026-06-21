import { useTimeline } from '../../hooks/useTimeline';
import { useWindStore } from '../../store/useWindStore';
import { Button } from '../ui/Button';
import { Play, Pause, SkipBack, SkipForward, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PlayControlsProps {
  speeds?: number[];
}

export const PlayControls = ({ speeds = [0.5, 1, 2, 4] }: PlayControlsProps) => {
  const {
    isPlaying,
    playbackSpeed,
    togglePlay,
    prevHour,
    nextHour,
    goToStart,
    goToEnd,
  } = useTimeline();

  return (
    <div className="flex items-center gap-1">
      <Button
        size="icon"
        variant="ghost"
        onClick={goToStart}
        title="回到开始"
        className="h-8 w-8"
      >
        <ChevronsLeft size={16} />
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={prevHour}
        title="上一小时"
        className="h-8 w-8"
      >
        <SkipBack size={16} />
      </Button>
      
      <Button
        size="icon"
        variant="default"
        onClick={togglePlay}
        title={isPlaying ? '暂停' : '播放'}
        className="h-10 w-10 mx-1"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={nextHour}
        title="下一小时"
        className="h-8 w-8"
      >
        <SkipForward size={16} />
      </Button>
      
      <Button
        size="icon"
        variant="ghost"
        onClick={goToEnd}
        title="跳到结束"
        className="h-8 w-8"
      >
        <ChevronsRight size={16} />
      </Button>

      <div className="flex items-center gap-0.5 ml-2">
        {speeds.map((speed) => (
          <Button
            key={speed}
            size="sm"
            variant={playbackSpeed === speed ? 'default' : 'ghost'}
            onClick={() => useWindStore.getState().setPlaybackSpeed(speed)}
            className="h-7 px-2 text-xs font-mono"
          >
            {speed}x
          </Button>
        ))}
      </div>
    </div>
  );
};

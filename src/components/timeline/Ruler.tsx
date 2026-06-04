import { useMemo } from 'react';
import { formatTime } from '@/utils/timecode';

interface RulerProps {
  duration: number;
  zoom: number;
  scrollLeft: number;
  currentTime: number;
  onSeek: (time: number) => void;
}

export function Ruler({ duration, zoom, scrollLeft, currentTime, onSeek }: RulerProps) {
  const pixelsPerSecond = zoom;
  const totalWidth = duration * pixelsPerSecond;

  const ticks = useMemo(() => {
    const result: { time: number; label: string; major: boolean }[] = [];
    const interval = zoom < 30 ? 5 : zoom < 100 ? 1 : 0.5;
    
    for (let t = 0; t <= duration; t += interval) {
      result.push({
        time: t,
        label: formatTime(t),
        major: t % 1 === 0,
      });
    }
    return result;
  }, [duration, zoom]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left + scrollLeft;
    const time = x / pixelsPerSecond;
    onSeek(Math.max(0, Math.min(time, duration)));
  };

  return (
    <div
      className="relative h-8 bg-zinc-800 border-b border-zinc-700 overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="absolute inset-0"
        style={{ transform: `translateX(-${scrollLeft}px)` }}
      >
        {ticks.map((tick) => (
          <div
            key={tick.time}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: tick.time * pixelsPerSecond }}
          >
            <div className={`w-px ${tick.major ? 'h-4 bg-zinc-500' : 'h-2 bg-zinc-600'}`} />
            {tick.major && (
              <span className="text-xs text-zinc-400 mt-1 whitespace-nowrap">
                {tick.label}
              </span>
            )}
          </div>
        ))}
        
        <div
          className="absolute top-0 w-0.5 h-full bg-cyan-500 z-10"
          style={{ left: currentTime * pixelsPerSecond }}
        >
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-cyan-500 rotate-45" />
        </div>
      </div>
    </div>
  );
}

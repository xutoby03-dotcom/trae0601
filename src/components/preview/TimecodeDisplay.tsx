import { formatTimecode } from '@/utils/timecode';
import { usePlaybackStore } from '@/store/usePlaybackStore';

export function TimecodeDisplay() {
  const { currentTime, duration, fps } = usePlaybackStore();

  return (
    <div className="flex items-center gap-2 font-mono text-sm">
      <span className="text-cyan-400">{formatTimecode(currentTime, fps)}</span>
      <span className="text-zinc-500">/</span>
      <span className="text-zinc-400">{formatTimecode(duration, fps)}</span>
    </div>
  );
}

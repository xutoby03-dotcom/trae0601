import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";
import { formatDuration } from "@/utils/format";

const PLAYBACK_RATES = [0.5, 1, 1.5, 2];

export default function PlaybackControls() {
  const p = usePlayerStore();
  const progress = p.duration > 0 ? (p.currentTime / p.duration) * 100 : 0;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    p.seek(ratio * p.duration);
  };

  return (
    <div className="px-4 py-3 space-y-3 border-t border-forest-700/40">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => p.seekBy(-10)}
            disabled={p.duration === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-cream hover:bg-forest-800/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="后退10秒"
          >
            <SkipBack className="w-4 h-4" strokeWidth={2} />
          </button>
          <button
            onClick={() => p.toggle()}
            disabled={p.duration === 0}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed",
              "bg-amber-500 hover:bg-amber-600 text-white"
            )}
            title={p.isPlaying ? "暂停" : "播放"}
          >
            {p.isPlaying ? (
              <Pause className="w-5 h-5" strokeWidth={2.5} fill="currentColor" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" strokeWidth={2.5} fill="currentColor" />
            )}
          </button>
          <button
            onClick={() => p.seekBy(10)}
            disabled={p.duration === 0}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-cream hover:bg-forest-800/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            title="前进10秒"
          >
            <SkipForward className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-3">
          <div
            className="flex-1 h-1.5 rounded-full bg-forest-800/80 cursor-pointer relative group"
            onClick={handleProgressClick}
          >
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-moss-400 to-amber-400 rounded-full"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-amber-400 shadow-md shadow-forest-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ left: `calc(${progress}% - 6px)` }}
            />
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums shrink-0">
            {formatDuration(p.currentTime)} / {formatDuration(p.duration)}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-forest-800/40 rounded-lg p-0.5 border border-forest-700/40">
            {PLAYBACK_RATES.map((r) => (
              <button
                key={r}
                onClick={() => p.setRate(r)}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-semibold transition-all",
                  p.playbackRate === r
                    ? "bg-amber-500/20 text-amber-400"
                    : "text-slate-400 hover:text-slate-200"
                )}
              >
                {r}x
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 w-28">
            <Volume2 className="w-4 h-4 text-slate-500 shrink-0" strokeWidth={2} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={p.volume}
              onChange={(e) => p.setVolume(Number(e.target.value))}
              className="flex-1 h-1.5 appearance-none bg-forest-800/80 rounded-full cursor-pointer accent-moss-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

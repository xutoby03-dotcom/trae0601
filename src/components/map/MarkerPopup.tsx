import { useEffect, useRef } from "react";
import { Lock, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type Recording as UIRecording } from "@/store/uiStore";
import { usePlayerStore } from "@/store/playerStore";
import { formatDuration, formatDate } from "@/utils/format";

interface Props {
  recording: UIRecording;
}

const tagColorMap: Record<string, string> = {
  雨林: "#059669",
  森林: "#10b981",
  山脉: "#6366f1",
  高原: "#8b5cf6",
  海岸: "#0ea5e9",
  海洋: "#0284c7",
  瀑布: "#06b6d4",
  河流: "#14b8a6",
  湿地: "#84cc16",
  乡村: "#a3e635",
  城市: "#64748b",
  沙漠: "#f59e0b",
};

export default function MarkerPopup({ recording }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const playerLoad = usePlayerStore((s) => s.loadRecording);
  const playerToggle = usePlayerStore((s) => s.toggle);
  const currentId = usePlayerStore((s) => s.currentRecordingId);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const progress = duration > 0 ? currentTime / duration : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const waveform = recording.waveform ?? [];
    const slice = waveform.slice(0, 100);
    const tagColor = recording.tags[0] ? tagColorMap[recording.tags[0]] ?? "#22c55e" : "#22c55e";

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, tagColor + "ee");
    grad.addColorStop(1, tagColor + "33");

    const playedGrad = ctx.createLinearGradient(0, 0, 0, h);
    playedGrad.addColorStop(0, "#fbbf24");
    playedGrad.addColorStop(1, "#f59e0b88");

    const barCount = Math.max(slice.length, 1);
    const barW = w / barCount;
    const mid = h / 2;
    const playX = currentId === recording.id ? w * progress : -1;

    for (let i = 0; i < barCount; i++) {
      const v = Math.abs(slice[i] ?? 0);
      const bh = Math.max(1, v * mid * 0.85);
      const x = i * barW;
      ctx.fillStyle = x < playX ? playedGrad : grad;
      ctx.globalAlpha = x < playX ? 1 : 0.95;
      ctx.fillRect(x, mid - bh, Math.max(0.8, barW * 0.65), bh * 2);
    }
    ctx.globalAlpha = 1;

    if (currentId === recording.id && progress > 0 && progress < 1) {
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(playX, 2);
      ctx.lineTo(playX, h - 2);
      ctx.stroke();
    }
  }, [recording, currentId, progress, currentTime, duration]);

  const isLocked = recording.isLocked;
  const isThisPlaying = currentId === recording.id && isPlaying;

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentId !== recording.id) {
      playerLoad(recording.id, recording.duration);
    }
    playerToggle();
  };

  return (
    <div
      className={cn(
        "w-[280px] rounded-xl shadow-2xl overflow-hidden",
        "bg-forest-900/92 backdrop-blur-xl border border-forest-700/50"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between p-3 pb-2.5 border-b border-forest-700/30">
        <div className="flex-1 min-w-0">
          <h4 className="font-display text-[15px] text-cream leading-tight mb-1">
            {recording.locationName}
          </h4>
          <div className="flex items-center gap-1.5 flex-wrap">
            {recording.tags.slice(0, 3).map((t) => {
              const c = tagColorMap[t] ?? "#22c55e";
              return (
                <span
                  key={t}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium"
                  style={{
                    backgroundColor: c + "22",
                    color: c,
                    border: `1px solid ${c}33`,
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 ml-2 shrink-0">
          {isLocked && (
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                "bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-semibold"
              )}
            >
              <Lock className="w-2.5 h-2.5" strokeWidth={2.5} />
              已锁定
            </span>
          )}
          <span className="text-[10px] font-mono text-slate-500">{recording.fileName}</span>
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div
          className={cn(
            "relative rounded-lg overflow-hidden border",
            "bg-forest-950/70 border-forest-700/40",
            "hover:border-moss-500/40 transition-colors"
          )}
        >
          <canvas
            ref={canvasRef}
            className="w-full block"
            style={{ height: 52 }}
          />
          <button
            onClick={handlePlay}
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
              "w-9 h-9 rounded-full flex items-center justify-center",
              "bg-forest-950/75 backdrop-blur-sm border border-white/15",
              "text-white hover:text-amber-300 hover:border-amber-400/50 transition-all",
              "hover:scale-110 active:scale-95",
              isThisPlaying && "text-amber-300 border-amber-400/50"
            )}
          >
            {isThisPlaying ? (
              <Pause className="w-4 h-4" strokeWidth={2.5} />
            ) : (
              <Play className="w-4 h-4 translate-x-[1px]" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-2",
          "px-3 py-2.5 border-t border-forest-700/30",
          "bg-forest-950/30"
        )}
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 tabular-nums">
            <span className="inline-flex items-center gap-1">
              ⏱ {formatDuration(recording.duration)}
            </span>
            <span className="text-slate-600">·</span>
            <span>🌡 {recording.weather.condition}</span>
            <span className="text-slate-600">·</span>
            <span>🔊 {recording.peakDbfs.toFixed(1)}dB</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono truncate">
            {formatDate(recording.recordedAt)} · {recording.deviceModel}
          </span>
        </div>
        <button
          onClick={() => openDetailPanel(recording.id)}
          className={cn(
            "shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg",
            "bg-amber-500/10 border border-amber-500/30",
            "text-[11px] font-semibold text-amber-400",
            "hover:bg-amber-500/15 hover:border-amber-500/50 hover:text-amber-300",
            "transition-all"
          )}
        >
          详情
          <span className="text-amber-500/70">→</span>
        </button>
      </div>
    </div>
  );
}

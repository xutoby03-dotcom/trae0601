import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";
import { useRecordingStore } from "@/store/recordingStore";
import { annotationColorMap } from "@/lib/colors";
import { formatDuration } from "@/utils/format";
import type { Annotation, Recording } from "@/types";

export default function WaveformCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const p = usePlayerStore();
  const recording = useRecordingStore((s) =>
    p.currentRecordingId ? s.getById(p.currentRecordingId) : undefined
  );
  const waveform = recording?.waveform ?? recording?.waveformData ?? [];
  const annotations: Annotation[] = recording?.annotations ?? [];

  const [hoverInfo, setHoverInfo] = useState<{
    x: number;
    y: number;
    time: number;
  } | null>(null);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const draw = () => {
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
    ctx.fillStyle = "#0f1e19";
    ctx.fillRect(0, 0, w, h);

    // 网格参考线：每 20% 一条虚线
    ctx.strokeStyle = "rgba(39, 81, 67, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    for (let i = 1; i < 5; i++) {
      const gx = (w * i) / 5;
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, h);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    if (waveform.length === 0) return;
    const duration = p.duration || recording?.duration || 0;

    // 绘制标注色块
    for (const ann of annotations) {
      const info = annotationColorMap[ann.type];
      if (!info) continue;
      const x1 = duration > 0 ? (ann.startTime / duration) * w : 0;
      const x2 = duration > 0 ? (ann.endTime / duration) * w : w;
      const bandH = 22;
      ctx.fillStyle = info.solid + "28";
      ctx.fillRect(x1, 0, x2 - x1, bandH);
      ctx.strokeStyle = info.solid + "66";
      ctx.lineWidth = 1;
      ctx.strokeRect(x1 + 0.5, 0.5, x2 - x1 - 1, bandH - 1);
      ctx.fillStyle = info.solid;
      ctx.font = "600 10px Inter, system-ui, sans-serif";
      const label = `${info.emoji} ${info.label}`;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x1 + 2, 2, Math.max(0, x2 - x1 - 4), bandH - 4);
      ctx.clip();
      ctx.fillText(label, x1 + 5, 14);
      ctx.restore();
    }

    // 绘制波形条
    const playRatio = duration > 0 ? p.currentTime / duration : 0;
    const playedX = playRatio * w;
    const barCount = waveform.length;
    const barW = w / barCount;
    const mid = h / 2;
    const baseTop = 30;

    const playedGrad = ctx.createLinearGradient(0, baseTop, 0, h - 6);
    playedGrad.addColorStop(0, "#a7f3d0");
    playedGrad.addColorStop(0.5, "#84cc16");
    playedGrad.addColorStop(1, "#fef3c7");

    const normalGrad = ctx.createLinearGradient(0, baseTop, 0, h - 6);
    normalGrad.addColorStop(0, "#275143");
    normalGrad.addColorStop(1, "#5d9a83");

    for (let i = 0; i < barCount; i++) {
      const v = Math.abs(waveform[i] ?? 0);
      const bh = Math.max(1, v * (h - baseTop - 10) * 0.45);
      const x = i * barW;
      const isPlayed = x + barW / 2 <= playedX;
      ctx.fillStyle = isPlayed ? playedGrad : normalGrad;
      const bw = Math.max(0.8, barW * 0.75);
      ctx.fillRect(x, mid - bh, bw, bh * 2);
    }

    // 绘制选区
    if (p.selection) {
      const x1 = duration > 0 ? (p.selection.start / duration) * w : 0;
      const x2 = duration > 0 ? (p.selection.end / duration) * w : 0;
      ctx.fillStyle = "rgba(251, 191, 36, 0.18)";
      ctx.fillRect(Math.min(x1, x2), 0, Math.abs(x2 - x1), h);
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(Math.min(x1, x2) + 0.5, 0);
      ctx.lineTo(Math.min(x1, x2) + 0.5, h);
      ctx.moveTo(Math.max(x1, x2) + 0.5, 0);
      ctx.lineTo(Math.max(x1, x2) + 0.5, h);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 播放头
    if (duration > 0) {
      const px = playRatio * w;
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.moveTo(px - 5, 0);
      ctx.lineTo(px + 5, 0);
      ctx.lineTo(px, 7);
      ctx.closePath();
      ctx.fill();
    }

    // 十字准星+时间提示
    if (hoverInfo) {
      ctx.strokeStyle = "rgba(254, 243, 199, 0.25)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(hoverInfo.x, 0);
      ctx.lineTo(hoverInfo.x, h);
      ctx.moveTo(0, hoverInfo.y);
      ctx.lineTo(w, hoverInfo.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  };

  useEffect(() => {
    draw();
  }, [p.currentTime, p.duration, p.selection, waveform, annotations, recording, hoverInfo]);

  useEffect(() => {
    const w = wrapRef.current;
    if (!w) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(w);
    return () => ro.disconnect();
  }, []);

  const duration = p.duration || recording?.duration || 0;
  const timeFromX = (x: number) => {
    const wrap = wrapRef.current;
    if (!wrap || duration <= 0) return 0;
    const rect = wrap.getBoundingClientRect();
    return Math.max(0, Math.min(duration, ((x - rect.left) / rect.width) * duration));
  };
  const xFromClient = (x: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return 0;
    const rect = wrap.getBoundingClientRect();
    return Math.max(0, Math.min(rect.width, x - rect.left));
  };

  const onMouseMove = (e: React.MouseEvent) => {
    setHoverInfo({
      x: xFromClient(e.clientX),
      y: xFromClient(e.clientY + 0),
      time: timeFromX(e.clientX),
    });
    if (dragStart != null) {
      const now = timeFromX(e.clientX);
      const start = dragStart;
      p.setSelection({
        start: Math.min(start, now),
        end: Math.max(start, now),
      });
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    const t = timeFromX(e.clientX);
    setDragStart(t);
    p.setSelection(null);
  };

  const onMouseUp = (e: React.MouseEvent) => {
    const t = timeFromX(e.clientX);
    if (dragStart != null && Math.abs(dragStart - t) < 0.08) {
      p.seek(t);
      p.setSelection(null);
    }
    setDragStart(null);
  };

  const onMouseLeave = () => {
    setHoverInfo(null);
    if (dragStart != null) setDragStart(null);
  };

  return (
    <div
      ref={wrapRef}
      className={cn(
        "relative h-[200px] w-full rounded-xl overflow-hidden cursor-crosshair select-none",
        "bg-forest-950 border border-forest-700/40"
      )}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {hoverInfo && duration > 0 && (
        <div
          className="pointer-events-none absolute px-2 py-1 rounded-md bg-forest-900/95 border border-forest-700/60 text-[10px] font-mono text-amber-300 tabular-nums shadow-xl"
          style={{
            left: Math.min(hoverInfo.x + 8, (wrapRef.current?.clientWidth ?? 200) - 80),
            top: 4,
          }}
        >
          {formatDuration(hoverInfo.time)}
        </div>
      )}
    </div>
  );
}

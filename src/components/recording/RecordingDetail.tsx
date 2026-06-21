import { useEffect, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  MapPin,
  Thermometer,
  Mic,
  Calendar,
  Tags,
  Wind,
  Droplets,
  Mountain,
  Radio,
  FileAudio,
  Play,
  Trash2,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type Annotation, type AnnotationType } from "@/store/uiStore";
import { usePlayerStore } from "@/store/playerStore";
import WaveformCanvas from "@/components/waveform/WaveformCanvas";
import PlaybackControls from "@/components/waveform/PlaybackControls";
import AnnotationToolbar from "@/components/waveform/AnnotationToolbar";
import { annotationColorMap } from "@/lib/colors";
import { formatDuration, formatDate, formatCoords } from "@/utils/format";

export default function RecordingDetail() {
  const selectedId = useUIStore((s) => s.selectedRecordingId);
  const recording = useUIStore((s) =>
    selectedId ? s.getRecordingById(selectedId) : undefined
  );
  const playerLoad = usePlayerStore((s) => s.loadRecording);
  const playerId = usePlayerStore((s) => s.currentRecordingId);
  const deleteAnnotation = useUIStore((s) => s.deleteAnnotation);
  const seek = usePlayerStore((s) => s.seek);
  const setSelection = usePlayerStore((s) => s.setSelection);
  const playerIsPlaying = usePlayerStore((s) => s.isPlaying);
  const playerToggle = usePlayerStore((s) => s.toggle);

  useEffect(() => {
    if (!recording) return;
    if (playerId !== recording.id) {
      playerLoad(recording.id, recording.duration);
    }
  }, [recording, playerId, playerLoad]);

  const annotationStats = useMemo(() => {
    if (!recording) return { total: 0, loops: 0, issues: 0 };
    const loops = recording.annotations.filter((a) => a.type === "loop").length;
    const issues = recording.annotations.filter(
      (a) => a.type === "wind_noise" || a.type === "traffic" || a.type === "voice"
    ).length;
    return { total: recording.annotations.length, loops, issues };
  }, [recording]);

  if (!recording) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-500 px-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-forest-800/40 border border-forest-700/40 flex items-center justify-center mb-4">
          <span className="text-2xl">🎵</span>
        </div>
        <p className="text-sm">选择一条录音以查看详情</p>
        <p className="text-xs mt-1 text-slate-600">
          点击地图上的标记或素材库中的条目
        </p>
      </div>
    );
  }

  const handleAnnotationClick = (ann: Annotation) => {
    if (playerId !== recording.id) {
      playerLoad(recording.id, recording.duration);
    }
    setSelection({ start: ann.startTime, end: ann.endTime });
    seek(ann.startTime);
    if (!playerIsPlaying) playerToggle();
  };

  const distanceList = ["近景", "中近景", "中景", "远景", "极远景"];
  const distIdx = distanceList.indexOf(recording.distanceSense);

  return (
    <div className="space-y-5 pb-8">
      <section className="px-5 pt-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              {recording.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-forest-800/60 text-slate-300 border border-forest-700/60"
                >
                  {t}
                </span>
              ))}
              {recording.isLocked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-semibold">
                  🔒 已授权锁定
                </span>
              )}
            </div>
            <h2 className="font-display text-xl text-cream leading-tight">
              {recording.locationName}
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-mono truncate">
              {recording.fileName}
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-300 leading-relaxed">
          {recording.description}
        </p>
      </section>

      <section className="px-5">
        <div className="rounded-2xl overflow-hidden border border-forest-700/40 bg-gradient-to-br from-forest-950 to-forest-900/60">
          <div className="px-4 py-3 border-b border-forest-700/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-cream animate-pulse" />
              <span className="text-sm font-semibold text-cream">波形预览</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 tabular-nums">
              <span className="px-1.5 py-0.5 rounded bg-forest-800/60">
                {recording.sampleRate / 1000} kHz
              </span>
              <span className="px-1.5 py-0.5 rounded bg-forest-800/60">
                {recording.bitDepth} bit
              </span>
              <span className="px-1.5 py-0.5 rounded bg-forest-800/60">
                {recording.channels === 2 ? "立体声" : "单声道"}
              </span>
            </div>
          </div>
          <div className="p-4">
            <div style={{ height: 200 }}>
              <WaveformCanvas />
            </div>
          </div>
          <PlaybackControls />
          <AnnotationToolbar />
        </div>
      </section>

      <section className="px-5">
        <div className="rounded-2xl bg-forest-900/40 border border-forest-700/40 p-4 space-y-5">
          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>🎚️</span> 氛围分析
          </h4>

          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-[90px] h-[90px]">
                <svg width={90} height={90} viewBox="0 0 100 100" className="-rotate-90">
                  <defs>
                    <linearGradient id="ambGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#84cc16" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx={50}
                    cy={50}
                    r={34}
                    fill="none"
                    stroke="#163d2d"
                    strokeWidth={7}
                  />
                  <circle
                    cx={50}
                    cy={50}
                    r={34}
                    fill="none"
                    stroke="url(#ambGrad)"
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 34}
                    strokeDashoffset={
                      2 * Math.PI * 34 * (1 - Math.max(0, Math.min(1, recording.ambienceScore / 10)))
                    }
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-display font-bold text-cream">
                    {recording.ambienceScore.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-slate-500 -mt-0.5">/ 10</span>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">氛围值</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-[90px] flex items-center justify-center">
                <div className="space-y-1.5 w-full">
                  {distanceList.map((d, i) => (
                    <div key={d} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "h-1.5 flex-1 rounded-full transition-all",
                          i <= distIdx
                            ? "bg-gradient-to-r from-moss-400 to-amber-400"
                            : "bg-forest-800/60"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[10px] w-12 text-right tabular-nums",
                          i === distIdx ? "text-amber-300 font-semibold" : "text-slate-500"
                        )}
                      >
                        {d}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">距离感</span>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-full h-[90px] flex flex-col justify-end gap-1.5">
                <div className="text-[11px] text-slate-400 font-mono text-right">
                  0 dBFS
                </div>
                <div className="flex-1 flex items-end gap-1.5">
                  {Array.from({ length: 16 }).map((_, i) => {
                    const v = recording.peakDbfs;
                    const threshold = -12 + (i / 15) * 12;
                    const active = v >= threshold;
                    const color =
                      i >= 13
                        ? "bg-rust-500"
                        : i >= 10
                        ? "bg-amber-400"
                        : "bg-moss-400";
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 rounded-sm transition-all",
                          active ? color : "bg-forest-800/60"
                        )}
                        style={{
                          height: active ? `${30 + i * 4}%` : "12%",
                        }}
                      />
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-500 font-mono text-right">
                  {recording.peakDbfs.toFixed(1)} dB
                </div>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">音量峰值</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>📋</span> 采集元数据
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <MetaCard icon={MapPin} iconColor="text-moss-400" label="坐标位置">
            <div className="text-sm font-mono text-slate-200">
              {formatCoords(recording.latitude, recording.longitude)}
            </div>
            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Mountain className="w-3 h-3" />
              海拔 {recording.altitude.toFixed(0)} m
            </div>
          </MetaCard>

          <MetaCard icon={Calendar} iconColor="text-amber-400" label="采集时间">
            <div className="text-sm font-mono text-slate-200">
              {formatDate(recording.recordedAt)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              时长 {formatDuration(recording.duration)}
            </div>
          </MetaCard>

          <MetaCard icon={Mic} iconColor="text-sky-400" label="设备与指向">
            <div className="text-sm text-slate-200 truncate" title={recording.deviceModel}>
              {recording.deviceModel}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Radio className="w-3 h-3" />
              {recording.micPattern}
            </div>
          </MetaCard>

          <MetaCard icon={Thermometer} iconColor="text-rust-400" label="天气条件">
            <div className="text-sm text-slate-200">{recording.weather.condition}</div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5">
                <Thermometer className="w-3 h-3" />
                {recording.weather.temperature}°C
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Droplets className="w-3 h-3" />
                {recording.weather.humidity}%
              </span>
              <span className="inline-flex items-center gap-0.5">
                <Wind className="w-3 h-3" />
                {recording.weather.windSpeed}m/s
              </span>
            </div>
          </MetaCard>

          <MetaCard icon={FileAudio} iconColor="text-purple-400" label="文件信息">
            <div className="text-sm font-mono text-slate-200">{recording.format}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              {recording.fileSize} · {recording.channels} 声道
            </div>
          </MetaCard>

          <MetaCard icon={Tags} iconColor="text-pink-400" label="环境标签">
            <div className="flex flex-wrap gap-1">
              {recording.tags.map((t) => (
                <span
                  key={t}
                  className="px-1.5 py-0.5 rounded bg-forest-800/60 text-[10px] text-slate-300 border border-forest-700/50"
                >
                  {t}
                </span>
              ))}
            </div>
          </MetaCard>
        </div>
      </section>

      <section className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>🏷️</span> 标注列表
            <span className="text-[10px] font-normal text-slate-500 ml-1">
              ({annotationStats.total} 条 · {annotationStats.loops} 循环 · {annotationStats.issues} 问题)
            </span>
          </h4>
        </div>

        {recording.annotations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-forest-700/50 bg-forest-800/20 py-8 text-center">
            <Volume2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500">暂无标注</p>
            <p className="text-[11px] text-slate-600 mt-1">
              在波形上拖拽选区，然后用下方工具栏添加标注
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recording.annotations.map((ann) => (
              <AnnotationItem
                key={ann.id}
                ann={ann}
                onPlay={() => handleAnnotationClick(ann)}
                onDelete={() => deleteAnnotation(recording.id, ann.id)}
              />
            ))}
          </div>
        )}
      </section>

      {recording.notes && (
        <section className="px-5">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <span>📝</span> 采集笔记
            </h4>
          </div>
          <div className="rounded-xl bg-amber-500/5 border border-amber-500/20 p-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              {recording.notes}
            </p>
          </div>
        </section>
      )}
    </div>
  );
}

function MetaCard({
  icon: Icon,
  label,
  children,
  iconColor = "text-amber-400",
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
  iconColor?: string;
}) {
  return (
    <div className="rounded-xl p-3 border bg-forest-800/50 border-forest-700/50 space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-medium">
        <Icon className={cn("w-3.5 h-3.5", iconColor)} strokeWidth={2} />
        <span>{label}</span>
      </div>
      {children}
    </div>
  );
}

function AnnotationItem({
  ann,
  onPlay,
  onDelete,
}: {
  ann: Annotation;
  onPlay: () => void;
  onDelete: () => void;
}) {
  const info = annotationColorMap[ann.type as AnnotationType];
  if (!info) return null;

  return (
    <div
      className="group relative flex items-stretch gap-3 p-2.5 rounded-xl cursor-pointer bg-forest-800/30 border border-transparent hover:bg-forest-800/60 hover:border-forest-700/60 transition-all"
      onClick={onPlay}
    >
      <div
        className="w-1 shrink-0 rounded-full"
        style={{ backgroundColor: info.solid }}
      />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-semibold border",
              info.bg,
              info.text,
              info.border
            )}
          >
            <span>{info.emoji}</span>
            <span>{info.label}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 tabular-nums">
            {formatDuration(ann.startTime)} → {formatDuration(ann.endTime)}
          </span>
        </div>
        <div className="text-sm text-slate-200 font-medium truncate">{ann.label}</div>
        {ann.description && (
          <p className="text-xs text-slate-500 line-clamp-1">{ann.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-cream hover:bg-forest-700/50 transition-colors"
          title="播放此段"
        >
          <Play className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rust-400 hover:bg-rust-500/10 transition-colors"
          title="删除标注"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

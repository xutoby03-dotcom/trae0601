import { useRef, useEffect, useState, useMemo } from 'react';
import { Play, Eye, CheckSquare, Square, Lock } from 'lucide-react';
import {
  useUIStore,
  type Recording as UIRecording,
  AVAILABILITY_ANNOTATION_TYPES,
} from '@/store/uiStore';
import { usePlayerStore } from '@/store/playerStore';
import { cn } from '@/lib/utils';
import { annotationColorMap } from '@/lib/colors';
import type { AnnotationType } from '@/types';

interface RecordingCardProps {
  recording: UIRecording;
  index: number;
  compact?: boolean;
}

const envGradientMap: Record<string, string> = {
  雨林: 'linear-gradient(135deg, #166534 0%, #14532d 50%, #052e16 100%)',
  海岸: 'linear-gradient(135deg, #0369a1 0%, #075985 50%, #082f49 100%)',
  瀑布: 'linear-gradient(135deg, #0e7490 0%, #155e75 50%, #083344 100%)',
  山脉: 'linear-gradient(135deg, #44403c 0%, #292524 50%, #1c1917 100%)',
  乡村: 'linear-gradient(135deg, #a16207 0%, #713f12 50%, #422006 100%)',
  沙漠: 'linear-gradient(135deg, #b45309 0%, #78350f 50%, #431407 100%)',
  森林: 'linear-gradient(135deg, #166534 0%, #14532d 50%, #052e16 100%)',
  海洋: 'linear-gradient(135deg, #0369a1 0%, #075985 50%, #082f49 100%)',
  河流: 'linear-gradient(135deg, #0e7490 0%, #155e75 50%, #083344 100%)',
  高原: 'linear-gradient(135deg, #57534e 0%, #44403c 50%, #292524 100%)',
  湿地: 'linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)',
  城市: 'linear-gradient(135deg, #334155 0%, #1e293b 50%, #0f172a 100%)',
};

function pickGradient(tags: string[]): string {
  for (const t of tags) {
    for (const k of Object.keys(envGradientMap)) {
      if (t.includes(k) || k.includes(t)) return envGradientMap[k];
    }
  }
  return 'linear-gradient(135deg, #166534 0%, #0f2a1f 50%, #0a1f17 100%)';
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RecordingCard({ recording, index, compact = false }: RecordingCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const openDetailPanelAction = useUIStore((s) => s.openDetailPanel);
  const batchSelectedIds = useUIStore((s) => s.batchSelectedIds);
  const toggleRecordingSelected = useUIStore((s) => s.toggleRecordingSelected);
  const annotationTypeFilter = useUIStore((s) => s.annotationTypeFilter);
  const setAnnotationTypeFilter = useUIStore((s) => s.setAnnotationTypeFilter);
  const playerToggle = usePlayerStore((s) => s.toggle);
  const playerLoad = usePlayerStore((s) => s.loadRecording);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentRecordingId = usePlayerStore((s) => s.currentRecordingId ?? s.recordingId);
  const active = isPlaying && currentRecordingId === recording.id;

  const gradient = pickGradient(recording.tags);

  const availabilityTypes = useMemo(() => {
    const types = new Set<AnnotationType>();
    recording.annotations.forEach((a) => {
      if (AVAILABILITY_ANNOTATION_TYPES.includes(a.type)) {
        types.add(a.type);
      }
    });
    return Array.from(types);
  }, [recording.annotations]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const data = recording.waveform.slice(0, 80);
    if (data.length === 0) return;

    const step = w / data.length;
    const mid = h / 2;

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(254, 243, 199, 0.9)');
    grad.addColorStop(0.5, 'rgba(74, 222, 128, 0.8)');
    grad.addColorStop(1, 'rgba(45, 122, 87, 0.6)');
    ctx.fillStyle = grad;

    for (let i = 0; i < data.length; i++) {
      const amp = data[i] * mid * 0.9;
      const x = i * step;
      ctx.fillRect(x, mid - amp, Math.max(step - 0.8, 1), amp * 2);
    }
  }, [recording.waveform]);

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRecordingSelected?.(recording.id);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentRecordingId !== recording.id) {
      playerLoad(recording.id, recording.duration);
    }
    playerToggle();
  };

  const handleDetail = () => {
    openDetailPanelAction?.(recording.id);
  };

  const isSelected = Array.isArray(batchSelectedIds) && batchSelectedIds.includes(recording.id);
  const ambientDots = Array.from({ length: 10 }, (_, i) => i < Math.min(Math.max(recording.tags.length * 2, 4), 10));
  const firstChar = recording.locationName.split(/[-·（）()\s]/)[0] || '?';

  return (
    <div
      className={cn(
        'group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300',
        'hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/40',
        compact ? 'h-64' : 'aspect-[4/5]',
        'animate-float-in'
      )}
      style={{
        animationDelay: `${Math.min(index * 30, 500)}ms`,
        animationFillMode: 'both',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleDetail}
    >
      <div className="absolute inset-0 noise-bg" style={{ background: gradient }}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-6 left-6 font-display text-5xl font-bold text-white/30 leading-none tracking-tight select-none">
            {firstChar}
          </div>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {recording.isLocked && (
            <div className="w-8 h-8 rounded-full bg-amber-500/90 backdrop-blur flex items-center justify-center shadow-lg">
              <Lock className="w-4 h-4 text-forest-950" strokeWidth={2.5} />
            </div>
          )}
        </div>

        <div className="absolute top-3 right-3 flex flex-wrap gap-1 justify-end max-w-[55%] z-10">
          {recording.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 text-[10px] rounded-full bg-black/40 backdrop-blur-md text-cream/90 border border-white/10 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div
          className={cn(
            'absolute top-3 right-3 transition-opacity duration-200 z-20',
            isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
          onClick={handleSelect}
        >
          {isSelected ? (
            <CheckSquare className="w-6 h-6 text-amber-400 drop-shadow-lg" fill="currentColor" />
          ) : (
            <Square className="w-6 h-6 text-white/80 drop-shadow-lg" />
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-4 pt-12 z-10">
        <canvas ref={canvasRef} className="w-full h-10 mb-2 opacity-90" />

        <div className="flex items-center justify-between text-xs text-slate-300/80 mb-2 font-mono">
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" fill={active ? 'currentColor' : 'none'} />
            {formatDuration(recording.duration)}
          </span>
          <span>{recording.recordedAt.slice(0, 10)}</span>
        </div>

        <h3 className="font-display text-lg font-semibold text-white mb-1.5 line-clamp-1 leading-tight">
          {recording.locationName}
        </h3>

        {availabilityTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {availabilityTypes.map((t) => {
              const info = annotationColorMap[t];
              const active = annotationTypeFilter === t;
              return (
                <button
                  key={t}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAnnotationTypeFilter(annotationTypeFilter === t ? null : t);
                  }}
                  className={cn(
                    "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-all",
                    active
                      ? `${info.bg} ${info.text} ${info.border} ring-1 ring-offset-1 ring-offset-black/60 ${info.border}`
                      : "bg-white/10 text-slate-300 border-white/15 hover:bg-white/15"
                  )}
                  title={`点击筛选带「${info.label}」的素材`}
                >
                  <span>{info.emoji}</span>
                  <span>{info.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            {ambientDots.map((on, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  on ? 'bg-moss-400 shadow-[0_0_4px_rgba(74,222,128,0.6)]' : 'bg-slate-500/50'
                )}
              />
            ))}
            <span className="ml-1.5 text-[10px] text-slate-400 font-mono truncate max-w-[80px]">
              {recording.fileName.split('_')[0]}
            </span>
          </div>

          <div
            className={cn(
              'flex items-center gap-1 transition-all duration-200',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            )}
          >
            <button
              onClick={handlePlay}
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                active
                  ? 'bg-moss-400 text-forest-950'
                  : 'bg-white/15 hover:bg-amber-500 text-white hover:text-forest-950 backdrop-blur'
              )}
            >
              <Play className="w-4 h-4" fill="currentColor" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDetail();
              }}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-forest-600 text-white backdrop-blur flex items-center justify-center transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {isSelected && (
        <div className="absolute inset-0 ring-2 ring-amber-400 rounded-2xl pointer-events-none z-30" />
      )}
    </div>
  );
}

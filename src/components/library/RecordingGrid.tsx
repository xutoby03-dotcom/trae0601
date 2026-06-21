import { useMemo, useState } from "react";
import {
  Play,
  Pause,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  FileAudio,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useUIStore,
  type Recording,
  AVAILABILITY_ANNOTATION_TYPES,
} from "@/store/uiStore";
import { annotationColorMap } from "@/lib/colors";
import type { AnnotationType } from "@/types";

export default function RecordingGrid() {
  const recordings = useUIStore((s) => s.recordings);
  const searchQuery = useUIStore((s) => s.searchQuery);
  const ambienceMin = useUIStore((s) => s.ambienceMin);
  const ambienceMax = useUIStore((s) => s.ambienceMax);
  const distanceSenses = useUIStore((s) => s.distanceSenses);
  const peakMin = useUIStore((s) => s.peakMin);
  const peakMax = useUIStore((s) => s.peakMax);
  const lockedFilter = useUIStore((s) => s.lockedFilter);
  const annotationTypeFilter = useUIStore((s) => s.annotationTypeFilter);
  const setAnnotationTypeFilter = useUIStore((s) => s.setAnnotationTypeFilter);
  const selectedRecordingIds = useUIStore((s) => s.selectedRecordingIds);
  const selectedRecordingId = useUIStore((s) => s.selectedRecordingId);
  const toggleRecordingSelected = useUIStore((s) => s.toggleRecordingSelected);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const toggleRecordingLock = useUIStore((s) => s.toggleRecordingLock);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recordings.filter((r) => {
      if (
        q &&
        !r.fileName.toLowerCase().includes(q) &&
        !r.locationName.toLowerCase().includes(q) &&
        !r.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        return false;
      }
      if (r.ambienceScore < ambienceMin || r.ambienceScore > ambienceMax) {
        return false;
      }
      if (distanceSenses.length > 0 && !distanceSenses.includes(r.distanceSense)) {
        return false;
      }
      if (r.peakDbfs < peakMin || r.peakDbfs > peakMax) {
        return false;
      }
      if (lockedFilter !== null && r.isLocked !== lockedFilter) {
        return false;
      }
      if (annotationTypeFilter !== null) {
        const hasType = r.annotations.some((a) => a.type === annotationTypeFilter);
        if (!hasType) return false;
      }
      return true;
    });
  }, [
    recordings,
    searchQuery,
    ambienceMin,
    ambienceMax,
    distanceSenses,
    peakMin,
    peakMax,
    lockedFilter,
    annotationTypeFilter,
  ]);

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      {filtered.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-500 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-forest-800/40 border border-forest-700/40 flex items-center justify-center mb-4">
            <span className="text-2xl">🔍</span>
          </div>
          <p className="text-sm font-medium text-slate-300 mb-1">没有符合条件的素材</p>
          <p className="text-xs">试试调整筛选范围或清空筛选条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {filtered.map((r) => {
            const isSelected = selectedRecordingIds.includes(r.id);
            const isActive = selectedRecordingId === r.id;

            return (
              <GridCard
                key={r.id}
                recording={r}
                isSelected={isSelected}
                isActive={isActive}
                annotationTypeFilter={annotationTypeFilter}
                formatDuration={formatDuration}
                onToggleSelect={() => toggleRecordingSelected(r.id)}
                onOpen={() => openDetailPanel(r.id)}
                onToggleLock={() => toggleRecordingLock(r.id)}
                onFilterAnnotation={(t) =>
                  setAnnotationTypeFilter(annotationTypeFilter === t ? null : t)
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

interface GridCardProps {
  recording: Recording;
  isSelected: boolean;
  isActive: boolean;
  annotationTypeFilter: AnnotationType | null;
  formatDuration: (sec: number) => string;
  onToggleSelect: () => void;
  onOpen: () => void;
  onToggleLock: () => void;
  onFilterAnnotation: (type: AnnotationType) => void;
}

function GridCard({
  recording,
  isSelected,
  isActive,
  annotationTypeFilter,
  formatDuration,
  onToggleSelect,
  onOpen,
  onToggleLock,
  onFilterAnnotation,
}: GridCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const availabilityTypes = useMemo(() => {
    const types = new Set<AnnotationType>();
    recording.annotations.forEach((a) => {
      if (AVAILABILITY_ANNOTATION_TYPES.includes(a.type)) {
        types.add(a.type);
      }
    });
    return Array.from(types);
  }, [recording.annotations]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
      className={cn(
        "group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
        "bg-forest-900/50 border backdrop-blur-sm",
        isActive
          ? "border-amber-500/50 ring-2 ring-amber-500/30 shadow-xl shadow-amber-500/10"
          : isSelected
          ? "border-forest-500/50 shadow-lg shadow-forest-500/10"
          : "border-forest-700/40 hover:border-forest-600/60 hover:shadow-lg"
      )}
    >
      <div
        className={cn(
          "absolute top-2.5 left-2.5 z-20 transition-opacity duration-200",
          isHovered || isSelected ? "opacity-100" : "opacity-0"
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={cn(
            "w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all duration-150 backdrop-blur",
            isSelected
              ? "bg-amber-500 border-amber-500 shadow-md shadow-amber-500/30"
              : "bg-forest-950/60 border-forest-500/60 hover:border-amber-400"
          )}
        >
          {isSelected && (
            <CheckCircle2
              className="w-4 h-4 text-forest-950"
              strokeWidth={3}
            />
          )}
        </button>
      </div>

      <div
        className={cn(
          "absolute top-2.5 right-2.5 z-20 transition-all duration-200",
          recording.isLocked ? "opacity-100" : "opacity-0 hover:opacity-100"
        )}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={cn(
            "w-7 h-7 rounded-lg flex items-center justify-center backdrop-blur transition-all",
            recording.isLocked
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-forest-950/60 text-slate-500 border border-forest-700/50 hover:text-slate-300"
          )}
        >
          {recording.isLocked ? (
            <Lock className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <Unlock className="w-3.5 h-3.5" strokeWidth={2} />
          )}
        </button>
      </div>

      <div className="relative aspect-[16/10] bg-forest-950 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(15, 30, 25, 0.9) 0%, rgba(20, 83, 45, 0.4) 100%)",
          }}
        />

        <div className="absolute inset-x-0 inset-y-[35%] flex items-center gap-[2px] px-4">
          {recording.waveform.slice(0, 50).map((val, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 rounded-full transition-colors",
                isActive ? "bg-amber-400/80" : "bg-forest-500/60"
              )}
              style={{ height: `${val * 100}%` }}
            />
          ))}
        </div>

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-all duration-300",
            isHovered || isActive ? "opacity-100" : "opacity-40"
          )}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPlaying((v) => !v);
            }}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "bg-amber-500 hover:bg-amber-400 text-forest-950 shadow-2xl shadow-amber-500/40",
              "transition-all duration-200 hover:scale-110 active:scale-95"
            )}
          >
            {isPlaying ? (
              <Pause
                className="w-6 h-6"
                strokeWidth={2.5}
                fill="currentColor"
              />
            ) : (
              <Play
                className="w-6 h-6 ml-0.5"
                strokeWidth={2.5}
                fill="currentColor"
              />
            )}
          </button>
        </div>

        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-forest-950/70 backdrop-blur text-[10px] font-mono text-slate-300 border border-forest-700/40 tabular-nums">
            {formatDuration(recording.duration)}
          </span>
        </div>
      </div>

      <div className="p-3.5 space-y-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-400/5 border border-amber-500/25 flex items-center justify-center shrink-0">
            <FileAudio className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <h4
              className={cn(
                "text-sm font-semibold truncate",
                isActive ? "text-amber-400" : "text-slate-100"
              )}
              title={recording.fileName}
            >
              {recording.fileName}
            </h4>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {(recording.sampleRate / 1000).toFixed(0)} kHz · {recording.bitDepth}bit ·{" "}
              {recording.fileSize}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 text-slate-500 shrink-0" strokeWidth={2} />
            <span className="text-xs text-slate-400 truncate">
              {recording.locationName}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-500 shrink-0" strokeWidth={2} />
            <span className="text-xs text-slate-500 tabular-nums">
              {recording.recordedAt.slice(0, 10)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 pt-1">
          {recording.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-forest-800/50 text-forest-300 border border-forest-700/40"
            >
              {tag}
            </span>
          ))}
          {recording.tags.length > 3 && (
            <span className="text-[10px] text-slate-500 pt-0.5">
              +{recording.tags.length - 3}
            </span>
          )}
        </div>

        {availabilityTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1.5 border-t border-forest-700/40 mt-1.5">
            {availabilityTypes.map((t) => {
              const info = annotationColorMap[t];
              const active = annotationTypeFilter === t;
              return (
                <button
                  key={t}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFilterAnnotation(t);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border transition-all",
                    active
                      ? `${info.bg} ${info.text} ${info.border} ring-1 ring-offset-1 ring-offset-forest-900 ${info.border}`
                      : "bg-forest-800/30 text-slate-500 border-forest-700/30 hover:text-slate-300 hover:bg-forest-800/50"
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
      </div>
    </div>
  );
}

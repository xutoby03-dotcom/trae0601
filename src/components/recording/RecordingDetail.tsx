import { X, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import { useRecordingStore } from "@/store/recordingStore";
import WaveformPlayer from "@/components/waveform/WaveformPlayer";
import AmbienceMeter from "./AmbienceMeter";
import MetadataCard from "./MetadataCard";
import AnnotationList from "./AnnotationList";
import { weatherInfoMap } from "@/lib/colors";

export default function RecordingDetail() {
  const selectedId = useUIStore((s) => s.selectedRecordingId);
  const open = useUIStore((s) => s.detailPanelOpen);
  const closeDetail = useUIStore((s) => s.closeDetailPanel);
  const selectId = useUIStore((s) => s.selectRecording);
  const all = useRecordingStore((s) => s.recordings);
  const rec = useRecordingStore((s) => s.getRecordingById(selectedId));

  if (!selectedId || !rec) return null;

  const currentIdx = all.findIndex((r) => r.id === selectedId);
  const prev = currentIdx > 0 ? all[currentIdx - 1] : null;
  const next = currentIdx < all.length - 1 ? all[currentIdx + 1] : null;

  const isLocked = rec.isLocked || rec.locked;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-[450] bg-forest-950/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDetail}
      />

      <aside
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[460] w-[560px] max-w-[100vw] shadow-2xl",
          "bg-forest-950/95 backdrop-blur-xl border-l border-forest-700/40",
          "transition-transform duration-300 ease-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <header className="shrink-0 border-b border-forest-700/40 px-5 py-4">
          <div className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {isLocked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-[10px] font-semibold">
                    <Lock className="w-3 h-3" strokeWidth={2.5} />
                    已授权锁定
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-forest-800/60 border border-forest-700/60 text-slate-400 text-[10px] font-mono tabular-nums">
                  {weatherInfoMap[rec.weather]?.emoji} {weatherInfoMap[rec.weather]?.label}
                </span>
              </div>
              <h2 className="font-display text-xl text-cream leading-tight pr-8">
                {rec.title}
              </h2>
              <div className="mt-1 text-[11px] text-slate-500 truncate">
                {rec.fileName}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => prev && selectId(prev.id)}
                disabled={!prev}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  prev
                    ? "bg-forest-800/60 hover:bg-forest-700/70 text-slate-300 hover:text-cream border border-forest-700/50"
                    : "opacity-30 cursor-not-allowed bg-forest-800/30 border border-forest-800/50 text-slate-600"
                )}
                title="上一个"
              >
                <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <button
                onClick={() => next && selectId(next.id)}
                disabled={!next}
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                  next
                    ? "bg-forest-800/60 hover:bg-forest-700/70 text-slate-300 hover:text-cream border border-forest-700/50"
                    : "opacity-30 cursor-not-allowed bg-forest-800/30 border border-forest-800/50 text-slate-600"
                )}
                title="下一个"
              >
                <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <button
                onClick={closeDetail}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rust-500 hover:bg-rust-500/10 border border-transparent hover:border-rust-500/30 transition-all ml-1"
                title="关闭"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <WaveformPlayer recordingId={rec.id} />
          <AmbienceMeter recording={rec} />
          <MetadataCard recording={rec} />
          <AnnotationList recording={rec} />
        </div>
      </aside>
    </>
  );
}

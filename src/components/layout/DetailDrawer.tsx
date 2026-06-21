import { X, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import RecordingDetail from "@/components/recording/RecordingDetail";

export default function DetailDrawer() {
  const detailPanelOpen = useUIStore((s) => s.detailPanelOpen);
  const selectedRecordingId = useUIStore((s) => s.selectedRecordingId);
  const recordings = useUIStore((s) => s.recordings);
  const closeDetailPanel = useUIStore((s) => s.closeDetailPanel);
  const toggleRecordingLock = useUIStore((s) => s.toggleRecordingLock);

  const recording = recordings.find((r) => r.id === selectedRecordingId);

  return (
    <div
      className={cn(
        "absolute right-0 top-[60px] h-[calc(100vh-60px)] w-[480px]",
        "bg-slate-panel/95 backdrop-blur-2xl border-l border-forest-700/50",
        "flex flex-col overflow-hidden z-30",
        "transition-all duration-300 ease-out",
        detailPanelOpen
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0 pointer-events-none"
      )}
    >
      <header
        className={cn(
          "flex items-center gap-3 px-5 py-4 shrink-0",
          "border-b border-forest-700/40 bg-forest-950/30"
        )}
      >
        <button
          onClick={closeDetailPanel}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "text-slate-400 hover:text-slate-200 hover:bg-forest-800/60",
            "transition-all duration-200 active:scale-95"
          )}
          title="关闭详情"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-100 truncate">
              {recording?.fileName ?? "无选中录音"}
            </h3>
            {recording?.isLocked && (
              <Lock
                className="w-3.5 h-3.5 text-amber-400 shrink-0"
                strokeWidth={2}
              />
            )}
          </div>
          <p className="text-xs text-slate-500 truncate mt-0.5">
            {recording?.locationName ?? "—"}
          </p>
        </div>

        <button
          onClick={() => {
            if (recording) {
              toggleRecordingLock(recording.id);
            }
          }}
          disabled={!recording}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
            "transition-all duration-200",
            recording
              ? recording.isLocked
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                : "text-slate-400 hover:text-slate-200 hover:bg-forest-800/60 border border-transparent"
              : "opacity-40 cursor-not-allowed text-slate-500"
          )}
          title={recording?.isLocked ? "解锁" : "锁定"}
        >
          {recording?.isLocked ? (
            <Unlock className="w-3.5 h-3.5" strokeWidth={2} />
          ) : (
            <Lock className="w-3.5 h-3.5" strokeWidth={2} />
          )}
          <span>{recording?.isLocked ? "解锁" : "锁定"}</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto">
        {recording ? (
          <RecordingDetail />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-forest-800/40 border border-forest-700/40 flex items-center justify-center mb-4">
              <span className="text-2xl">🎵</span>
            </div>
            <p className="text-sm">选择一条录音以查看详情</p>
            <p className="text-xs mt-1 text-slate-600">
              点击地图上的标记或素材库中的条目
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

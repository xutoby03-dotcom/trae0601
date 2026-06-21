import {
  CheckCircle2,
  Tag,
  Lock,
  Download,
  X,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";

export default function BatchActionBar() {
  const selectedRecordingIds = useUIStore((s) => s.selectedRecordingIds);
  const recordings = useUIStore((s) => s.recordings);
  const selectAllRecordings = useUIStore((s) => s.selectAllRecordings);
  const clearSelectedRecordings = useUIStore((s) => s.clearSelectedRecordings);

  const allSelected = selectedRecordingIds.length === recordings.length;
  const hasSelection = selectedRecordingIds.length > 0;

  const handleSelectAll = () => {
    if (allSelected) {
      clearSelectedRecordings();
    } else {
      selectAllRecordings();
    }
  };

  return (
    <div
      className={cn(
        "h-[52px] shrink-0 flex items-center px-4",
        "bg-forest-900/60 backdrop-blur-xl border-b border-forest-700/40"
      )}
    >
      <button
        onClick={handleSelectAll}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm",
          "transition-all duration-200",
          allSelected
            ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
            : "text-slate-400 hover:text-slate-200 hover:bg-forest-800/50 border border-transparent"
        )}
      >
        <CheckCircle2
          className={cn("w-4 h-4", allSelected ? "text-amber-400" : "")}
          strokeWidth={2}
        />
        <span>{allSelected ? "取消全选" : "全选"}</span>
      </button>

      <div className="w-px h-6 bg-forest-700/50 mx-3" />

      {hasSelection ? (
        <>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                "bg-amber-500/15 text-amber-400 border border-amber-500/30"
              )}
            >
              已选 {selectedRecordingIds.length} 项
            </span>
          </div>

          <div className="w-px h-6 bg-forest-700/50 mx-3" />

          <div className="flex items-center gap-1.5">
            <ActionBtn
              icon={Tag}
              label="批量标签"
              onClick={() => console.log("Batch tag:", selectedRecordingIds)}
            />
            <ActionBtn
              icon={Lock}
              label="批量锁定"
              onClick={() => console.log("Batch lock:", selectedRecordingIds)}
            />
            <ActionBtn
              icon={Download}
              label="导出清单"
              primary
              onClick={() => console.log("Export list:", selectedRecordingIds)}
            />
          </div>
        </>
      ) : (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
          <span>选择素材后可进行批量操作</span>
        </div>
      )}

      <div className="flex-1" />

      {hasSelection && (
        <button
          onClick={clearSelectedRecordings}
          className={cn(
            "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs",
            "text-slate-400 hover:text-slate-200 hover:bg-forest-800/50",
            "transition-colors duration-200"
          )}
        >
          <X className="w-3.5 h-3.5" strokeWidth={2} />
          清空选择
        </button>
      )}
    </div>
  );
}

function ActionBtn({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
        "transition-all duration-200 active:scale-95",
        primary
          ? "bg-amber-500 hover:bg-amber-400 text-forest-950 shadow-md shadow-amber-500/20"
          : "bg-forest-800/50 text-slate-300 border border-forest-700/50 hover:bg-forest-800 hover:text-slate-200"
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}

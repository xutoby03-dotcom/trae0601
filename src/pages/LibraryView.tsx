import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/uiStore";
import FilterPanel from "@/components/library/FilterPanel";
import BatchActionBar from "@/components/library/BatchActionBar";
import RecordingTable from "@/components/library/RecordingTable";
import RecordingGrid from "@/components/library/RecordingGrid";

export default function LibraryView() {
  const viewMode = useUIStore((s) => s.viewMode);
  const setViewMode = useUIStore((s) => s.setViewMode);

  return (
    <div className="flex h-full">
      <FilterPanel />

      <div className="flex-1 flex flex-col min-w-0">
        <BatchActionBar />

        <div className="flex items-center gap-2 px-5 py-3 border-b border-forest-700/40 bg-forest-900/30 shrink-0">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2">
            视图
          </div>
          <div
            className={cn(
              "flex items-center gap-1 p-1 rounded-xl",
              "bg-forest-800/40 border border-forest-700/40"
            )}
          >
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                "transition-all duration-200",
                viewMode === "grid"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-forest-800/60 border border-transparent"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" strokeWidth={2} />
              卡片
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium",
                "transition-all duration-200",
                viewMode === "list"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-forest-800/60 border border-transparent"
              )}
            >
              <List className="w-3.5 h-3.5" strokeWidth={2} />
              列表
            </button>
          </div>

          <div className="flex-1" />

          <div className="text-xs text-slate-500">
            共 {useUIStore.getState().recordings.length} 条素材
          </div>
        </div>

        {viewMode === "list" ? <RecordingTable /> : <RecordingGrid />}
      </div>
    </div>
  );
}

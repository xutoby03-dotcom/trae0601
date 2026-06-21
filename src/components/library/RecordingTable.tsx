import {
  Play,
  Lock,
  Unlock,
  MapPin,
  Calendar,
  FileAudio,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore, type Recording } from "@/store/uiStore";

export default function RecordingTable() {
  const recordings = useUIStore((s) => s.recordings);
  const selectedRecordingIds = useUIStore((s) => s.selectedRecordingIds);
  const selectedRecordingId = useUIStore((s) => s.selectedRecordingId);
  const toggleRecordingSelected = useUIStore((s) => s.toggleRecordingSelected);
  const openDetailPanel = useUIStore((s) => s.openDetailPanel);
  const toggleRecordingLock = useUIStore((s) => s.toggleRecordingLock);

  const formatDuration = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    if (h > 0)
      return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10 bg-forest-950/90 backdrop-blur border-b border-forest-700/40">
          <tr>
            <th className="w-12 px-4 py-3 text-left">
              <span className="sr-only">选择</span>
            </th>
            <th className="w-12 px-2 py-3 text-left">
              <span className="sr-only">播放</span>
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              文件名
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              地点
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              时长
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              规格
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              大小
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              采集时间
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              标签
            </th>
            <th className="w-16 px-4 py-3 text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              状态
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-forest-800/50">
          {recordings.map((r) => {
            const isSelected = selectedRecordingIds.includes(r.id);
            const isActive = selectedRecordingId === r.id;

            return (
              <Row
                key={r.id}
                recording={r}
                isSelected={isSelected}
                isActive={isActive}
                formatDuration={formatDuration}
                onToggleSelect={() => toggleRecordingSelected(r.id)}
                onOpen={() => openDetailPanel(r.id)}
                onToggleLock={() => toggleRecordingLock(r.id)}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface RowProps {
  recording: Recording;
  isSelected: boolean;
  isActive: boolean;
  formatDuration: (sec: number) => string;
  onToggleSelect: () => void;
  onOpen: () => void;
  onToggleLock: () => void;
}

function Row({
  recording,
  isSelected,
  isActive,
  formatDuration,
  onToggleSelect,
  onOpen,
  onToggleLock,
}: RowProps) {
  return (
    <tr
      onClick={onOpen}
      className={cn(
        "group cursor-pointer transition-colors duration-150",
        isActive
          ? "bg-amber-500/10"
          : isSelected
          ? "bg-forest-800/40"
          : "hover:bg-forest-900/50"
      )}
    >
      <td className="px-4 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className={cn(
            "w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all duration-150",
            isSelected
              ? "bg-amber-500 border-amber-500"
              : "border-forest-600 group-hover:border-forest-500"
          )}
        >
          {isSelected && (
            <CheckCircle2
              className="w-3.5 h-3.5 text-forest-950"
              strokeWidth={3}
            />
          )}
        </button>
      </td>
      <td className="px-2 py-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("Play:", recording.fileName);
          }}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center",
            "bg-forest-800/50 text-slate-400 border border-forest-700/50",
            "opacity-0 group-hover:opacity-100 hover:bg-amber-500 hover:text-forest-950 hover:border-amber-400",
            "transition-all duration-150"
          )}
        >
          <Play className="w-3.5 h-3.5 ml-0.5" strokeWidth={2.5} />
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500/20 to-amber-400/5 border border-amber-500/25 flex items-center justify-center shrink-0">
            <FileAudio className="w-4 h-4 text-amber-400" strokeWidth={1.75} />
          </div>
          <span
            className={cn(
              "font-medium truncate min-w-0",
              isActive ? "text-amber-400" : "text-slate-200"
            )}
          >
            {recording.fileName}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" strokeWidth={2} />
          <span className="text-slate-400 truncate">{recording.locationName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="font-mono text-slate-300 tabular-nums text-xs">
          {formatDuration(recording.duration)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-400 tabular-nums">
          {(recording.sampleRate / 1000).toFixed(0)} kHz / {recording.bitDepth}bit
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-400 tabular-nums">
          {recording.fileSize}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-slate-500" strokeWidth={2} />
          <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
            {recording.recordedAt.slice(0, 10)}
          </span>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 flex-wrap">
          {recording.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex px-1.5 py-0.5 rounded text-[10px] bg-forest-800/60 text-forest-300 border border-forest-700/40"
            >
              {tag}
            </span>
          ))}
          {recording.tags.length > 2 && (
            <span className="text-[10px] text-slate-500">
              +{recording.tags.length - 2}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock();
          }}
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center mx-auto transition-all duration-150",
            recording.isLocked
              ? "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
              : "text-slate-500 hover:text-slate-300 hover:bg-forest-800/50"
          )}
          title={recording.isLocked ? "已锁定" : "未锁定"}
        >
          {recording.isLocked ? (
            <Lock className="w-4 h-4" strokeWidth={2} />
          ) : (
            <Unlock className="w-4 h-4" strokeWidth={2} />
          )}
        </button>
      </td>
    </tr>
  );
}

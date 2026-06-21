import { Play, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Annotation, Recording } from "@/types";
import { annotationColorMap } from "@/lib/colors";
import { formatDuration } from "@/utils/format";
import { usePlayerStore } from "@/store/playerStore";
import { useRecordingStore } from "@/store/recordingStore";

interface Props {
  recording: Recording;
}

function AnnItem({
  ann,
  recordingId,
}: {
  ann: Annotation;
  recordingId: string;
}) {
  const info = annotationColorMap[ann.type];
  const seek = usePlayerStore((s) => s.seek);
  const setSelection = usePlayerStore((s) => s.setSelection);
  const load = usePlayerStore((s) => s.loadRecording);
  const currentId = usePlayerStore((s) => s.currentRecordingId);
  const del = useRecordingStore((s) => s.deleteAnnotation);
  const duration = (useRecordingStore((s) => s.getById(recordingId))?.duration) ?? 0;

  const play = () => {
    if (currentId !== recordingId) load(recordingId, duration);
    setSelection({ start: ann.startTime, end: ann.endTime });
    seek(ann.startTime);
  };

  return (
    <div
      className={cn(
        "group relative flex items-stretch gap-3 p-2.5 rounded-xl cursor-pointer",
        "bg-forest-800/30 border border-transparent",
        "hover:bg-forest-800/60 hover:border-forest-700/60 transition-all"
      )}
      onClick={play}
    >
      <div
        className={cn(
          "w-1 shrink-0 rounded-full",
          info.bg.replace("/20", "").replace("bg-", "bg-")
        )}
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
            {formatDuration(ann.startTime)} — {formatDuration(ann.endTime)}
          </span>
        </div>
        {(ann.note || ann.content) && (
          <div className="text-[11px] text-slate-400 leading-snug line-clamp-2">
            {ann.note ?? ann.content}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            play();
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-moss-400 hover:bg-moss-400/15 border border-transparent hover:border-moss-400/30 transition-all"
          title="播放此段"
        >
          <Play className="w-3.5 h-3.5" strokeWidth={2.5} fill="currentColor" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            del(recordingId, ann.id);
          }}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-rust-500 hover:bg-rust-500/15 border border-transparent hover:border-rust-500/30 transition-all"
          title="删除标注"
        >
          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default function AnnotationList({ recording }: Props) {
  const list = recording.annotations ?? [];

  return (
    <div className="rounded-2xl bg-forest-900/40 border border-forest-700/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>📌</span>
          <h4 className="text-sm font-semibold text-slate-100">标注片段</h4>
          <span className="px-1.5 py-0.5 rounded-full bg-forest-800/60 text-[10px] font-mono text-slate-400 tabular-nums">
            {list.length}
          </span>
        </div>
        {list.length > 0 && (
          <div className="text-[10px] text-slate-500">
            点击条目跳转至对应时间点
          </div>
        )}
      </div>

      <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
        {list.length === 0 && (
          <div className="py-8 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-2xl bg-forest-800/60 flex items-center justify-center text-slate-500">
              🎧
            </div>
            <div className="text-[11px] text-slate-500">
              暂无标注
            </div>
            <div className="text-[10px] text-slate-600 leading-relaxed max-w-[220px]">
              在波形区拖拽创建选区，再点击底部工具栏添加标注类型
            </div>
          </div>
        )}
        {list.map((ann) => (
          <AnnItem key={ann.id} ann={ann} recordingId={recording.id} />
        ))}
      </div>
    </div>
  );
}

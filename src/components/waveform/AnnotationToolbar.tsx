import { cn } from "@/lib/utils";
import { usePlayerStore } from "@/store/playerStore";
import { useUIStore, type AnnotationType } from "@/store/uiStore";
import {
  annotationColorMap,
  annotationTypeList,
} from "@/lib/colors";

export default function AnnotationToolbar() {
  const hasSelection = usePlayerStore((s) => s.selection);
  const selection = usePlayerStore((s) => s.selection);
  const currentRecordingId = usePlayerStore((s) => s.currentRecordingId);
  const addAnnotation = useUIStore((s) => s.addAnnotation);

  const handleClick = (type: AnnotationType) => {
    if (!hasSelection || !selection || !currentRecordingId) return;
    const info = annotationColorMap[type];
    addAnnotation(currentRecordingId, {
      type,
      startTime: selection.start,
      endTime: selection.end,
      label: `${info.emoji} ${info.label}`,
    });
  };

  return (
    <div className="px-4 py-3 border-t border-forest-700/40">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
        标注工具栏（需先创建选区）
      </div>
      <div className="grid grid-cols-5 gap-2">
        {annotationTypeList.map((t) => {
          const info = annotationColorMap[t];
          const disabled = !hasSelection;
          return (
            <button
              key={t}
              onClick={() => handleClick(t)}
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 rounded-xl border transition-all",
                info.bg,
                info.text,
                info.border,
                disabled
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:brightness-110 active:scale-95"
              )}
            >
              <span className="text-lg leading-none">{info.emoji}</span>
              <span className="text-[11px] font-medium">{info.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect } from "react";
import WaveformCanvas from "./WaveformCanvas";
import PlaybackControls from "./PlaybackControls";
import AnnotationToolbar from "./AnnotationToolbar";
import { usePlayerStore } from "@/store/playerStore";
import { useRecordingStore } from "@/store/recordingStore";
import { cn } from "@/lib/utils";

interface Props {
  recordingId: string | null;
}

export default function WaveformPlayer({ recordingId }: Props) {
  const loadRecording = usePlayerStore((s) => s.loadRecording);
  const setRecording = usePlayerStore((s) => s.setRecording);
  const currentRecordingId = usePlayerStore((s) => s.currentRecordingId);
  const rec = useRecordingStore((s) =>
    recordingId ? s.getById(recordingId) : undefined
  );

  useEffect(() => {
    if (!recordingId) {
      setRecording(null);
      return;
    }
    if (recordingId !== currentRecordingId && rec) {
      loadRecording(recordingId, rec.duration);
    }
  }, [recordingId, rec, currentRecordingId, loadRecording, setRecording]);

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden border border-forest-700/40",
        "bg-gradient-to-br from-forest-950 to-forest-900/60"
      )}
    >
      <div className="px-4 py-3 border-b border-forest-700/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cream animate-pulse" />
          <span className="text-sm font-semibold text-cream">{rec?.title ?? "未选择素材"}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 tabular-nums">
          {rec && (
            <>
              <span className="px-1.5 py-0.5 rounded bg-forest-800/60">
                {rec.sampleRate / 1000} kHz
              </span>
              <span className="px-1.5 py-0.5 rounded bg-forest-800/60">
                {rec.bitDepth} bit
              </span>
              <span className="px-1.5 py-0.5 rounded bg-forest-800/60">
                {rec.channels === 2 ? "立体声" : "单声道"}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="p-4">
        <div style={{ height: 224 }}>
          <WaveformCanvas />
        </div>
      </div>

      <PlaybackControls />
      <AnnotationToolbar />
    </div>
  );
}

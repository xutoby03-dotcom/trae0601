import { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { ExportEngine } from '@/engine/ExportEngine';
import { useProjectStore } from '@/store/useProjectStore';
import { useTimelineStore } from '@/store/useTimelineStore';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EXPORT_PRESETS = [
  { name: '720p', width: 1280, height: 720, fps: 30 },
  { name: '1080p', width: 1920, height: 1080, fps: 30 },
  { name: '4K', width: 3840, height: 2160, fps: 30 },
];

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const currentProject = useProjectStore((state) => state.currentProject);
  const { tracks, clips, mediaItems } = useTimelineStore();

  if (!isOpen) return null;

  const handleExport = async () => {
    if (!currentProject) return;
    
    const preset = EXPORT_PRESETS[selectedPreset];
    const engine = new ExportEngine({
      width: preset.width,
      height: preset.height,
      fps: preset.fps,
      quality,
    });

    setIsExporting(true);
    setProgress(0);

    try {
      const duration = Math.max(...clips.map((c) => c.end), 0);
      
      const blob = await engine.export(
        duration,
        tracks,
        clips,
        mediaItems,
        (p) => setProgress(p)
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentProject.name || 'video-export'}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      engine.dispose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-zinc-800 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">导出视频</h2>
          <button
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              分辨率
            </label>
            <div className="grid grid-cols-3 gap-2">
              {EXPORT_PRESETS.map((preset, index) => (
                <button
                  key={preset.name}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    selectedPreset === index
                      ? 'bg-cyan-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                  onClick={() => setSelectedPreset(index)}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-3">
              画质
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map((q) => (
                <button
                  key={q}
                  className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                    quality === q
                      ? 'bg-cyan-600 text-white'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                  onClick={() => setQuality(q)}
                >
                  {q === 'low' ? '低' : q === 'medium' ? '中' : '高'}
                </button>
              ))}
            </div>
          </div>

          {isExporting && (
            <div>
              <div className="flex justify-between text-sm text-zinc-400 mb-2">
                <span>导出中...</span>
                <span>{Math.round(progress * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-200"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  正在导出
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  开始导出
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

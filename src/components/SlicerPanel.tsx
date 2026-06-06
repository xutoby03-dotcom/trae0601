import { Scissors, Download, Clock, Play } from 'lucide-react';
import { useState } from 'react';
import { useAudioStore } from '@/store/audioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/utils/audioAnalyzer';

const SlicerPanel = () => {
  const { audioBuffer, sliceStart, sliceEnd, setSliceRange, duration, currentTime } = useAudioStore();
  const { sliceAudio, playBuffer } = useAudioEngine();
  const [isExporting, setIsExporting] = useState(false);

  const handleStartChange = (value: string) => {
    const time = parseFloat(value) || 0;
    setSliceRange(Math.max(0, Math.min(time, sliceEnd - 0.1)), sliceEnd);
  };

  const handleEndChange = (value: string) => {
    const time = parseFloat(value) || 0;
    setSliceRange(sliceStart, Math.min(duration, Math.max(time, sliceStart + 0.1)));
  };

  const setStartToCurrent = () => {
    setSliceRange(Math.max(0, Math.min(currentTime, sliceEnd - 0.1)), sliceEnd);
  };

  const setEndToCurrent = () => {
    setSliceRange(sliceStart, Math.min(duration, Math.max(currentTime, sliceStart + 0.1)));
  };

  const playSlice = async () => {
    if (!audioBuffer) return;
    playBuffer(audioBuffer, sliceStart);
  };

  const handleExport = async () => {
    if (!audioBuffer) return;
    
    setIsExporting(true);
    try {
      const blob = await sliceAudio(sliceStart, sliceEnd);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audio_slice_${formatTime(sliceStart).replace(':', '-')}_${formatTime(sliceEnd).replace(':', '-')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const sliceDuration = sliceEnd - sliceStart;
  const startPercent = duration > 0 ? (sliceStart / duration) * 100 : 0;
  const endPercent = duration > 0 ? (sliceEnd / duration) * 100 : 100;

  return (
    <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
      <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">
        <Scissors className="w-5 h-5 text-pink-400" />
        音频切片
      </h3>

      {!audioBuffer ? (
        <div className="text-center py-8">
          <Scissors className="w-10 h-10 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">先加载音频文件</p>
        </div>
      ) : (
        <>
          <div className="mb-5">
            <div className="relative h-3 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-pink-500/50 to-purple-500/50 rounded-full"
                style={{ 
                  left: `${startPercent}%`, 
                  width: `${endPercent - startPercent}%` 
                }}
              />
              <div 
                className="absolute top-0 h-full w-1 bg-pink-400 cursor-ew-resize"
                style={{ left: `${startPercent}%` }}
              />
              <div 
                className="absolute top-0 h-full w-1 bg-purple-400 cursor-ew-resize"
                style={{ left: `${endPercent}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                <Clock className="w-3 h-3" />
                起始时间 (秒)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sliceStart.toFixed(2)}
                  onChange={(e) => handleStartChange(e.target.value)}
                  step="0.1"
                  min="0"
                  max={duration}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white 
                           focus:outline-none focus:border-pink-500/50 font-mono"
                />
                <button
                  onClick={setStartToCurrent}
                  className="px-2 py-2 bg-white/5 hover:bg-pink-500/20 rounded-lg text-gray-400 
                           hover:text-pink-400 transition-colors text-xs"
                  title="设为当前时间"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block flex items-center gap-1">
                <Clock className="w-3 h-3" />
                结束时间 (秒)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={sliceEnd.toFixed(2)}
                  onChange={(e) => handleEndChange(e.target.value)}
                  step="0.1"
                  min="0"
                  max={duration}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white 
                           focus:outline-none focus:border-purple-500/50 font-mono"
                />
                <button
                  onClick={setEndToCurrent}
                  className="px-2 py-2 bg-white/5 hover:bg-purple-500/20 rounded-lg text-gray-400 
                           hover:text-purple-400 transition-colors text-xs"
                  title="设为当前时间"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">切片时长</span>
              <span className="text-white font-mono">{formatTime(sliceDuration)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={playSlice}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl 
                       text-gray-300 hover:text-white transition-all duration-300"
            >
              <Play className="w-4 h-4" />
              试听
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || sliceDuration <= 0}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                       bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white
                       hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              {isExporting ? '导出中...' : '导出 WAV'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SlicerPanel;

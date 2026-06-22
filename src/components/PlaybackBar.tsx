import { useEffect, useRef } from 'react';
import { useSandboxStore } from '@/store/useSandboxStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Gauge,
} from 'lucide-react';

export function PlaybackBar() {
  const store = useSandboxStore();
  const { isPlaying, currentStep, speed, versionOrder } = store.playback;
  const versions = store.scene.versions;
  const intervalRef = useRef<number | null>(null);

  const totalSteps = versionOrder.length;

  useEffect(() => {
    if (isPlaying && currentStep < totalSteps - 1) {
      intervalRef.current = window.setInterval(() => {
        store.nextStep();
      }, 2000 / speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (currentStep >= totalSteps - 1 && isPlaying) {
        store.togglePlayback();
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, speed, totalSteps, store]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setPlaybackSpeed(parseFloat(e.target.value));
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const step = Math.floor(percentage * (totalSteps - 1));
    store.gotoStep(Math.max(0, Math.min(totalSteps - 1, step)));
  };

  const currentVersion = versions.find(
    (v) => v.id === versionOrder[currentStep]
  );

  if (!store.isPlaybackMode) {
    return null;
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-900/95 to-transparent pt-8 pb-4 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-slate-300">
            <span className="text-amber-400 font-medium">
              第 {currentStep + 1} 步
            </span>
            <span className="text-slate-500 mx-2">/</span>
            <span className="text-slate-400">共 {totalSteps} 步</span>
            {currentVersion && (
              <span className="ml-3 text-slate-400">
                · {currentVersion.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Gauge size={14} className="text-slate-500" />
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={speed}
              onChange={handleSpeedChange}
              className="w-24 h-1 accent-amber-500"
            />
            <span className="text-xs text-slate-400 w-10">
              {speed}x
            </span>
          </div>
        </div>

        <div
          className="relative h-2 bg-slate-800 rounded-full cursor-pointer mb-4 group"
          onClick={handleProgressClick}
        >
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
            style={{
              width: `${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0}%`,
            }}
          />

          <div className="absolute inset-0 flex items-center justify-between px-1">
            {versionOrder.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors
                  ${index <= currentStep
                    ? 'bg-amber-300'
                    : 'bg-slate-600 group-hover:bg-slate-500'
                  }
                `}
              />
            ))}
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-500/50 transition-all"
            style={{
              left: `calc(${totalSteps > 1 ? (currentStep / (totalSteps - 1)) * 100 : 0}% - 8px)`,
            }}
          />
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => store.gotoStep(0)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="回到开始"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={store.prevStep}
            disabled={currentStep === 0}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="上一步"
          >
            <ChevronLeft size={22} />
          </button>

          <button
            onClick={store.togglePlayback}
            className="p-4 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded-full transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-400/40 hover:scale-105"
            title={isPlaying ? '暂停' : '播放'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </button>

          <button
            onClick={store.nextStep}
            disabled={currentStep >= totalSteps - 1}
            className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="下一步"
          >
            <ChevronRight size={22} />
          </button>

          <button
            onClick={() => store.gotoStep(totalSteps - 1)}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
            title="跳到最后"
          >
            <SkipForward size={18} />
          </button>
        </div>

        {currentVersion?.description && (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-400">
              {currentVersion.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

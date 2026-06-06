import { Play, Pause, Plus, Minus } from 'lucide-react';
import { useMetronome } from '@/hooks/useMetronome';
import { useAppStore } from '@/store/useAppStore';
import type { TimeSignature } from '@/types';
import { cn } from '@/lib/utils';

const timeSignatures: TimeSignature[] = ['2/4', '3/4', '4/4', '6/8'];

export const Metronome = () => {
  const { bpm, timeSignature, isPlaying, currentBeat, toggle, start, stop } = useMetronome();
  const { setBpm, setTimeSignature } = useAppStore();

  const beatsPerMeasure = parseInt(timeSignature.split('/')[0], 10);

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value, 10);
    setBpm(newBpm);
  };

  const adjustBpm = (delta: number) => {
    const newBpm = Math.max(30, Math.min(300, bpm + delta));
    setBpm(newBpm);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">节拍器</h1>
      <p className="text-slate-400 mb-8">精准节奏，稳定练习</p>

      <div className="w-full max-w-md space-y-8">
        <div className="relative flex items-center justify-center">
          <div className="relative w-56 h-56">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-xl" />
            <div className="absolute inset-2 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 flex flex-col items-center justify-center">
              <span className="text-7xl font-bold text-white tabular-nums tracking-tight">
                {bpm}
              </span>
              <span className="text-slate-400 text-sm mt-1">BPM</span>
            </div>
            {isPlaying && (
              <div
                className={cn(
                  'absolute inset-0 rounded-full border-4 transition-colors duration-75',
                  currentBeat === 0
                    ? 'border-violet-400 scale-105'
                    : 'border-slate-600/50 scale-100'
                )}
                style={{
                  boxShadow: currentBeat === 0
                    ? '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.3)'
                    : 'none',
                }}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => adjustBpm(-1)}
              className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <Minus className="w-5 h-5" />
            </button>
            <div className="flex-1 px-2">
              <input
                type="range"
                min="30"
                max="300"
                value={bpm}
                onChange={handleBpmChange}
                className="w-full h-2 bg-slate-700 rounded-full appearance-none cursor-pointer accent-violet-500"
              />
            </div>
            <button
              onClick={() => adjustBpm(1)}
              className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-between text-xs text-slate-500 px-2">
            <span>30</span>
            <span>300</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {timeSignatures.map((sig) => (
            <button
              key={sig}
              onClick={() => {
                if (isPlaying) stop();
                setTimeSignature(sig);
              }}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                timeSignature === sig
                  ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
              )}
            >
              {sig}
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-2 py-4">
          {Array.from({ length: beatsPerMeasure }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-4 h-4 rounded-full transition-all duration-75',
                isPlaying && currentBeat === i
                  ? i === 0
                    ? 'bg-violet-400 scale-150 shadow-lg shadow-violet-500/50'
                    : 'bg-slate-300 scale-125'
                  : 'bg-slate-700'
              )}
            />
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={toggle}
            className={cn(
              'w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95',
              isPlaying
                ? 'bg-red-500 hover:bg-red-400 shadow-lg shadow-red-500/30'
                : 'bg-gradient-to-br from-violet-500 to-indigo-600 hover:from-violet-400 hover:to-indigo-500 shadow-lg shadow-violet-500/30'
            )}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" fill="white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

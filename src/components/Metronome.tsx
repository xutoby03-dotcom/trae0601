import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Hand } from 'lucide-react';
import { audioEngine } from '../utils/audio';

interface MetronomeProps {
  bpm: number;
  beatsPerMeasure?: number;
  isPlaying: boolean;
  onBeat?: (beat: number) => void;
  onTogglePlay: () => void;
  onBpmChange: (bpm: number) => void;
}

export const Metronome: React.FC<MetronomeProps> = ({
  bpm,
  beatsPerMeasure = 4,
  isPlaying,
  onBeat,
  onTogglePlay,
  onBpmChange,
}) => {
  const intervalRef = useRef<number | null>(null);
  const beatRef = useRef(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);
  const tapTimeoutRef = useRef<number | null>(null);

  const tick = useCallback(() => {
    audioEngine.init();
    audioEngine.resume();
    
    const currentBeat = beatRef.current % beatsPerMeasure;
    const isAccent = currentBeat === 0;
    
    audioEngine.playMetronomeClick(isAccent);
    onBeat?.(currentBeat);
    
    beatRef.current++;
  }, [beatsPerMeasure, onBeat]);

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / bpm) * 1000;
      tick();
      intervalRef.current = window.setInterval(tick, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      beatRef.current = 0;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm, tick]);

  const handleReset = () => {
    beatRef.current = 0;
    onBeat?.(0);
  };

  const handleTapTempo = () => {
    const now = Date.now();

    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    const newTapTimes = [...tapTimes, now].filter(t => now - t < 3000);
    setTapTimes(newTapTimes);

    if (newTapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < newTapTimes.length; i++) {
        intervals.push(newTapTimes[i] - newTapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      const clampedBpm = Math.max(40, Math.min(200, calculatedBpm));
      
      if (newTapTimes.length >= 4) {
        onBpmChange(clampedBpm);
      }
    }

    tapTimeoutRef.current = window.setTimeout(() => {
      setTapTimes([]);
    }, 3000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h3 className="text-xl font-bold text-amber-900 mb-4">节拍器</h3>
      
      <div className="flex items-center justify-center gap-4 mb-6">
        {Array.from({ length: beatsPerMeasure }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-100 ${
              isPlaying && beatRef.current % beatsPerMeasure === i
                ? i === 0
                  ? 'bg-red-500 scale-125 shadow-lg shadow-red-300'
                  : 'bg-amber-500 scale-125 shadow-lg shadow-amber-300'
                : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">BPM</span>
          <span className="text-2xl font-bold text-amber-900">{bpm}</span>
        </div>
        <input
          type="range"
          min="40"
          max="200"
          value={bpm}
          onChange={(e) => onBpmChange(Number(e.target.value))}
          className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>40</span>
          <span>200</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onTogglePlay}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-5 h-5" />
              暂停
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              播放
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="py-3 px-4 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[60, 80, 100, 120].map(tempo => (
          <button
            key={tempo}
            onClick={() => onBpmChange(tempo)}
            className={`py-2 text-sm rounded-lg transition-all ${
              bpm === tempo
                ? 'bg-amber-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tempo}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={handleTapTempo}
          className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
            tapTimes.length > 0
              ? 'bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-200'
              : 'bg-purple-100 hover:bg-purple-200 text-purple-700'
          }`}
        >
          <Hand className={`w-5 h-5 ${tapTimes.length > 0 ? 'animate-bounce' : ''}`} />
          <span>
            Tap Tempo
            {tapTimes.length > 0 && ` (${tapTimes.length}/4)`}
          </span>
        </button>
        {tapTimes.length > 0 && tapTimes.length < 4 && (
          <p className="text-xs text-center text-gray-500 mt-2">
            再敲 {4 - tapTimes.length} 下计算 BPM
          </p>
        )}
        {tapTimes.length >= 4 && (
          <p className="text-xs text-center text-green-600 mt-2">
            ✓ BPM 已设置
          </p>
        )}
      </div>
    </div>
  );
};

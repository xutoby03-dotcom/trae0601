import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { RHYTHM_PATTERNS } from '@/data/rhythms';
import type { RhythmPattern, RhythmHit, RhythmResult } from '@/types';
import { playClick, resumeAudioContext } from '@/utils/audio';
import { saveRhythmResult, updateDailyStats } from '@/utils/storage';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

type TrainingPhase = 'idle' | 'demo' | 'waiting' | 'recording' | 'result';

const TOLERANCE_MS = 80;

export const RhythmTraining = () => {
  const [selectedPattern, setSelectedPattern] = useState<RhythmPattern>(RHYTHM_PATTERNS[0]);
  const [phase, setPhase] = useState<TrainingPhase>('idle');
  const [currentBeatIndex, setCurrentBeatIndex] = useState(-1);
  const [hits, setHits] = useState<RhythmHit[]>([]);
  const [accuracy, setAccuracy] = useState(0);
  const [feedback, setFeedback] = useState<'early' | 'late' | 'perfect' | null>(null);

  const startTimeRef = useRef<number>(0);
  const expectedTimesRef = useRef<number[]>([]);
  const nextExpectedIndexRef = useRef<number>(0);
  const hitTimesRef = useRef<number[]>([]);
  const demoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { addRhythmResult } = useAppStore();

  const calculateExpectedTimes = useCallback((pattern: RhythmPattern): number[] => {
    const secondsPerBeat = 60.0 / pattern.bpm;
    return pattern.beats.map((beat) => beat.time * secondsPerBeat * 1000);
  }, []);

  const clearAllTimeouts = useCallback(() => {
    if (demoTimeoutRef.current) {
      clearTimeout(demoTimeoutRef.current);
      demoTimeoutRef.current = null;
    }
    if (recordingTimeoutRef.current) {
      clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
  }, []);

  const playDemo = useCallback(async () => {
    await resumeAudioContext();
    setPhase('demo');
    setCurrentBeatIndex(-1);

    const expectedTimes = calculateExpectedTimes(selectedPattern);
    expectedTimesRef.current = expectedTimes;

    const totalDuration = expectedTimes[expectedTimes.length - 1] + 1000;

    selectedPattern.beats.forEach((beat, index) => {
      setTimeout(() => {
        setCurrentBeatIndex(index);
        playClick(beat.isAccented ? 1200 : 800, 0.05, beat.isAccented ? 0.6 : 0.4);
      }, expectedTimes[index] + 500);
    });

    demoTimeoutRef.current = setTimeout(() => {
      setCurrentBeatIndex(-1);
      setPhase('waiting');
    }, totalDuration + 800);
  }, [selectedPattern, calculateExpectedTimes]);

  const startRecording = useCallback(async () => {
    await resumeAudioContext();
    setPhase('recording');
    setHits([]);
    setFeedback(null);
    hitTimesRef.current = [];
    nextExpectedIndexRef.current = 0;
    startTimeRef.current = performance.now();

    const expectedTimes = expectedTimesRef.current;
    const totalDuration = expectedTimes[expectedTimes.length - 1] + 1500;

    recordingTimeoutRef.current = setTimeout(() => {
      finishRecording();
    }, totalDuration);
  }, []);

  const finishRecording = useCallback(() => {
    setPhase('result');

    const expectedTimes = expectedTimesRef.current;
    const hitTimes = hitTimesRef.current;
    const results: RhythmHit[] = [];

    expectedTimes.forEach((expectedTime, index) => {
      let closestHit: { time: number; deviation: number } | null = null;

      for (const hitTime of hitTimes) {
        const deviation = hitTime - expectedTime;
        if (Math.abs(deviation) <= TOLERANCE_MS * 2) {
          if (!closestHit || Math.abs(deviation) < Math.abs(closestHit.deviation)) {
            closestHit = { time: hitTime, deviation };
          }
        }
      }

      if (closestHit) {
        results.push({
          expectedTime,
          actualTime: closestHit.time,
          deviation: closestHit.deviation,
          isCorrect: Math.abs(closestHit.deviation) <= TOLERANCE_MS,
        });
      } else {
        results.push({
          expectedTime,
          actualTime: -1,
          deviation: Infinity,
          isCorrect: false,
        });
      }
    });

    setHits(results);

    const correctCount = results.filter((r) => r.isCorrect).length;
    const acc = results.length > 0 ? Math.round((correctCount / results.length) * 100) : 0;
    setAccuracy(acc);

    const result: RhythmResult = {
      patternId: selectedPattern.id,
      hits: results,
      accuracy: acc,
      timestamp: Date.now(),
    };

    saveRhythmResult(result);
    addRhythmResult(result);
    updateDailyStats('rhythm', acc >= 60, 10);
  }, [selectedPattern.id, addRhythmResult]);

  const handleTap = useCallback(() => {
    if (phase !== 'recording') return;

    const tapTime = performance.now() - startTimeRef.current;
    hitTimesRef.current.push(tapTime);

    const expectedTimes = expectedTimesRef.current;
    const currentIndex = nextExpectedIndexRef.current;

    if (currentIndex < expectedTimes.length) {
      const expectedTime = expectedTimes[currentIndex];
      const deviation = tapTime - expectedTime;

      if (Math.abs(deviation) <= TOLERANCE_MS * 2) {
        nextExpectedIndexRef.current = currentIndex + 1;

        if (Math.abs(deviation) <= TOLERANCE_MS / 2) {
          setFeedback('perfect');
        } else if (deviation < 0) {
          setFeedback('early');
        } else {
          setFeedback('late');
        }

        playClick(1000, 0.03, 0.3);

        setTimeout(() => setFeedback(null), 200);
      }
    }
  }, [phase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'waiting') {
          startRecording();
        } else if (phase === 'recording') {
          handleTap();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, startRecording, handleTap]);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const reset = () => {
    clearAllTimeouts();
    setPhase('idle');
    setCurrentBeatIndex(-1);
    setHits([]);
    setAccuracy(0);
    setFeedback(null);
  };

  const renderRhythmVisual = () => {
    const maxTime = Math.max(...selectedPattern.beats.map((b) => b.time)) + 1;

    return (
      <div className="relative h-24 w-full bg-slate-800/50 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center px-4">
          {selectedPattern.beats.map((beat, index) => {
            const position = (beat.time / maxTime) * 100;
            const sizeClass =
              beat.duration === 'whole'
                ? 'w-8 h-8'
                : beat.duration === 'half'
                ? 'w-6 h-6'
                : beat.duration === 'quarter'
                ? 'w-5 h-5'
                : beat.duration === 'eighth'
                ? 'w-4 h-4'
                : 'w-3 h-3';

            return (
              <div
                key={index}
                className={cn(
                  'absolute rounded-full transition-all duration-100',
                  sizeClass,
                  currentBeatIndex === index && phase === 'demo'
                    ? beat.isAccented
                      ? 'bg-violet-400 scale-150 shadow-lg shadow-violet-500/50'
                      : 'bg-slate-200 scale-125'
                    : beat.isAccented
                    ? 'bg-violet-600/60'
                    : 'bg-slate-600'
                )}
                style={{ left: `calc(${position}% - 10px)` }}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const getPhaseMessage = () => {
    switch (phase) {
      case 'idle':
        return '选择节奏型，点击开始';
      case 'demo':
        return '请听示范...';
      case 'waiting':
        return '按空格键开始跟打';
      case 'recording':
        return '跟着打！按空格键';
      case 'result':
        return '练习完成！';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-120px)] px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">节奏训练</h1>
      <p className="text-slate-400 mb-6">{getPhaseMessage()}</p>

      <div className="w-full max-w-2xl space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {RHYTHM_PATTERNS.slice(0, 8).map((pattern) => (
            <button
              key={pattern.id}
              onClick={() => {
                if (phase !== 'recording') {
                  reset();
                  setSelectedPattern(pattern);
                }
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all text-left',
                selectedPattern.id === pattern.id
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                  : 'bg-slate-800/50 text-slate-400 border border-transparent hover:bg-slate-700/50'
              )}
              disabled={phase === 'recording'}
            >
              {pattern.name}
            </button>
          ))}
        </div>

        <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-300 font-medium">{selectedPattern.name}</span>
            <span className="text-violet-400 font-mono text-sm">{selectedPattern.bpm} BPM</span>
          </div>

          {renderRhythmVisual()}

          {feedback && (
            <div className="mt-4 flex justify-center">
              <div
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium animate-pulse',
                  feedback === 'perfect' && 'bg-emerald-500/20 text-emerald-400',
                  feedback === 'early' && 'bg-amber-500/20 text-amber-400',
                  feedback === 'late' && 'bg-orange-500/20 text-orange-400'
                )}
              >
                {feedback === 'perfect' && '完美！'}
                {feedback === 'early' && '偏早'}
                {feedback === 'late' && '偏晚'}
              </div>
            </div>
          )}
        </div>

        {phase === 'result' && (
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700/50">
            <div className="text-center mb-6">
              <div
                className={cn(
                  'text-6xl font-bold mb-2',
                  accuracy >= 80
                    ? 'text-emerald-400'
                    : accuracy >= 60
                    ? 'text-amber-400'
                    : 'text-red-400'
                )}
              >
                {accuracy}%
              </div>
              <p className="text-slate-400">准确率</p>
            </div>

            <div className="space-y-2">
              {hits.map((hit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/50"
                >
                  <span className="text-slate-300 text-sm">第 {index + 1} 拍</span>
                  {hit.isCorrect ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">
                        {hit.deviation !== Infinity
                          ? `${hit.deviation > 0 ? '+' : ''}${Math.round(hit.deviation)}ms`
                          : ''}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">未命中</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4">
          {phase === 'idle' && (
            <button
              onClick={playDemo}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-400 hover:to-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/25"
            >
              <Play className="w-5 h-5" fill="white" />
              开始练习
            </button>
          )}

          {phase === 'waiting' && (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/25"
            >
              <Clock className="w-5 h-5" />
              开始跟打
            </button>
          )}

          {phase === 'recording' && (
            <div className="px-8 py-4 bg-slate-800 text-slate-300 rounded-xl font-medium animate-pulse">
              按空格键打拍...
            </div>
          )}

          {(phase === 'demo' || phase === 'result') && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-8 py-4 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-all hover:scale-105 active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              重新开始
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

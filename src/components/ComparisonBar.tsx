import { memo, useCallback, useRef, useEffect, useState } from 'react';
import { ArrowLeftRight, X, Play, Pause } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatTime } from '../utils/audio';
import { VUMeter } from './VUMeter';
import type { AudioTake } from '../types';

export const ComparisonBar = memo(function ComparisonBar() {
  const comparison = useStore((s) => s.comparison);
  const setComparisonSlot = useStore((s) => s.setComparisonSlot);
  const toggleComparisonActive = useStore((s) => s.toggleComparisonActive);
  const takes = useStore((s) => s.takes);

  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimeoutRef = useRef<number | null>(null);
  const vuIntervalRef = useRef<number | null>(null);
  const lastLoadedA = useRef<string | null>(null);
  const lastLoadedB = useRef<string | null>(null);
  const syncRef = useRef<number>(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeA, setCurrentTimeA] = useState(0);
  const [currentTimeB, setCurrentTimeB] = useState(0);
  const [vuLevelA, setVuLevelA] = useState(0);
  const [vuLevelB, setVuLevelB] = useState(0);
  const [durationA, setDurationA] = useState(0);
  const [durationB, setDurationB] = useState(0);
  const [isLoadingA, setIsLoadingA] = useState(false);
  const [isLoadingB, setIsLoadingB] = useState(false);

  const activeSlot = comparison.active;
  const activeAudio = activeSlot === 'a' ? audioARef.current : audioBRef.current;
  const activeVu = activeSlot === 'a' ? vuLevelA : vuLevelB;
  const activeTime = activeSlot === 'a' ? currentTimeA : currentTimeB;

  const updateVuLevels = useCallback(() => {
    if (audioARef.current && !audioARef.current.paused) {
      const base = 0.3 + Math.random() * 0.4;
      const varation = Math.sin(Date.now() / 100) * 0.2;
      setVuLevelA(Math.max(0.1, Math.min(1, base + varation)));
    } else {
      setVuLevelA((prev) => Math.max(0, prev - 0.05));
    }
    if (audioBRef.current && !audioBRef.current.paused) {
      const base = 0.3 + Math.random() * 0.4;
      const varation = Math.sin(Date.now() / 120) * 0.2;
      setVuLevelB(Math.max(0.1, Math.min(1, base + varation)));
    } else {
      setVuLevelB((prev) => Math.max(0, prev - 0.05));
    }
  }, []);

  useEffect(() => {
    vuIntervalRef.current = window.setInterval(updateVuLevels, 80);
    return () => {
      if (vuIntervalRef.current) {
        window.clearInterval(vuIntervalRef.current);
      }
    };
  }, [updateVuLevels]);

  useEffect(() => {
    if (!comparison.a) return;
    if (lastLoadedA.current === comparison.a.id) return;

    const audio = new Audio(comparison.a.audioUrl);
    audio.crossOrigin = 'anonymous';
    audio.volume = activeSlot === 'a' && isPlaying ? 0.8 : 0;
    audioARef.current = audio;
    lastLoadedA.current = comparison.a.id;

    const onLoaded = () => {
      setDurationA(audio.duration);
      setIsLoadingA(false);
      if (syncRef.current > 0) {
        audio.currentTime = syncRef.current;
      }
    };
    const onTimeUpdate = () => setCurrentTimeA(audio.currentTime);
    const onWaiting = () => setIsLoadingA(true);
    const onCanPlay = () => setIsLoadingA(false);
    const onEnded = () => {
      setIsPlaying(false);
      if (activeSlot === 'a') {
        toggleComparisonActive();
      }
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);

    setIsLoadingA(true);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [comparison.a, activeSlot, isPlaying, toggleComparisonActive]);

  useEffect(() => {
    if (!comparison.b) return;
    if (lastLoadedB.current === comparison.b.id) return;

    const audio = new Audio(comparison.b.audioUrl);
    audio.crossOrigin = 'anonymous';
    audio.volume = activeSlot === 'b' && isPlaying ? 0.8 : 0;
    audioBRef.current = audio;
    lastLoadedB.current = comparison.b.id;

    const onLoaded = () => {
      setDurationB(audio.duration);
      setIsLoadingB(false);
      if (syncRef.current > 0) {
        audio.currentTime = syncRef.current;
      }
    };
    const onTimeUpdate = () => setCurrentTimeB(audio.currentTime);
    const onWaiting = () => setIsLoadingB(true);
    const onCanPlay = () => setIsLoadingB(false);
    const onEnded = () => {
      setIsPlaying(false);
      if (activeSlot === 'b') {
        toggleComparisonActive();
      }
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('ended', onEnded);

    setIsLoadingB(true);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, [comparison.b, activeSlot, isPlaying, toggleComparisonActive]);

  const switchSlot = useCallback(() => {
    if (!comparison.a || !comparison.b) return;

    const fromAudio = activeSlot === 'a' ? audioARef.current : audioBRef.current;
    const toAudio = activeSlot === 'a' ? audioBRef.current : audioARef.current;

    if (!fromAudio || !toAudio) return;

    const currentTime = fromAudio.currentTime;
    syncRef.current = currentTime;

    if (fadeTimeoutRef.current) {
      window.clearTimeout(fadeTimeoutRef.current);
    }

    toAudio.currentTime = currentTime;

    if (isPlaying) {
      toAudio.play().catch(() => {});
      toAudio.volume = 0;

      const steps = 8;
      const stepMs = 15;
      let step = 0;

      const fade = () => {
        step++;
        const progress = step / steps;
        if (fromAudio) fromAudio.volume = 0.8 * (1 - progress);
        if (toAudio) toAudio.volume = 0.8 * progress;

        if (step < steps) {
          fadeTimeoutRef.current = window.setTimeout(fade, stepMs);
        } else {
          if (fromAudio) {
            fromAudio.pause();
            fromAudio.volume = 0;
          }
          if (toAudio) toAudio.volume = 0.8;
        }
      };

      fade();
    }

    toggleComparisonActive();
  }, [comparison.a, comparison.b, activeSlot, isPlaying, toggleComparisonActive]);

  const togglePlay = useCallback(() => {
    if (!comparison.a && !comparison.b) return;

    const audio = activeAudio;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = 0.8;
      audio.play().catch(() => {});
      setIsPlaying(true);
      syncRef.current = audio.currentTime;
    }
  }, [comparison.a, comparison.b, activeAudio, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space' && comparison.a && comparison.b) {
        e.preventDefault();
        switchSlot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [comparison.a, comparison.b, switchSlot]);

  useEffect(() => {
    return () => {
      if (fadeTimeoutRef.current) {
        window.clearTimeout(fadeTimeoutRef.current);
      }
    };
  }, []);

  const handleDrop = useCallback(
    (slot: 'a' | 'b') => (e: React.DragEvent) => {
      e.preventDefault();
      const takeId = e.dataTransfer.getData('text/plain');
      const take = takes.find((t) => t.id === takeId) as AudioTake | undefined;
      if (take) {
        syncRef.current = 0;
        setCurrentTimeA(0);
        setCurrentTimeB(0);
        setIsPlaying(false);
        setComparisonSlot(slot, take);
        if (slot === 'a') lastLoadedA.current = null;
        else lastLoadedB.current = null;
      }
    },
    [takes, setComparisonSlot]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleRemoveSlot = useCallback(
    (slot: 'a' | 'b') => (e: React.MouseEvent) => {
      e.stopPropagation();
      setComparisonSlot(slot, null);
      if (slot === 'a') {
        lastLoadedA.current = null;
        if (audioARef.current) {
          audioARef.current.pause();
          audioARef.current = null;
        }
      } else {
        lastLoadedB.current = null;
        if (audioBRef.current) {
          audioBRef.current.pause();
          audioBRef.current = null;
        }
      }
      if (activeSlot === slot) {
        setIsPlaying(false);
      }
    },
    [setComparisonSlot, activeSlot]
  );

  const hasBoth = comparison.a && comparison.b;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-studio-panel/95 backdrop-blur-md border-t border-studio-border shadow-2xl">
      <div className="container px-4 py-3">
        <div className="flex items-center gap-4">
          <div
            onDrop={handleDrop('a')}
            onDragOver={handleDragOver}
            className={`flex-1 min-w-0 p-3 rounded-lg border-2 border-dashed transition-all ${
              comparison.a
                ? activeSlot === 'a'
                  ? 'border-accent-amber bg-studio-card shadow-studio-glow'
                  : 'border-accent-amber/30 bg-studio-card/50'
                : 'border-studio-border bg-studio-card/50 hover:border-accent-amber/30'
            }`}
          >
            {comparison.a ? (
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activeSlot === 'a' ? 'bg-accent-amber/30' : 'bg-accent-amber/10'
                  }`}
                >
                  <span
                    className={`font-display font-bold text-lg ${
                      activeSlot === 'a' ? 'text-accent-amber' : 'text-accent-amber/50'
                    }`}
                  >
                    A
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-studio-text truncate">{comparison.a.name}</h4>
                  <p className="text-xs text-studio-textDim truncate font-mono">
                    {comparison.a.microphone.split(' ')[0]} + {comparison.a.preamp.split(' ')[0]}
                  </p>
                </div>
                {activeSlot === 'a' && isPlaying && (
                  <VUMeter level={vuLevelA} size="sm" />
                )}
                <div className="text-xs font-mono text-studio-textDim">
                  {formatTime(currentTimeA)}
                </div>
                <button
                  onClick={handleRemoveSlot('a')}
                  className="p-1 hover:bg-studio-hover rounded transition-colors"
                >
                  <X className="w-4 h-4 text-studio-textDim" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-studio-textDim">
                <p className="text-sm">拖拽 Take 到 A 槽</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={switchSlot}
              disabled={!hasBoth}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                hasBoth
                  ? 'bg-gradient-to-br from-accent-amber to-accent-purple text-white hover:scale-105 hover:shadow-lg hover:shadow-accent-amber/30 active:scale-95'
                  : 'bg-studio-card border border-studio-border text-studio-textDim cursor-not-allowed'
              }`}
              title={hasBoth ? '空格键快速切换' : '需要两个 Take 才能对比'}
            >
              <ArrowLeftRight className={`w-7 h-7 ${hasBoth ? 'animate-pulse' : ''}`} />
            </button>
            {hasBoth && (
              <div className="flex items-center gap-1">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeSlot === 'a'
                      ? 'bg-accent-amber text-studio-bg'
                      : 'bg-studio-card text-studio-textDim'
                  }`}
                >
                  A
                </span>
                <span className="text-xs text-studio-textDim">空格切换</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    activeSlot === 'b'
                      ? 'bg-accent-purple text-white'
                      : 'bg-studio-card text-studio-textDim'
                  }`}
                >
                  B
                </span>
              </div>
            )}
            {hasBoth && (
              <div className="flex items-center gap-2">
                <button
                  onClick={togglePlay}
                  disabled={isLoadingA || isLoadingB}
                  className="p-2 rounded-full bg-studio-card border border-studio-border hover:bg-studio-hover hover:border-accent-amber/50 transition-colors"
                  title={isPlaying ? '暂停' : '播放'}
                >
                  {isLoadingA || isLoadingB ? (
                    <div className="w-4 h-4 border-2 border-studio-textDim border-t-transparent rounded-full animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div
            onDrop={handleDrop('b')}
            onDragOver={handleDragOver}
            className={`flex-1 min-w-0 p-3 rounded-lg border-2 border-dashed transition-all ${
              comparison.b
                ? activeSlot === 'b'
                  ? 'border-accent-purple bg-studio-card shadow-studio-glow'
                  : 'border-accent-purple/30 bg-studio-card/50'
                : 'border-studio-border bg-studio-card/50 hover:border-accent-purple/30'
            }`}
          >
            {comparison.b ? (
              <div className="flex items-center gap-3 flex-row-reverse">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activeSlot === 'b' ? 'bg-accent-purple/30' : 'bg-accent-purple/10'
                  }`}
                >
                  <span
                    className={`font-display font-bold text-lg ${
                      activeSlot === 'b' ? 'text-accent-purple' : 'text-accent-purple/50'
                    }`}
                  >
                    B
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <h4 className="font-medium text-sm text-studio-text truncate">{comparison.b.name}</h4>
                  <p className="text-xs text-studio-textDim truncate font-mono">
                    {comparison.b.microphone.split(' ')[0]} + {comparison.b.preamp.split(' ')[0]}
                  </p>
                </div>
                {activeSlot === 'b' && isPlaying && (
                  <VUMeter level={vuLevelB} size="sm" />
                )}
                <div className="text-xs font-mono text-studio-textDim">
                  {formatTime(currentTimeB)}
                </div>
                <button
                  onClick={handleRemoveSlot('b')}
                  className="p-1 hover:bg-studio-hover rounded transition-colors"
                >
                  <X className="w-4 h-4 text-studio-textDim" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-studio-textDim">
                <p className="text-sm">拖拽 Take 到 B 槽</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

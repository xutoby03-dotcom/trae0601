import { useEffect, useRef, useCallback } from 'react';
import { playClick, resumeAudioContext } from '@/utils/audio';
import { useAppStore } from '@/store/useAppStore';
import type { TimeSignature } from '@/types';

const getBeatsPerMeasure = (signature: TimeSignature): number => {
  return parseInt(signature.split('/')[0], 10);
};

export const useMetronome = () => {
  const { metronomeSettings, setCurrentBeat, toggleMetronome } = useAppStore();
  const { bpm, timeSignature, isPlaying, currentBeat, volume } = metronomeSettings;

  const intervalRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef<number>(0);
  const beatRef = useRef<number>(0);

  const scheduleClick = useCallback((time: number, beatNumber: number) => {
    const isAccent = beatNumber === 0;
    const freq = isAccent ? 1200 : 800;
    const vol = isAccent ? volume * 1.2 : volume;
    playClick(freq, 0.05, Math.min(vol, 1), time - performance.now() / 1000);
  }, [volume]);

  const scheduler = useCallback(() => {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const secondsPerBeat = 60.0 / bpm;
    const beatsPerMeasure = getBeatsPerMeasure(timeSignature);
    const lookahead = 0.1;
    const scheduleAheadTime = 0.1;

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleClick(nextNoteTimeRef.current * 1000, beatRef.current);
      setCurrentBeat(beatRef.current);

      nextNoteTimeRef.current += secondsPerBeat;
      beatRef.current = (beatRef.current + 1) % beatsPerMeasure;
    }

    if (isPlaying) {
      intervalRef.current = window.setTimeout(scheduler, lookahead * 1000);
    }
  }, [bpm, timeSignature, isPlaying, scheduleClick, setCurrentBeat]);

  const start = useCallback(async () => {
    await resumeAudioContext();
    beatRef.current = 0;
    nextNoteTimeRef.current = performance.now() / 1000 + 0.05;
    if (!metronomeSettings.isPlaying) {
      toggleMetronome();
    }
  }, [metronomeSettings.isPlaying, toggleMetronome]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (metronomeSettings.isPlaying) {
      toggleMetronome();
    }
    setCurrentBeat(0);
  }, [metronomeSettings.isPlaying, toggleMetronome, setCurrentBeat]);

  useEffect(() => {
    if (isPlaying) {
      scheduler();
    } else {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [isPlaying, scheduler]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, []);

  return {
    bpm,
    timeSignature,
    isPlaying,
    currentBeat,
    volume,
    start,
    stop,
    toggle: () => {
      if (isPlaying) {
        stop();
      } else {
        start();
      }
    },
  };
};

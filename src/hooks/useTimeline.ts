import { useEffect, useRef, useCallback } from 'react';
import { useWindStore } from '../store/useWindStore';

export const useTimeline = () => {
  const {
    currentHour,
    isPlaying,
    playbackSpeed,
    setCurrentHour,
    setIsPlaying,
  } = useWindStore();

  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const play = useCallback(() => setIsPlaying(true), [setIsPlaying]);
  const pause = useCallback(() => setIsPlaying(false), [setIsPlaying]);
  const togglePlay = useCallback(() => setIsPlaying(!isPlaying), [isPlaying, setIsPlaying]);

  const goToHour = useCallback((hour: number) => {
    setCurrentHour(Math.floor(hour));
  }, [setCurrentHour]);

  const nextHour = useCallback(() => {
    setCurrentHour(currentHour >= 23 ? 0 : currentHour + 1);
  }, [currentHour, setCurrentHour]);

  const prevHour = useCallback(() => {
    setCurrentHour(currentHour <= 0 ? 23 : currentHour - 1);
  }, [currentHour, setCurrentHour]);

  const goToStart = useCallback(() => setCurrentHour(0), [setCurrentHour]);
  const goToEnd = useCallback(() => setCurrentHour(23), [setCurrentHour]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const baseInterval = 1000;
    const interval = baseInterval / playbackSpeed;

    const animate = (timestamp: number) => {
      if (timestamp - lastUpdateRef.current >= interval) {
        setCurrentHour((prev) => (prev >= 23 ? 0 : prev + 1));
        lastUpdateRef.current = timestamp;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, playbackSpeed, setCurrentHour]);

  return {
    currentHour,
    isPlaying,
    playbackSpeed,
    play,
    pause,
    togglePlay,
    goToHour,
    nextHour,
    prevHour,
    goToStart,
    goToEnd,
  };
};

import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

interface UseAudioPlayerOptions {
  autoPlay?: boolean;
  volume?: number;
}

export function useAudioPlayer(audioUrl: string, takeId: string, options: UseAudioPlayerOptions = {}) {
  const { autoPlay = false, volume = 0.8 } = options;
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [vuLevel, setVuLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const setCurrentPlayingId = useStore((s) => s.setCurrentPlayingId);
  const currentPlayingId = useStore((s) => s.currentPlayingId);

  const stopOtherPlayers = useCallback(() => {
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach((audio) => {
      if (audio !== audioRef.current && !audio.paused) {
        audio.pause();
      }
    });
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      if (currentPlayingId === takeId) {
        setCurrentPlayingId(null);
      }
    } else {
      stopOtherPlayers();
      audioRef.current.play().catch((err) => {
        console.error('Playback failed:', err);
      });
      setIsPlaying(true);
      setCurrentPlayingId(takeId);
    }
  }, [isPlaying, takeId, stopOtherPlayers, currentPlayingId, setCurrentPlayingId]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      if (currentPlayingId === takeId) {
        setCurrentPlayingId(null);
      }
    }
  }, [takeId, currentPlayingId, setCurrentPlayingId]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, vol));
    }
  }, []);

  const updateVuLevel = useCallback(() => {
    if (isPlaying && audioRef.current) {
      const baseLevel = 0.3 + Math.random() * 0.4;
      const variation = Math.sin(Date.now() / 100) * 0.2;
      setVuLevel(Math.max(0.1, Math.min(1, baseLevel + variation)));
    } else {
      setVuLevel(Math.max(0, vuLevel - 0.05));
    }
    animationRef.current = requestAnimationFrame(updateVuLevel);
  }, [isPlaying, vuLevel]);

  useEffect(() => {
    animationRef.current = requestAnimationFrame(updateVuLevel);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updateVuLevel]);

  useEffect(() => {
    if (currentPlayingId && currentPlayingId !== takeId && isPlaying) {
      stop();
    }
  }, [currentPlayingId, takeId, isPlaying, stop]);

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audio.volume = volume;
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      if (currentPlayingId === takeId) {
        setCurrentPlayingId(null);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setCurrentPlayingId(takeId);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (currentPlayingId === takeId) {
        setCurrentPlayingId(null);
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);

    if (autoPlay) {
      audio.play().catch(() => {});
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.pause();
    };
  }, [audioUrl, volume, autoPlay, takeId, currentPlayingId, setCurrentPlayingId]);

  return {
    isPlaying,
    isLoading,
    currentTime,
    duration,
    vuLevel,
    togglePlay,
    stop,
    seek,
    setVolume,
    audioElement: audioRef.current,
  };
}

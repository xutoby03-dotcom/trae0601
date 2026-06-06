import { useEffect, useRef } from 'react';
import { Note, DURATION_VALUES } from '../types/score';
import { getNoteFrequency, getTotalDuration } from '../utils/musicUtils';

interface UseAudioPlayerProps {
  notes: Note[];
  bpm: number;
  isPlaying: boolean;
  currentPlayPosition: number;
  onPositionChange: (position: number) => void;
  onStop: () => void;
}

export function useAudioPlayer({
  notes,
  bpm,
  isPlaying,
  currentPlayPosition,
  onPositionChange,
  onStop,
}: UseAudioPlayerProps) {
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startPositionRef = useRef<number>(0);

  useEffect(() => {
    if (isPlaying && !audioContextRef.current) {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextConstructor();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying && audioContextRef.current && notes.length > 0) {
      const ctx = audioContextRef.current;
      const totalDuration = getTotalDuration([{ notes }]);
      startTimeRef.current = ctx.currentTime;
      startPositionRef.current = currentPlayPosition;

      let noteStart = 0;
      notes.forEach((note) => {
        const noteDuration = DURATION_VALUES[note.duration];
        const noteStartTime = (noteStart - currentPlayPosition) * (60 / bpm);
        
        if (noteStartTime >= 0 && note.pitch !== null) {
          const freq = getNoteFrequency(note.pitch, note.octave, note.accidental);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.value = freq;
          
          const durationInSec = noteDuration * (60 / bpm);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + noteStartTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + noteStartTime + durationInSec * 0.9);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(ctx.currentTime + noteStartTime);
          osc.stop(ctx.currentTime + noteStartTime + durationInSec);
        }
        
        noteStart += noteDuration;
      });

      const updatePosition = () => {
        const elapsed = (ctx.currentTime - startTimeRef.current) * (bpm / 60);
        const newPosition = startPositionRef.current + elapsed;
        
        if (newPosition >= totalDuration) {
          onStop();
          return;
        }
        
        onPositionChange(newPosition);
        animationFrameRef.current = requestAnimationFrame(updatePosition);
      };
      
      animationFrameRef.current = requestAnimationFrame(updatePosition);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, notes, bpm, onPositionChange, onStop, currentPlayPosition]);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return null;
}

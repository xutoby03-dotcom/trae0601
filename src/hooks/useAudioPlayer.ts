import { useEffect, useRef } from 'react';
import { Note, DURATION_VALUES, Measure } from '../types/score';
import { getNoteFrequency, getTotalNotesDuration } from '../utils/musicUtils';

interface UseAudioPlayerProps {
  measures: Measure[];
  bpm: number;
  isPlaying: boolean;
  currentPlayPosition: number;
  onPositionChange: (position: number) => void;
  onStop: () => void;
}

function playClick(ctx: AudioContext, time: number, isDownbeat: boolean) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'square';
  osc.frequency.value = isDownbeat ? 1200 : 800;
  
  gain.gain.setValueAtTime(0.15, time);
  gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(time);
  osc.stop(time + 0.05);
}

function playNote(ctx: AudioContext, note: Note, startTime: number, secondsPerBeat: number) {
  if (note.pitch === null) return;
  
  const freq = getNoteFrequency(note.pitch, note.octave, note.accidental);
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  
  osc.type = 'sine';
  osc.frequency.value = freq;
  
  const durationInSec = DURATION_VALUES[note.duration] * secondsPerBeat;
  gain.gain.setValueAtTime(0.3, startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, startTime + durationInSec * 0.9);
  
  osc.connect(gain);
  gain.connect(ctx.destination);
  
  osc.start(startTime);
  osc.stop(startTime + durationInSec);
}

export function getTotalDurationMax(measures: Measure[]): number {
  let melodyTotal = 0;
  let harmonyTotal = 0;
  
  measures.forEach((measure) => {
    melodyTotal += getTotalNotesDuration(measure.melody);
    harmonyTotal += getTotalNotesDuration(measure.harmony);
  });
  
  return Math.max(melodyTotal, harmonyTotal);
}

export function useAudioPlayer({
  measures,
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
    if (isPlaying && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const totalDuration = getTotalDurationMax(measures);
      startTimeRef.current = ctx.currentTime;
      startPositionRef.current = currentPlayPosition;

      const secondsPerBeat = 60 / bpm;
      const startBeat = Math.floor(currentPlayPosition);
      const totalBeats = Math.ceil(totalDuration);
      
      for (let beat = startBeat; beat < totalBeats; beat++) {
        const beatTime = (beat - currentPlayPosition) * secondsPerBeat;
        if (beatTime >= 0) {
          const isDownbeat = beat % 4 === 0;
          playClick(ctx, ctx.currentTime + beatTime, isDownbeat);
        }
      }

      let globalBeatOffset = 0;
      
      measures.forEach((measure) => {
        let melodyBeat = 0;
        let harmonyBeat = 0;
        
        measure.melody.forEach((note) => {
          const noteGlobalBeat = globalBeatOffset + melodyBeat;
          const noteStartTime = (noteGlobalBeat - currentPlayPosition) * secondsPerBeat;
          
          if (noteStartTime >= 0) {
            playNote(ctx, note, ctx.currentTime + noteStartTime, secondsPerBeat);
          }
          
          melodyBeat += DURATION_VALUES[note.duration];
        });
        
        measure.harmony.forEach((note) => {
          const noteGlobalBeat = globalBeatOffset + harmonyBeat;
          const noteStartTime = (noteGlobalBeat - currentPlayPosition) * secondsPerBeat;
          
          if (noteStartTime >= 0) {
            playNote(ctx, note, ctx.currentTime + noteStartTime, secondsPerBeat);
          }
          
          harmonyBeat += DURATION_VALUES[note.duration];
        });
        
        globalBeatOffset += Math.max(melodyBeat, harmonyBeat);
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
  }, [isPlaying, measures, bpm, onPositionChange, onStop, currentPlayPosition]);

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

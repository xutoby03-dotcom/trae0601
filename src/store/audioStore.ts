import { create } from 'zustand';
import { VisualMode, Marker, AudioInfo } from '@/types';

interface AudioState {
  audioFile: File | null;
  audioBuffer: AudioBuffer | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isRecording: boolean;
  visualMode: VisualMode;
  eqGains: number[];
  markers: Marker[];
  sliceStart: number;
  sliceEnd: number;
  audioInfo: AudioInfo | null;
  analyser: AnalyserNode | null;
  audioContext: AudioContext | null;
  frequencyData: Uint8Array;
  timeData: Uint8Array;
  
  setAudioFile: (file: File | null) => void;
  setAudioBuffer: (buffer: AudioBuffer | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setIsRecording: (recording: boolean) => void;
  setVisualMode: (mode: VisualMode) => void;
  setEqGain: (index: number, gain: number) => void;
  resetEq: () => void;
  addMarker: (marker: Omit<Marker, 'id'>) => void;
  removeMarker: (id: string) => void;
  updateMarker: (id: string, updates: Partial<Marker>) => void;
  setSliceRange: (start: number, end: number) => void;
  setAudioInfo: (info: AudioInfo | null) => void;
  setAnalyser: (analyser: AnalyserNode | null) => void;
  setAudioContext: (ctx: AudioContext | null) => void;
  setAudioData: (frequency: Uint8Array, time: Uint8Array) => void;
  resetAll: () => void;
}

const EQ_BANDS = 10;
const initialEqGains = new Array(EQ_BANDS).fill(0);

export const useAudioStore = create<AudioState>((set) => ({
  audioFile: null,
  audioBuffer: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isRecording: false,
  visualMode: 'spectrum',
  eqGains: initialEqGains,
  markers: [],
  sliceStart: 0,
  sliceEnd: 0,
  audioInfo: null,
  analyser: null,
  audioContext: null,
  frequencyData: new Uint8Array(1024),
  timeData: new Uint8Array(1024),

  setAudioFile: (file) => set({ audioFile: file }),
  setAudioBuffer: (buffer) => set({ audioBuffer: buffer }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration, sliceEnd: duration }),
  setVolume: (volume) => set({ volume }),
  setIsRecording: (recording) => set({ isRecording: recording }),
  setVisualMode: (mode) => set({ visualMode: mode }),
  
  setEqGain: (index, gain) =>
    set((state) => {
      const newGains = [...state.eqGains];
      newGains[index] = gain;
      return { eqGains: newGains };
    }),
  
  resetEq: () => set({ eqGains: initialEqGains }),
  
  addMarker: (marker) =>
    set((state) => ({
      markers: [...state.markers, { ...marker, id: Date.now().toString() }],
    })),
  
  removeMarker: (id) =>
    set((state) => ({
      markers: state.markers.filter((m) => m.id !== id),
    })),
  
  updateMarker: (id, updates) =>
    set((state) => ({
      markers: state.markers.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  
  setSliceRange: (start, end) => set({ sliceStart: start, sliceEnd: end }),
  setAudioInfo: (info) => set({ audioInfo: info }),
  setAnalyser: (analyser) => set({ analyser }),
  setAudioContext: (ctx) => set({ audioContext: ctx }),
  setAudioData: (frequency, time) => set({ frequencyData: frequency, timeData: time }),
  
  resetAll: () =>
    set({
      audioFile: null,
      audioBuffer: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      markers: [],
      sliceStart: 0,
      sliceEnd: 0,
      audioInfo: null,
    }),
}));

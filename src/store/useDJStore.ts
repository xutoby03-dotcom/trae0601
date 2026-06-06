import { create } from 'zustand';
import type { DeckState, MixerState, DeckId, EQ, Effects } from '../types';

const initialDeckState = (id: DeckId): DeckState => ({
  id,
  audioBuffer: null,
  fileName: '',
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  bpm: 120,
  detectedBPM: 120,
  pitch: 0,
  cuePoints: [0, 0, 0, 0, 0, 0, 0, 0],
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 0,
  loopBeats: 4,
  eq: { low: 0, mid: 0, high: 0 },
  effects: {
    reverb: 0,
    delay: 0,
    filter: 0,
    filterType: 'lowpass',
  },
  beatPhase: 0,
});

interface DJStore {
  deckA: DeckState;
  deckB: DeckState;
  mixer: MixerState;
  audioContext: AudioContext | null;
  
  initAudioContext: () => AudioContext;
  setDeckBuffer: (deckId: DeckId, buffer: AudioBuffer, fileName: string) => void;
  setDeckPlaying: (deckId: DeckId, isPlaying: boolean) => void;
  setDeckCurrentTime: (deckId: DeckId, time: number) => void;
  setDeckVolume: (deckId: DeckId, volume: number) => void;
  setDeckBPM: (deckId: DeckId, bpm: number) => void;
  setDeckPitch: (deckId: DeckId, pitch: number) => void;
  setDeckEQ: (deckId: DeckId, eq: Partial<EQ>) => void;
  setDeckEffects: (deckId: DeckId, effects: Partial<Effects>) => void;
  setCuePoint: (deckId: DeckId, index: number, time: number) => void;
  jumpToCue: (deckId: DeckId, index: number) => void;
  setLoop: (deckId: DeckId, enabled: boolean, beats?: 1 | 2 | 4 | 8) => void;
  setBeatPhase: (deckId: DeckId, phase: number) => void;
  
  setCrossfader: (value: number) => void;
  setMasterVolume: (value: number) => void;
  setRecording: (isRecording: boolean, blob?: Blob | null) => void;
  
  getDeck: (deckId: DeckId) => DeckState;
}

export const useDJStore = create<DJStore>((set, get) => ({
  deckA: initialDeckState('A'),
  deckB: initialDeckState('B'),
  mixer: {
    crossfader: 0,
    masterVolume: 0.8,
    isRecording: false,
    recordedBlob: null,
  },
  audioContext: null,
  
  initAudioContext: () => {
    const existing = get().audioContext;
    if (existing) return existing;
    
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    set({ audioContext: ctx });
    return ctx;
  },
  
  setDeckBuffer: (deckId, buffer, fileName) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        audioBuffer: buffer,
        fileName,
        duration: buffer.duration,
        currentTime: 0,
      },
    }));
  },
  
  setDeckPlaying: (deckId, isPlaying) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        isPlaying,
      },
    }));
  },
  
  setDeckCurrentTime: (deckId, time) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        currentTime: time,
      },
    }));
  },
  
  setDeckVolume: (deckId, volume) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        volume: Math.max(0, Math.min(1, volume)),
      },
    }));
  },
  
  setDeckBPM: (deckId, bpm) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        bpm,
        detectedBPM: bpm,
      },
    }));
  },
  
  setDeckPitch: (deckId, pitch) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        pitch: Math.max(-50, Math.min(50, pitch)),
      },
    }));
  },
  
  setDeckEQ: (deckId, eq) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        eq: { ...state[`deck${deckId}`].eq, ...eq },
      },
    }));
  },
  
  setDeckEffects: (deckId, effects) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        effects: { ...state[`deck${deckId}`].effects, ...effects },
      },
    }));
  },
  
  setCuePoint: (deckId, index, time) => {
    set((state) => {
      const cuePoints = [...state[`deck${deckId}`].cuePoints];
      cuePoints[index] = time;
      return {
        [`deck${deckId}`]: {
          ...state[`deck${deckId}`],
          cuePoints,
        },
      };
    });
  },
  
  jumpToCue: (deckId, index) => {
    const state = get();
    const deck = state[`deck${deckId}`];
    const cueTime = deck.cuePoints[index];
    if (cueTime !== undefined) {
      set((s) => ({
        [`deck${deckId}`]: {
          ...s[`deck${deckId}`],
          currentTime: cueTime,
        },
      }));
    }
  },
  
  setLoop: (deckId, enabled, beats) => {
    set((state) => {
      const deck = state[`deck${deckId}`];
      const currentBeats = beats || deck.loopBeats;
      
      if (enabled) {
        const beatDuration = 60 / deck.bpm;
        const loopDuration = beatDuration * currentBeats;
        const loopStart = Math.floor(deck.currentTime / loopDuration) * loopDuration;
        
        return {
          [`deck${deckId}`]: {
            ...deck,
            loopEnabled: true,
            loopBeats: currentBeats,
            loopStart,
            loopEnd: loopStart + loopDuration,
          },
        };
      }
      
      return {
        [`deck${deckId}`]: {
          ...deck,
          loopEnabled: false,
        },
      };
    });
  },
  
  setBeatPhase: (deckId, phase) => {
    set((state) => ({
      [`deck${deckId}`]: {
        ...state[`deck${deckId}`],
        beatPhase: phase,
      },
    }));
  },
  
  setCrossfader: (value) => {
    set((state) => ({
      mixer: {
        ...state.mixer,
        crossfader: Math.max(-1, Math.min(1, value)),
      },
    }));
  },
  
  setMasterVolume: (value) => {
    set((state) => ({
      mixer: {
        ...state.mixer,
        masterVolume: Math.max(0, Math.min(1, value)),
      },
    }));
  },
  
  setRecording: (isRecording, blob = null) => {
    set((state) => ({
      mixer: {
        ...state.mixer,
        isRecording,
        recordedBlob: blob !== undefined ? blob : state.mixer.recordedBlob,
      },
    }));
  },
  
  getDeck: (deckId) => {
    return get()[`deck${deckId}`];
  },
}));

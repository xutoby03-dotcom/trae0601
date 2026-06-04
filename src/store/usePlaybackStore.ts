import { create } from 'zustand';

interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  fps: number;
  playbackRate: number;
  
  setCurrentTime: (time: number | ((prev: number) => number)) => void;
  setDuration: (duration: number) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  setPlaybackRate: (rate: number) => void;
  seekByFrames: (frames: number) => void;
  setFps: (fps: number) => void;
}

export const usePlaybackStore = create<PlaybackState>((set, get) => ({
  currentTime: 0,
  duration: 60,
  isPlaying: false,
  fps: 30,
  playbackRate: 1,
  
  setCurrentTime: (time) => {
    const { duration } = get();
    const newTime = typeof time === 'function' ? time(get().currentTime) : time;
    set({ currentTime: Math.max(0, Math.min(newTime, duration)) });
  },
  
  setDuration: (duration: number) => set({ duration }),
  
  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setPlaybackRate: (playbackRate: number) => set({ playbackRate }),
  
  seekByFrames: (frames: number) => {
    const { currentTime, fps, duration } = get();
    const newTime = currentTime + frames / fps;
    set({ currentTime: Math.max(0, Math.min(newTime, duration)) });
  },
  
  setFps: (fps: number) => set({ fps }),
}));

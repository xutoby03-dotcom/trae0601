// @ts-nocheck
import { create } from "zustand";
import type { PlayerState } from "@/types";

interface PlayerStoreFull extends PlayerState {
  // 新旧 API 兼容
  loadRecording: (id: string, duration: number) => void;
  setRecording: (id: string | null, duration?: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  seekBy: (seconds: number) => void;
  setRate: (rate: number) => void;
  setPlaybackRate: (rate: number) => void;
  setVolume: (v: number) => void;
  setSelection: (sel: { start: number; end: number } | null) => void;
  tick: (deltaSec: number) => void;
}

let rafId: number | null = null;
let lastTs: number = 0;

function stopRaf() {
  if (rafId != null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  lastTs = 0;
}

function startLoop() {
  stopRaf();
  const step = (ts: number) => {
    if (!lastTs) lastTs = ts;
    const delta = (ts - lastTs) / 1000;
    lastTs = ts;
    const st = usePlayerStore.getState();
    if (st.isPlaying) {
      usePlayerStore.getState().tick(delta);
    }
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);
}

export const usePlayerStore = create<PlayerStoreFull>((set, get) => ({
  currentRecordingId: null,
  recordingId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  volume: 1,
  selection: null,
  hasSelection: false,

  loadRecording: (id, duration) => {
    stopRaf();
    set({
      currentRecordingId: id,
      recordingId: id,
      duration,
      currentTime: 0,
      isPlaying: false,
      selection: null,
      hasSelection: false,
    });
    startLoop();
  },

  setRecording: (id, duration) => {
    if (id == null) {
      stopRaf();
      set({
        currentRecordingId: null,
        recordingId: null,
        currentTime: 0,
        duration: 0,
        isPlaying: false,
      });
    } else {
      get().loadRecording(id, duration ?? get().duration);
    }
  },

  play: () => {
    const st = get();
    if (!st.currentRecordingId) return;
    if (st.currentTime >= st.duration) {
      set({ currentTime: 0 });
    }
    if (rafId == null) startLoop();
    set({ isPlaying: true });
  },

  pause: () => set({ isPlaying: false }),

  toggle: () => (get().isPlaying ? get().pause() : get().play()),
  togglePlay: () => get().toggle(),

  seek: (time) => set({ currentTime: Math.max(0, Math.min(get().duration, time)) }),
  setCurrentTime: (time) => get().seek(time),

  seekBy: (seconds) => get().seek(get().currentTime + seconds),

  setRate: (rate) => set({ playbackRate: rate }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),

  setSelection: (sel) =>
    set({
      selection: sel,
      hasSelection: sel != null,
    }),

  tick: (deltaSec) => {
    const st = get();
    if (!st.isPlaying) return;
    const next = st.currentTime + deltaSec * st.playbackRate;
    if (next >= st.duration) {
      set({ currentTime: st.duration, isPlaying: false });
    } else {
      set({ currentTime: next });
    }
  },
}));

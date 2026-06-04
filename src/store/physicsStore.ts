import { create } from 'zustand';
import type { ToolType, EmitterData, SceneData, DrawState } from '../types';

interface PhysicsStore {
  activeTool: ToolType;
  selectedBody: string | null;
  selectedEmitter: string | null;
  gravity: { x: number; y: number };
  timeScale: number;
  isPaused: boolean;
  zoom: number;
  pan: { x: number; y: number };
  emitters: EmitterData[];
  scenes: SceneData[];
  currentSceneId: string | null;
  fps: number;
  collisionCount: number;
  bodyCount: number;
  showSceneList: boolean;
  showGravityControl: boolean;
  drawState: DrawState;
  mouseConstraint: any;

  setActiveTool: (tool: ToolType) => void;
  setSelectedBody: (id: string | null) => void;
  setSelectedEmitter: (id: string | null) => void;
  setGravity: (x: number, y: number) => void;
  setTimeScale: (scale: number) => void;
  setIsPaused: (paused: boolean) => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  addEmitter: (emitter: EmitterData) => void;
  removeEmitter: (id: string) => void;
  updateEmitter: (id: string, data: Partial<EmitterData>) => void;
  setScenes: (scenes: SceneData[]) => void;
  setCurrentSceneId: (id: string | null) => void;
  setFps: (fps: number) => void;
  setCollisionCount: (count: number) => void;
  setBodyCount: (count: number) => void;
  setShowSceneList: (show: boolean) => void;
  setShowGravityControl: (show: boolean) => void;
  setDrawState: (state: Partial<DrawState>) => void;
  setMouseConstraint: (constraint: any) => void;
  resetView: () => void;
}

export const usePhysicsStore = create<PhysicsStore>((set) => ({
  activeTool: 'select',
  selectedBody: null,
  selectedEmitter: null,
  gravity: { x: 0, y: 1 },
  timeScale: 1,
  isPaused: false,
  zoom: 1,
  pan: { x: 0, y: 0 },
  emitters: [],
  scenes: [],
  currentSceneId: null,
  fps: 60,
  collisionCount: 0,
  bodyCount: 0,
  showSceneList: false,
  showGravityControl: false,
  mouseConstraint: null,
  drawState: {
    isDrawing: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    points: [],
    constraintStart: null,
    explosionStart: null,
  },

  setActiveTool: (tool) => set({ activeTool: tool }),
  setSelectedBody: (id) => set({ selectedBody: id, selectedEmitter: null }),
  setSelectedEmitter: (id) => set({ selectedEmitter: id, selectedBody: null }),
  setGravity: (x, y) => set({ gravity: { x, y } }),
  setTimeScale: (scale) => set({ timeScale: scale }),
  setIsPaused: (paused) => set({ isPaused: paused }),
  setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
  setPan: (x, y) => set({ pan: { x, y } }),
  addEmitter: (emitter) =>
    set((state) => ({ emitters: [...state.emitters, emitter] })),
  removeEmitter: (id) =>
    set((state) => ({
      emitters: state.emitters.filter((e) => e.id !== id),
    })),
  updateEmitter: (id, data) =>
    set((state) => ({
      emitters: state.emitters.map((e) =>
        e.id === id ? { ...e, ...data } : e
      ),
    })),
  setScenes: (scenes) => set({ scenes }),
  setCurrentSceneId: (id) => set({ currentSceneId: id }),
  setFps: (fps) => set({ fps }),
  setCollisionCount: (count) => set({ collisionCount: count }),
  setBodyCount: (count) => set({ bodyCount: count }),
  setShowSceneList: (show) => set({ showSceneList: show }),
  setShowGravityControl: (show) => set({ showGravityControl: show }),
  setDrawState: (state) =>
    set((prev) => ({ drawState: { ...prev.drawState, ...state } })),
  setMouseConstraint: (constraint) => set({ mouseConstraint: constraint }),
  resetView: () => set({ zoom: 1, pan: { x: 0, y: 0 } }),
}));

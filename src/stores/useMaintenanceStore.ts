import { create } from 'zustand';
import type { MaintenanceSession, TrackPoint, ViewMode, ActiveTool } from '../types';
import { iceRinkConfig } from '../data/mockData';

interface MaintenanceState {
  session: MaintenanceSession;
  completedSessions: MaintenanceSession[];
  viewMode: ViewMode;
  activeTool: ActiveTool;
  isSimulating: boolean;
  setViewMode: (mode: ViewMode) => void;
  setActiveTool: (tool: ActiveTool) => void;
  startMaintenance: () => void;
  pauseMaintenance: () => void;
  resumeMaintenance: () => void;
  endMaintenance: () => void;
  addTrackPoint: (point: TrackPoint) => void;
  addTrackPoints: (points: TrackPoint[]) => void;
  setBladeHeight: (height: number) => void;
  setIsSimulating: (simulating: boolean) => void;
  resetSession: () => void;
}

const createEmptySession = (): MaintenanceSession => ({
  id: `session-${Date.now()}`,
  startTime: 0,
  status: 'idle',
  bladeHeight: 2.5,
  waterAmount: 0,
  trackPoints: [],
  coveredArea: 0,
});

export const useMaintenanceStore = create<MaintenanceState>((set, get) => ({
  session: createEmptySession(),
  completedSessions: [],
  viewMode: 'normal',
  activeTool: 'none',
  isSimulating: false,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveTool: (tool) => set({ activeTool: tool }),

  startMaintenance: () =>
    set((state) => ({
      session: {
        ...state.session,
        id: `session-${Date.now()}`,
        startTime: Date.now(),
        endTime: undefined,
        status: 'running',
        trackPoints: [],
        coveredArea: 0,
        waterAmount: 0,
      },
      isSimulating: true,
    })),

  pauseMaintenance: () =>
    set((state) => ({
      session: { ...state.session, status: 'paused' },
      isSimulating: false,
    })),

  resumeMaintenance: () =>
    set((state) => ({
      session: { ...state.session, status: 'running' },
      isSimulating: true,
    })),

  endMaintenance: () =>
    set((state) => {
      const finalSession: MaintenanceSession = {
        ...state.session,
        endTime: Date.now(),
        status: 'completed',
        coveredArea: calculateCoverage(state.session.trackPoints),
      };
      return {
        session: finalSession,
        completedSessions: [...state.completedSessions, finalSession],
        isSimulating: false,
      };
    }),

  addTrackPoint: (point) =>
    set((state) => {
      const newPoints = [...state.session.trackPoints, point];
      const newCoveredArea = calculateCoverage(newPoints);
      const waterIncrease = point.water ? 0.5 : 0;
      return {
        session: {
          ...state.session,
          trackPoints: newPoints,
          coveredArea: newCoveredArea,
          waterAmount: state.session.waterAmount + waterIncrease,
        },
      };
    }),

  addTrackPoints: (points) =>
    set((state) => {
      const newPoints = [...state.session.trackPoints, ...points];
      const newCoveredArea = calculateCoverage(newPoints);
      const waterIncrease = points.filter((p) => p.water).length * 0.5;
      return {
        session: {
          ...state.session,
          trackPoints: newPoints,
          coveredArea: newCoveredArea,
          waterAmount: state.session.waterAmount + waterIncrease,
        },
      };
    }),

  setBladeHeight: (height) =>
    set((state) => ({
      session: { ...state.session, bladeHeight: height },
    })),

  setIsSimulating: (simulating) => set({ isSimulating: simulating }),

  resetSession: () => set({ session: createEmptySession(), isSimulating: false }),
}));

function calculateCoverage(points: TrackPoint[]): number {
  if (points.length < 2) return 0;
  const totalArea = iceRinkConfig.width * iceRinkConfig.height;
  const pathLength = points.reduce((acc, point, i) => {
    if (i === 0) return 0;
    const prev = points[i - 1];
    const dx = point.x - prev.x;
    const dy = point.y - prev.y;
    return acc + Math.sqrt(dx * dx + dy * dy);
  }, 0);
  const covered = (pathLength * 2.5) / totalArea;
  return Math.min(Math.round(covered * 100), 100);
}

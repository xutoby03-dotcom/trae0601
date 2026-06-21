import { create } from 'zustand';
import { AppState, RiskMark, RiskType, Point } from '../types';
import { mockPoles } from '../data/mockPoles';
import { mockRooftop, mockSensors } from '../data/mockRooftop';
import { mockWindData24h } from '../data/mockWindData';

interface WindStore extends AppState {
  windData: typeof mockWindData24h;
  rooftop: typeof mockRooftop;
  poles: typeof mockPoles;
  sensors: typeof mockSensors;
  
  setCurrentHour: (hour: number | ((prev: number) => number)) => void;
  setIsPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setSelectedPoleId: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setPan: (pan: Point) => void;
  setContextMenu: (menu: { x: number; y: number; poleId: string } | null) => void;
  
  addRiskMark: (poleId: string, type: RiskType, note: string) => void;
  removeRiskMark: (poleId: string) => void;
  updateRiskMark: (poleId: string, type: RiskType, note: string) => void;
  
  getCurrentWindData: () => typeof mockWindData24h.hours[0];
  getPoleRiskMark: (poleId: string) => RiskMark | undefined;
}

export const useWindStore = create<WindStore>((set, get) => ({
  currentHour: 12,
  isPlaying: false,
  playbackSpeed: 1,
  selectedPoleId: null,
  riskMarks: [],
  zoom: 1,
  pan: { x: 0, y: 0 },
  contextMenu: null,
  
  windData: mockWindData24h,
  rooftop: mockRooftop,
  poles: mockPoles,
  sensors: mockSensors,

  setCurrentHour: (hour) => set((state) => ({ 
    currentHour: Math.max(0, Math.min(23, typeof hour === 'function' ? hour(state.currentHour) : hour)) 
  })),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  setSelectedPoleId: (id) => set({ selectedPoleId: id, contextMenu: null }),
  setZoom: (zoom) => set({ zoom: Math.max(0.5, Math.min(2, zoom)) }),
  setPan: (pan) => set({ pan }),
  setContextMenu: (menu) => set({ contextMenu: menu }),

  addRiskMark: (poleId, type, note) => set((state) => ({
    riskMarks: [
      ...state.riskMarks.filter(m => m.poleId !== poleId),
      {
        id: `mark-${Date.now()}`,
        poleId,
        type,
        note,
        createdAt: new Date().toISOString(),
      },
    ],
    contextMenu: null,
  })),

  removeRiskMark: (poleId) => set((state) => ({
    riskMarks: state.riskMarks.filter(m => m.poleId !== poleId),
  })),

  updateRiskMark: (poleId, type, note) => set((state) => ({
    riskMarks: state.riskMarks.map(m =>
      m.poleId === poleId ? { ...m, type, note } : m
    ),
  })),

  getCurrentWindData: () => {
    const { windData, currentHour } = get();
    return windData.hours[currentHour] || windData.hours[0];
  },

  getPoleRiskMark: (poleId) => {
    const { riskMarks } = get();
    return riskMarks.find(m => m.poleId === poleId);
  },
}));

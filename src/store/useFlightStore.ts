import { create } from 'zustand';
import type { AirspaceInfo, WeatherInfo, RthInfo, Battery, ShotItem, FlightCheckStatus } from '@/types';
import { getLocationData, getLocationNames, defaultBatteries, defaultShots, evaluateShots } from '@/data/mockData';

interface FlightStore {
  locationName: string;
  locationNames: string[];
  airspace: AirspaceInfo | null;
  weather: WeatherInfo | null;
  rth: RthInfo | null;
  batteries: Battery[];
  shots: ShotItem[];
  flightStatus: FlightCheckStatus;
  selectedLocation: string;
  expandedShot: string | null;

  setLocation: (name: string) => void;
  updateBattery: (id: string, updates: Partial<Battery>) => void;
  addBattery: () => void;
  removeBattery: (id: string) => void;
  addShot: () => void;
  updateShot: (id: string, updates: Partial<ShotItem>) => void;
  removeShot: (id: string) => void;
  toggleShotExpand: (id: string) => void;
  recalcShots: () => void;
  checkFlight: () => void;
}

export const useFlightStore = create<FlightStore>((set, get) => ({
  locationName: '',
  locationNames: getLocationNames(),
  airspace: null,
  weather: null,
  rth: null,
  batteries: defaultBatteries,
  shots: defaultShots,
  flightStatus: 'idle',
  selectedLocation: '',
  expandedShot: null,

  setLocation: (name: string) => {
    const data = getLocationData(name);
    if (!data) {
      set({ locationName: name, airspace: null, weather: null, rth: null, flightStatus: 'idle', selectedLocation: name });
      return;
    }
    const evaluatedShots = evaluateShots(get().shots, data.airspace.altitudeLimit, data.weather.windSpeed);
    set({
      locationName: name,
      selectedLocation: name,
      airspace: data.airspace,
      weather: data.weather,
      rth: data.rth,
      shots: evaluatedShots,
      flightStatus: 'checking',
    });
    setTimeout(() => get().checkFlight(), 800);
  },

  updateBattery: (id, updates) => {
    set((state) => {
      const batteries = state.batteries.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, ...updates };
        if (updated.cycleCount >= 200) {
          updated.status = 'critical';
          updated.health = Math.max(40, 100 - Math.floor(updated.cycleCount * 0.25));
          updated.estimatedFlightTime = Math.max(10, 30 - Math.floor(updated.cycleCount * 0.07));
        } else if (updated.cycleCount >= 100) {
          updated.status = 'warning';
          updated.health = Math.max(60, 100 - Math.floor(updated.cycleCount * 0.2));
          updated.estimatedFlightTime = Math.max(15, 30 - Math.floor(updated.cycleCount * 0.06));
        } else {
          updated.status = 'good';
          updated.health = Math.max(85, 100 - Math.floor(updated.cycleCount * 0.1));
          updated.estimatedFlightTime = Math.max(25, 30 - Math.floor(updated.cycleCount * 0.04));
        }
        return updated;
      });
      return { batteries };
    });
  },

  addBattery: () => {
    set((state) => {
      const idx = state.batteries.length + 1;
      const newBat: Battery = {
        id: `bat-${Date.now()}`,
        name: `电池 ${String.fromCharCode(64 + idx)}`,
        cycleCount: 0,
        health: 100,
        estimatedFlightTime: 30,
        status: 'good',
      };
      return { batteries: [...state.batteries, newBat] };
    });
  },

  removeBattery: (id) => {
    set((state) => ({ batteries: state.batteries.filter((b) => b.id !== id) }));
  },

  addShot: () => {
    set((state) => {
      const idx = state.shots.length + 1;
      const newShot: ShotItem = {
        id: `shot-${Date.now()}`,
        order: idx,
        name: `镜头 ${idx}`,
        description: '请描述镜头内容',
        requiredAltitude: 50,
        maxWindSpeed: 8,
        batteryId: state.batteries[0]?.id || '',
        status: 'safe',
        issues: [],
        alternatives: [],
      };
      return { shots: [...state.shots, newShot] };
    });
  },

  updateShot: (id, updates) => {
    set((state) => ({
      shots: state.shots.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },

  removeShot: (id) => {
    set((state) => ({
      shots: state.shots
        .filter((s) => s.id !== id)
        .map((s, i) => ({ ...s, order: i + 1 })),
    }));
  },

  toggleShotExpand: (id) => {
    set((state) => ({ expandedShot: state.expandedShot === id ? null : id }));
  },

  recalcShots: () => {
    const state = get();
    if (!state.airspace || !state.weather) return;
    const evaluatedShots = evaluateShots(state.shots, state.airspace.altitudeLimit, state.weather.windSpeed);
    set({ shots: evaluatedShots });
    get().checkFlight();
  },

  checkFlight: () => {
    const state = get();
    if (!state.airspace || !state.weather) {
      set({ flightStatus: 'idle' });
      return;
    }
    const hasDanger = state.shots.some((s) => s.status === 'danger');
    const hasCaution = state.shots.some((s) => s.status === 'caution');
    const airspaceDanger = state.airspace.status === 'danger';
    const windDanger = state.weather.windStatus === 'danger';
    const batteryCritical = state.batteries.some((b) => b.status === 'critical');

    if (hasDanger || airspaceDanger || windDanger || batteryCritical) {
      set({ flightStatus: 'risk' });
    } else if (hasCaution || state.airspace.status === 'caution' || state.weather.windStatus === 'caution') {
      set({ flightStatus: 'risk' });
    } else {
      set({ flightStatus: 'ready' });
    }
  },
}));

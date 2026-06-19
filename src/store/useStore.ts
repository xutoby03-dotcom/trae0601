import { create } from 'zustand';
import type { GardenBed, Volunteer, Schedule, CheckIn, Anomaly, Weather, DashboardStats } from '@shared/types.js';

interface StoreState {
  currentUser: Volunteer | null;
  gardenBeds: GardenBed[];
  volunteers: Volunteer[];
  schedules: Schedule[];
  checkIns: CheckIn[];
  anomalies: Anomaly[];
  weather: Weather | null;
  dashboardStats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  
  setCurrentUser: (user: Volunteer | null) => void;
  fetchCurrentUser: () => Promise<void>;
  fetchGardenBeds: () => Promise<void>;
  fetchVolunteers: () => Promise<void>;
  fetchSchedules: (date?: string) => Promise<void>;
  fetchCheckIns: (gardenBedId?: string) => Promise<void>;
  fetchAnomalies: () => Promise<void>;
  fetchWeather: () => Promise<void>;
  fetchDashboardStats: () => Promise<void>;
  
  createGardenBed: (data: Omit<GardenBed, 'id'>) => Promise<GardenBed | null>;
  updateGardenBed: (id: string, data: Partial<GardenBed>) => Promise<GardenBed | null>;
  deleteGardenBed: (id: string) => Promise<boolean>;
  
  claimSchedule: (scheduleId: string, volunteerId: string) => Promise<Schedule | null>;
  unclaimSchedule: (scheduleId: string, volunteerId: string) => Promise<Schedule | null>;
  generateWeeklySchedules: (weekStartDate: string) => Promise<{ success: boolean; count: number }>;
  
  createCheckIn: (data: Omit<CheckIn, 'id' | 'checkInTime' | 'createdAt'>) => Promise<{ success: boolean; checkIn: CheckIn; anomalies: Anomaly[] } | null>;
  
  resolveAnomaly: (anomalyId: string, resolvedBy: string) => Promise<Anomaly | null>;
  updateAnomaly: (anomalyId: string, data: Partial<Anomaly>) => Promise<Anomaly | null>;
  
  simulateWeatherChange: () => Promise<Weather | null>;
}

const API_BASE = '/api';

const apiFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || '请求失败');
  }
  return data.data;
};

export const useStore = create<StoreState>((set, get) => ({
  currentUser: null,
  gardenBeds: [],
  volunteers: [],
  schedules: [],
  checkIns: [],
  anomalies: [],
  weather: null,
  dashboardStats: null,
  loading: false,
  error: null,

  setCurrentUser: (user: Volunteer | null) => {
    set({ currentUser: user });
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  },

  fetchCurrentUser: async () => {
    const saved = localStorage.getItem('currentUser');
    if (saved) {
      try {
        const user = JSON.parse(saved);
        set({ currentUser: user });
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  },

  fetchGardenBeds: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<GardenBed[]>('/garden-beds');
      set({ gardenBeds: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchVolunteers: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<Volunteer[]>('/volunteers');
      set({ volunteers: data, loading: false });
      
      if (!get().currentUser) {
        const saved = localStorage.getItem('currentUser');
        if (saved) {
          set({ currentUser: JSON.parse(saved) });
        } else if (data.length > 0) {
          const defaultUser = data[0];
          set({ currentUser: defaultUser });
          localStorage.setItem('currentUser', JSON.stringify(defaultUser));
        }
      }
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchSchedules: async (date?: string) => {
    set({ loading: true, error: null });
    try {
      const url = date ? `/schedules?date=${date}` : '/schedules';
      const data = await apiFetch<Schedule[]>(url);
      set({ schedules: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchCheckIns: async (gardenBedId?: string) => {
    set({ loading: true, error: null });
    try {
      const url = gardenBedId ? `/check-ins?gardenBedId=${gardenBedId}` : '/check-ins';
      const data = await apiFetch<CheckIn[]>(url);
      set({ checkIns: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchAnomalies: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<Anomaly[]>('/anomalies');
      set({ anomalies: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchWeather: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<Weather>('/weather');
      set({ weather: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchDashboardStats: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiFetch<DashboardStats>('/stats/dashboard');
      set({ dashboardStats: data, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  },

  createGardenBed: async (data: Omit<GardenBed, 'id'>) => {
    set({ loading: true, error: null });
    try {
      const newBed = await apiFetch<GardenBed>('/garden-beds', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      set(state => ({ gardenBeds: [...state.gardenBeds, newBed], loading: false }));
      return newBed;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updateGardenBed: async (id: string, data: Partial<GardenBed>) => {
    set({ loading: true, error: null });
    try {
      const updatedBed = await apiFetch<GardenBed>(`/garden-beds/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      set(state => ({
        gardenBeds: state.gardenBeds.map(b => b.id === id ? updatedBed : b),
        loading: false,
      }));
      return updatedBed;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  deleteGardenBed: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await apiFetch(`/garden-beds/${id}`, { method: 'DELETE' });
      set(state => ({
        gardenBeds: state.gardenBeds.filter(b => b.id !== id),
        loading: false,
      }));
      return true;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return false;
    }
  },

  claimSchedule: async (scheduleId: string, volunteerId: string) => {
    set({ loading: true, error: null });
    try {
      const schedule = await apiFetch<Schedule>(`/schedules/${scheduleId}/claim`, {
        method: 'POST',
        body: JSON.stringify({ volunteerId }),
      });
      set(state => ({
        schedules: state.schedules.map(s => s.id === scheduleId ? schedule : s),
        loading: false,
      }));
      return schedule;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  unclaimSchedule: async (scheduleId: string, volunteerId: string) => {
    set({ loading: true, error: null });
    try {
      const schedule = await apiFetch<Schedule>(`/schedules/${scheduleId}/unclaim`, {
        method: 'POST',
        body: JSON.stringify({ volunteerId }),
      });
      set(state => ({
        schedules: state.schedules.map(s => s.id === scheduleId ? schedule : s),
        loading: false,
      }));
      return schedule;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  generateWeeklySchedules: async (weekStartDate: string) => {
    set({ loading: true, error: null });
    try {
      const result = await apiFetch<{ success: boolean; count: number }>('/schedules/generate', {
        method: 'POST',
        body: JSON.stringify({ weekStartDate }),
      });
      set({ loading: false });
      return result;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return { success: false, count: 0 };
    }
  },

  createCheckIn: async (payload: Omit<CheckIn, 'id' | 'checkInTime' | 'createdAt'>) => {
    set({ loading: true, error: null });
    try {
      const result = await apiFetch<CheckIn & { anomalies?: Anomaly[] }>('/check-ins', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const { anomalies: newAnomalies, ...checkInFields } = result;
      const anomalies = newAnomalies || [];

      const checkInOnly: CheckIn = {
        id: checkInFields.id,
        gardenBedId: checkInFields.gardenBedId,
        volunteerId: checkInFields.volunteerId,
        scheduleId: checkInFields.scheduleId,
        checkInTime: checkInFields.checkInTime,
        createdAt: checkInFields.createdAt,
        waterAmount: checkInFields.waterAmount,
        soilMoisture: checkInFields.soilMoisture,
        hasPests: checkInFields.hasPests,
        pestDetails: checkInFields.pestDetails,
        hasWeeds: checkInFields.hasWeeds,
        weedLevel: checkInFields.weedLevel,
        harvestedAmount: checkInFields.harvestedAmount,
        notes: checkInFields.notes,
        photoUrl: checkInFields.photoUrl,
      };

      set(state => ({
        checkIns: [checkInOnly, ...state.checkIns],
        anomalies: [...anomalies, ...state.anomalies],
        loading: false,
      }));

      return {
        success: true,
        checkIn: checkInOnly,
        anomalies,
      };
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  resolveAnomaly: async (anomalyId: string, resolvedBy: string) => {
    set({ loading: true, error: null });
    try {
      const anomaly = await apiFetch<Anomaly>(`/anomalies/${anomalyId}/resolve`, {
        method: 'PUT',
        body: JSON.stringify({ resolvedBy }),
      });
      set(state => ({
        anomalies: state.anomalies.map(a => a.id === anomalyId ? anomaly : a),
        loading: false,
      }));
      return anomaly;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  updateAnomaly: async (anomalyId: string, data: Partial<Anomaly>) => {
    set({ loading: true, error: null });
    try {
      const anomaly = await apiFetch<Anomaly>(`/anomalies/${anomalyId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      set(state => ({
        anomalies: state.anomalies.map(a => a.id === anomalyId ? anomaly : a),
        loading: false,
      }));
      return anomaly;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },

  simulateWeatherChange: async () => {
    set({ loading: true, error: null });
    try {
      const weather = await apiFetch<Weather>('/weather/simulate', {
        method: 'POST',
      });
      set({ weather, loading: false });
      return weather;
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
      return null;
    }
  },
}));

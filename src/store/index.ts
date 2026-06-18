import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Device, Measurement, Settings, Alert } from '../types';
import { mockDevice, mockMeasurements, mockSettings } from '../mock/data';
import { generateAlerts, checkMeasurementAbnormal } from '../services/alertService';
import { getRecentMeasurements } from '../lib/utils';

interface AppState {
  device: Device | null;
  measurements: Measurement[];
  settings: Settings;
  alerts: Alert[];
  setDevice: (device: Device) => void;
  updateDevice: (updates: Partial<Device>) => void;
  addMeasurement: (measurement: Omit<Measurement, 'id' | 'isAbnormal' | 'abnormalReason' | 'createdAt'>) => void;
  deleteMeasurement: (id: string) => void;
  updateSettings: (updates: Partial<Settings>) => void;
  dismissAlert: (id: string) => void;
  refreshAlerts: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      device: mockDevice,
      measurements: mockMeasurements,
      settings: mockSettings,
      alerts: [],

      setDevice: (device) => {
        const updatedDevice = { ...device, updatedAt: new Date().toISOString() };
        set({ device: updatedDevice });
        get().refreshAlerts();
      },

      updateDevice: (updates) => {
        const { device } = get();
        if (device) {
          const updatedDevice = { 
            ...device, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
          set({ device: updatedDevice });
          get().refreshAlerts();
        }
      },

      addMeasurement: (measurementData) => {
        const { settings, measurements } = get();
        
        const recent3 = getRecentMeasurements(measurements, 3);
        
        const { isAbnormal, abnormalReason } = checkMeasurementAbnormal(
          measurementData.systolic,
          measurementData.diastolic,
          measurementData.heartRate,
          settings,
          recent3
        );

        const newMeasurement: Measurement = {
          ...measurementData,
          id: `meas-${Date.now()}`,
          isAbnormal,
          abnormalReason,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          measurements: [newMeasurement, ...state.measurements],
        }));

        get().refreshAlerts();
      },

      deleteMeasurement: (id) => {
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
        }));
        get().refreshAlerts();
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
        get().refreshAlerts();
      },

      dismissAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }));
      },

      refreshAlerts: () => {
        const { device, measurements, settings } = get();
        if (device) {
          const alerts = generateAlerts(device, measurements, settings);
          set({ alerts });
        }
      },
    }),
    {
      name: 'bp-monitor-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.refreshAlerts();
        }
      },
    }
  )
);

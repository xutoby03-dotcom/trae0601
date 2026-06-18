import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';
import type {
  Device,
  ReplacementRecord,
  FilterBatch,
  Alert,
  CleanRecord,
  SeasonalSetting,
  AlertThresholds,
  SeasonType,
} from '../types';
import {
  mockDevices,
  mockBatches,
  mockSeasonal,
  mockThresholds,
  mockReplacements,
  mockCleanRecords,
} from '../data/mock';

const TODAY = '2026-06-19';

interface AppState {
  devices: Device[];
  replacements: ReplacementRecord[];
  batches: FilterBatch[];
  alerts: Alert[];
  cleanRecords: CleanRecord[];
  seasonalSettings: SeasonalSetting[];
  thresholds: AlertThresholds;

  getRemainingFilterDays: (deviceId: string) => number;
  getFilterPercent: (deviceId: string) => number;
  getTotalStockBySpec: (spec: string) => number;
  isInSeason: (type: SeasonType) => boolean;
  getConsumptionMultiplier: (deviceId: string) => number;

  addDevice: (d: Omit<Device, 'id'>) => void;
  updateDevice: (id: string, patch: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  markCleaned: (deviceId: string, operator: string, note?: string) => void;

  addReplacement: (
    deviceId: string,
    oldFilterDays: number,
    newFilterBatch: string,
    installer: string,
    note?: string,
  ) => boolean;

  addStockBatch: (b: Omit<FilterBatch, 'id'>) => void;
  deductStock: (spec: string, batchNo: string, qty: number) => boolean;

  resolveAlert: (id: string) => void;
  recomputeAlerts: () => void;

  updateSeasonalSettings: (settings: SeasonalSetting[]) => void;
  updateAlertThresholds: (t: Partial<AlertThresholds>) => void;
}

const genId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      devices: mockDevices,
      replacements: mockReplacements,
      batches: mockBatches,
      alerts: [],
      cleanRecords: mockCleanRecords,
      seasonalSettings: mockSeasonal,
      thresholds: mockThresholds,

      getRemainingFilterDays: (deviceId: string) => {
        const { devices, thresholds, seasonalSettings } = get();
        const device = devices.find((d) => d.id === deviceId);
        if (!device) return 0;

        const usedDays = dayjs(TODAY).diff(device.currentFilterStartDate, 'day');
        const expected = device.expectedFilterDays;

        let factor = 1.0;
        const currentMonth = dayjs(TODAY).month() + 1;
        seasonalSettings.forEach((s) => {
          if (!s.enabled) return;
          const inRange =
            s.startMonth <= s.endMonth
              ? currentMonth >= s.startMonth && currentMonth <= s.endMonth
              : currentMonth >= s.startMonth || currentMonth <= s.endMonth;
          if (inRange) factor *= s.consumptionFactor;
        });
        if (device.pm25 > thresholds.pm25AccelerateThreshold) factor *= 1.4;
        if (device.odorLevel >= thresholds.odorAccelerateLevel) factor *= 1.3;
        factor = Math.min(factor, 2.5);

        const effectiveUsed = usedDays * factor;
        return Math.max(0, Math.round(expected - effectiveUsed));
      },

      getFilterPercent: (deviceId: string) => {
        const { devices, getRemainingFilterDays } = get();
        const device = devices.find((d) => d.id === deviceId);
        if (!device) return 0;
        const remaining = getRemainingFilterDays(deviceId);
        return Math.max(0, Math.min(100, Math.round((remaining / device.expectedFilterDays) * 100)));
      },

      getTotalStockBySpec: (spec: string) => {
        return get()
          .batches.filter((b) => b.spec === spec)
          .reduce((sum, b) => sum + b.quantity, 0);
      },

      isInSeason: (type: SeasonType) => {
        const setting = get().seasonalSettings.find((s) => s.type === type);
        if (!setting || !setting.enabled) return false;
        const currentMonth = dayjs(TODAY).month() + 1;
        return setting.startMonth <= setting.endMonth
          ? currentMonth >= setting.startMonth && currentMonth <= setting.endMonth
          : currentMonth >= setting.startMonth || currentMonth <= setting.endMonth;
      },

      getConsumptionMultiplier: (deviceId: string) => {
        const { devices, thresholds, seasonalSettings } = get();
        const device = devices.find((d) => d.id === deviceId);
        if (!device) return 1;
        let factor = 1.0;
        const currentMonth = dayjs(TODAY).month() + 1;
        seasonalSettings.forEach((s) => {
          if (!s.enabled) return;
          const inRange =
            s.startMonth <= s.endMonth
              ? currentMonth >= s.startMonth && currentMonth <= s.endMonth
              : currentMonth >= s.startMonth || currentMonth <= s.endMonth;
          if (inRange) factor *= s.consumptionFactor;
        });
        if (device.pm25 > thresholds.pm25AccelerateThreshold) factor *= 1.4;
        if (device.odorLevel >= thresholds.odorAccelerateLevel) factor *= 1.3;
        return Math.min(factor, 2.5);
      },

      addDevice: (d) => {
        set((s) => ({ devices: [...s.devices, { ...d, id: genId('dev') }] }));
        setTimeout(() => get().recomputeAlerts(), 0);
      },

      updateDevice: (id, patch) => {
        set((s) => ({
          devices: s.devices.map((d) => (d.id === id ? { ...d, ...patch } : d)),
        }));
        setTimeout(() => get().recomputeAlerts(), 0);
      },

      deleteDevice: (id) => {
        set((s) => ({
          devices: s.devices.filter((d) => d.id !== id),
          replacements: s.replacements.filter((r) => r.deviceId !== id),
          cleanRecords: s.cleanRecords.filter((c) => c.deviceId !== id),
          alerts: s.alerts.filter((a) => a.deviceId !== id),
        }));
        setTimeout(() => get().recomputeAlerts(), 0);
      },

      markCleaned: (deviceId, operator, note) => {
        const record: CleanRecord = {
          id: genId('cln'),
          deviceId,
          date: TODAY,
          operator,
          note,
        };
        set((s) => ({
          cleanRecords: [record, ...s.cleanRecords],
          devices: s.devices.map((d) => (d.id === deviceId ? { ...d, lastCleanDate: TODAY } : d)),
        }));
        setTimeout(() => get().recomputeAlerts(), 0);
      },

      addReplacement: (deviceId, oldFilterDays, newFilterBatch, installer, note) => {
        const { devices, batches } = get();
        const device = devices.find((d) => d.id === deviceId);
        if (!device) return false;

        const batch = batches.find((b) => b.batchNo === newFilterBatch);
        if (!batch || batch.quantity < 1) return false;

        set((s) => ({
          batches: s.batches.map((b) =>
            b.batchNo === newFilterBatch ? { ...b, quantity: b.quantity - 1 } : b,
          ),
          devices: s.devices.map((d) =>
            d.id === deviceId ? { ...d, currentFilterStartDate: TODAY } : d,
          ),
        }));

        const remaining = get().getTotalStockBySpec(device.filterSpec);
        const record: ReplacementRecord = {
          id: genId('rep'),
          deviceId,
          deviceName: `${device.room}-${device.model}`,
          oldFilterDays,
          newFilterBatch,
          newFilterSpec: device.filterSpec,
          installer,
          remainingStock: remaining,
          date: TODAY,
          note,
        };
        set((s) => ({ replacements: [record, ...s.replacements] }));
        setTimeout(() => get().recomputeAlerts(), 0);
        return true;
      },

      addStockBatch: (b) => {
        set((s) => ({ batches: [...s.batches, { ...b, id: genId('bat') }] }));
        setTimeout(() => get().recomputeAlerts(), 0);
      },

      deductStock: (spec, batchNo, qty) => {
        const batch = get().batches.find((b) => b.batchNo === batchNo && b.spec === spec);
        if (!batch || batch.quantity < qty) return false;
        set((s) => ({
          batches: s.batches.map((b) =>
            b.batchNo === batchNo && b.spec === spec ? { ...b, quantity: b.quantity - qty } : b,
          ),
        }));
        setTimeout(() => get().recomputeAlerts(), 0);
        return true;
      },

      resolveAlert: (id) => {
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)) }));
      },

      recomputeAlerts: () => {
        const { devices, thresholds, getRemainingFilterDays, getTotalStockBySpec } = get();
        const newAlerts: Alert[] = [];

        const specSet = new Set(devices.map((d) => d.filterSpec));

        devices.forEach((device) => {
          const remaining = getRemainingFilterDays(device.id);
          if (remaining <= thresholds.filterExpiringDays) {
            newAlerts.push({
              id: genId('alt'),
              type: 'filter_expiring',
              level: remaining <= 7 ? 'danger' : 'warning',
              deviceId: device.id,
              message: `「${device.room}」滤芯剩余 ${remaining} 天，${
                remaining <= 7 ? '需尽快更换' : '建议备货'
              }`,
              triggeredAt: TODAY,
              resolved: false,
            });
          }

          const daysSinceClean = dayjs(TODAY).diff(device.lastCleanDate, 'day');
          if (daysSinceClean > thresholds.cleanReminderDays) {
            newAlerts.push({
              id: genId('alt'),
              type: 'clean_needed',
              level: 'warning',
              deviceId: device.id,
              message: `「${device.room}」已 ${daysSinceClean} 天未清灰，建议及时维护`,
              triggeredAt: TODAY,
              resolved: false,
            });
          }
        });

        specSet.forEach((spec) => {
          const total = getTotalStockBySpec(spec);
          if (total < thresholds.safeStockPerSpec) {
            newAlerts.push({
              id: genId('alt'),
              type: 'stock_low',
              level: total === 0 ? 'danger' : 'warning',
              filterSpec: spec,
              message: `滤芯「${spec}」库存 ${total} 件，${total === 0 ? '已断货请立即采购' : '低于安全库存'}`,
              triggeredAt: TODAY,
              resolved: false,
            });
          }
        });

        set({ alerts: newAlerts });
      },

      updateSeasonalSettings: (settings) => {
        set({ seasonalSettings: settings });
        setTimeout(() => get().recomputeAlerts(), 0);
      },

      updateAlertThresholds: (t) => {
        set((s) => ({ thresholds: { ...s.thresholds, ...t } }));
        setTimeout(() => get().recomputeAlerts(), 0);
      },
    }),
    {
      name: 'air-filter-mgmt-store',
      partialize: (s) => ({
        devices: s.devices,
        replacements: s.replacements,
        batches: s.batches,
        cleanRecords: s.cleanRecords,
        seasonalSettings: s.seasonalSettings,
        thresholds: s.thresholds,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => state.recomputeAlerts(), 50);
        }
      },
    },
  ),
);

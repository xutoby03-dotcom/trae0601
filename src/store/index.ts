import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Device, ReplacementRecord, Inventory, Reminder, MonthlyCost, PurchaseSuggestion } from '../types';
import { generateId, calculateRemainingDays, getUrgencyLevel, calculateExpectedExpireDate, getMonthsOfYear, formatDate } from '../utils/dateUtils';
import { parseISO, getMonth, isSameMonth, addDays } from 'date-fns';

interface FilterStore {
  devices: Device[];
  records: ReplacementRecord[];
  inventory: Inventory[];
  
  addDevice: (device: Omit<Device, 'id' | 'createdAt'>) => void;
  updateDevice: (id: string, device: Partial<Device>) => void;
  deleteDevice: (id: string) => void;
  getDeviceById: (id: string) => Device | undefined;
  
  addRecord: (record: Omit<ReplacementRecord, 'id' | 'createdAt' | 'expectedExpireDate' | 'remainingInventory'>) => { success: boolean; message?: string };
  deleteRecord: (id: string) => void;
  getRecordsByDeviceId: (deviceId: string) => ReplacementRecord[];
  getLatestRecordByDeviceId: (deviceId: string) => ReplacementRecord | undefined;
  
  addInventory: (item: Omit<Inventory, 'id' | 'lastUpdated'>) => void;
  updateInventory: (id: string, updates: Partial<Inventory>) => void;
  deleteInventory: (id: string) => void;
  adjustInventory: (filterModel: string, delta: number) => boolean;
  getInventoryByModel: (filterModel: string) => Inventory | undefined;
  
  getReminders: () => Reminder[];
  getRemindersByUrgency: () => { urgent: Reminder[]; warning: Reminder[]; normal: Reminder[] };
  getMonthlyCosts: () => MonthlyCost[];
  getYearlyTotalCost: () => number;
  getPurchaseSuggestions: () => PurchaseSuggestion[];
  getRemainingDaysByDevice: () => { deviceId: string; location: string; filterModel: string; remainingDays: number }[];
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set, get) => ({
      devices: [],
      records: [],
      inventory: [],

      addDevice: (device) => {
        const newDevice: Device = {
          ...device,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ devices: [...state.devices, newDevice] }));
      },

      updateDevice: (id, device) => {
        set((state) => ({
          devices: state.devices.map((d) => (d.id === id ? { ...d, ...device } : d)),
        }));
      },

      deleteDevice: (id) => {
        set((state) => ({
          devices: state.devices.filter((d) => d.id !== id),
          records: state.records.filter((r) => r.deviceId !== id),
        }));
      },

      getDeviceById: (id) => {
        return get().devices.find((d) => d.id === id);
      },

      addRecord: (record) => {
        const device = get().getDeviceById(record.deviceId);
        if (!device) {
          return { success: false, message: '设备不存在' };
        }

        const inventoryItem = get().getInventoryByModel(device.filterModel);
        if (!inventoryItem || inventoryItem.quantity <= 0) {
          return { success: false, message: `滤芯 ${device.filterModel} 库存不足，无法记录更换` };
        }

        const adjusted = get().adjustInventory(device.filterModel, -1);
        if (!adjusted) {
          return { success: false, message: '库存扣减失败' };
        }

        const remainingInventory = inventoryItem.quantity - 1;
        const expectedExpireDate = calculateExpectedExpireDate(record.installDate, device.suggestCycleDays);
        const newRecord: ReplacementRecord = {
          ...record,
          expectedExpireDate,
          remainingInventory,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ records: [...state.records, newRecord] }));
        return { success: true };
      },

      deleteRecord: (id) => {
        const record = get().records.find((r) => r.id === id);
        if (record) {
          const device = get().getDeviceById(record.deviceId);
          if (device) {
            get().adjustInventory(device.filterModel, 1);
          }
        }
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
      },

      getRecordsByDeviceId: (deviceId) => {
        return get().records.filter((r) => r.deviceId === deviceId).sort((a, b) => 
          new Date(b.installDate).getTime() - new Date(a.installDate).getTime()
        );
      },

      getLatestRecordByDeviceId: (deviceId) => {
        const records = get().getRecordsByDeviceId(deviceId);
        return records.length > 0 ? records[0] : undefined;
      },

      addInventory: (item) => {
        const existing = get().inventory.find((i) => i.filterModel === item.filterModel);
        if (existing) {
          get().updateInventory(existing.id, {
            quantity: existing.quantity + item.quantity,
            unitPrice: item.unitPrice,
          });
        } else {
          const newItem: Inventory = {
            ...item,
            id: generateId(),
            lastUpdated: new Date().toISOString(),
          };
          set((state) => ({ inventory: [...state.inventory, newItem] }));
        }
      },

      updateInventory: (id, updates) => {
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.id === id ? { ...i, ...updates, lastUpdated: new Date().toISOString() } : i
          ),
        }));
      },

      deleteInventory: (id) => {
        set((state) => ({ inventory: state.inventory.filter((i) => i.id !== id) }));
      },

      adjustInventory: (filterModel, delta) => {
        const item = get().inventory.find((i) => i.filterModel === filterModel);
        if (!item) return false;
        const newQuantity = item.quantity + delta;
        if (newQuantity < 0) return false;
        
        set((state) => ({
          inventory: state.inventory.map((i) =>
            i.filterModel === filterModel
              ? { ...i, quantity: newQuantity, lastUpdated: new Date().toISOString() }
              : i
          ),
        }));
        return true;
      },

      getInventoryByModel: (filterModel) => {
        return get().inventory.find((i) => i.filterModel === filterModel);
      },

      getReminders: () => {
        const { devices, getLatestRecordByDeviceId } = get();
        const reminders: Reminder[] = [];

        for (const device of devices) {
          const latestRecord = getLatestRecordByDeviceId(device.id);
          if (!latestRecord) continue;

          const remainingDays = calculateRemainingDays(latestRecord.expectedExpireDate);
          const urgency = getUrgencyLevel(remainingDays);

          reminders.push({
            deviceId: device.id,
            device,
            filterModel: device.filterModel,
            location: device.location,
            remainingDays,
            expectedExpireDate: latestRecord.expectedExpireDate,
            urgency,
          });
        }

        return reminders.sort((a, b) => a.remainingDays - b.remainingDays);
      },

      getRemindersByUrgency: () => {
        const reminders = get().getReminders();
        return {
          urgent: reminders.filter((r) => r.urgency === 'urgent'),
          warning: reminders.filter((r) => r.urgency === 'warning'),
          normal: reminders.filter((r) => r.urgency === 'normal'),
        };
      },

      getMonthlyCosts: () => {
        const { records } = get();
        const months = getMonthsOfYear();
        const currentYear = new Date().getFullYear();

        return months.map((month) => {
          const monthRecords = records.filter((r) => {
            const recordDate = parseISO(r.installDate);
            return recordDate.getFullYear() === currentYear && isSameMonth(recordDate, month);
          });
          const total = monthRecords.reduce((sum, r) => sum + r.cost, 0);
          return {
            month: formatDate(month, 'MM月'),
            cost: total,
          };
        });
      },

      getYearlyTotalCost: () => {
        const { records } = get();
        const currentYear = new Date().getFullYear();
        return records
          .filter((r) => parseISO(r.installDate).getFullYear() === currentYear)
          .reduce((sum, r) => sum + r.cost, 0);
      },

      getPurchaseSuggestions: () => {
        const { devices, inventory, getLatestRecordByDeviceId } = get();
        const suggestions: PurchaseSuggestion[] = [];
        const modelUsageMap = new Map<string, { count: number; totalDays: number }>();

        for (const device of devices) {
          const usage = modelUsageMap.get(device.filterModel) || { count: 0, totalDays: 0 };
          usage.count += 1;
          usage.totalDays += device.suggestCycleDays;
          modelUsageMap.set(device.filterModel, usage);
        }

        for (const [filterModel, usage] of modelUsageMap.entries()) {
          const inv = inventory.find((i) => i.filterModel === filterModel);
          const currentStock = inv?.quantity || 0;
          const avgCycleDays = Math.round(usage.totalDays / usage.count);
          const estimatedDaysLeft = currentStock * avgCycleDays;

          let reason = '';
          if (currentStock === 0) {
            reason = '库存已耗尽，急需采购';
          } else if (estimatedDaysLeft < 30) {
            reason = `按当前用量，预计仅能使用 ${estimatedDaysLeft} 天`;
          } else if (currentStock <= 1) {
            reason = '库存仅剩1件，建议提前采购';
          } else {
            continue;
          }

          const suggestedPurchaseDate = formatDate(
            addDays(new Date(), Math.max(0, estimatedDaysLeft - 15)),
            'yyyy-MM-dd'
          );

          suggestions.push({
            filterModel,
            currentStock,
            estimatedDaysLeft,
            suggestedPurchaseDate,
            reason,
          });
        }

        return suggestions.sort((a, b) => a.estimatedDaysLeft - b.estimatedDaysLeft);
      },

      getRemainingDaysByDevice: () => {
        const { devices, getLatestRecordByDeviceId } = get();
        return devices.map((device) => {
          const latestRecord = getLatestRecordByDeviceId(device.id);
          const remainingDays = latestRecord
            ? calculateRemainingDays(latestRecord.expectedExpireDate)
            : device.suggestCycleDays;
          return {
            deviceId: device.id,
            location: device.location,
            filterModel: device.filterModel,
            remainingDays,
          };
        }).sort((a, b) => a.remainingDays - b.remainingDays);
      },
    }),
    {
      name: 'filter-management-storage',
    }
  )
);

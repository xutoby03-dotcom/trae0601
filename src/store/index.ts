import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type MeetingRoom,
  type InspectionRecord,
  type SupplyItem,
  type PurchaseSuggestion,
  type DepartmentStat,
  type ConsumptionStat,
  type ColorStock,
} from '@/types';
import { generateMockMeetingRooms, generateMockInspectionRecords, generateMockSupplyItems } from '@/data/mockData';
import { generateId, checkStockLevel, createColorStocks, calculateConsecutiveShortage } from '@/utils';

interface AppState {
  meetingRooms: MeetingRoom[];
  inspectionRecords: InspectionRecord[];
  supplyItems: SupplyItem[];
  isInitialized: boolean;

  initializeData: () => void;

  addMeetingRoom: (room: Omit<MeetingRoom, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMeetingRoom: (id: string, room: Partial<MeetingRoom>) => void;
  deleteMeetingRoom: (id: string) => void;

  addInspectionRecord: (record: Omit<InspectionRecord, 'id' | 'createdAt' | 'needReplenish'>) => void;

  updateSupplyItemStatus: (id: string, status: SupplyItem['status']) => void;
  batchUpdateSupplyItems: (ids: string[], status: SupplyItem['status']) => void;

  getDashboardStats: () => {
    totalRooms: number;
    pendingSupply: number;
    todayInspections: number;
    shortageAlerts: number;
    inspectionCompletionRate: number;
  };

  getConsumptionStats: () => ConsumptionStat[];
  getDepartmentStats: () => DepartmentStat[];
  getPurchaseSuggestions: () => PurchaseSuggestion[];
  getRoomById: (id: string) => MeetingRoom | undefined;
  getRecordsByRoomId: (roomId: string) => InspectionRecord[];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      meetingRooms: [],
      inspectionRecords: [],
      supplyItems: [],
      isInitialized: false,

      initializeData: () => {
        const state = get();
        if (state.isInitialized) return;

        const rooms = generateMockMeetingRooms();
        const records = generateMockInspectionRecords(rooms);
        const supplyItems = generateMockSupplyItems(rooms, records);

        const recordsWithConsecutive = records.map((record) => ({
          ...record,
          colorStocks: record.colorStocks.map((cs) => ({
            ...cs,
            consecutiveShortage: calculateConsecutiveShortage(record.roomId, cs.color, records),
          })),
        }));

        set({
          meetingRooms: rooms,
          inspectionRecords: recordsWithConsecutive,
          supplyItems,
          isInitialized: true,
        });
      },

      addMeetingRoom: (room) => {
        const now = new Date().toISOString();
        const newRoom: MeetingRoom = {
          ...room,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          meetingRooms: [...state.meetingRooms, newRoom],
        }));
      },

      updateMeetingRoom: (id, room) => {
        const now = new Date().toISOString();
        set((state) => ({
          meetingRooms: state.meetingRooms.map((r) =>
            r.id === id ? { ...r, ...room, updatedAt: now } : r
          ),
        }));
      },

      deleteMeetingRoom: (id) => {
        set((state) => ({
          meetingRooms: state.meetingRooms.filter((r) => r.id !== id),
          inspectionRecords: state.inspectionRecords.filter((r) => r.roomId !== id),
          supplyItems: state.supplyItems.filter((s) => s.roomId !== id),
        }));
      },

      addInspectionRecord: (record) => {
        const state = get();
        const room = state.meetingRooms.find((r) => r.id === record.roomId);
        if (!room) return;

        const now = new Date();

        const colorCounts: Record<string, number> = {};
        record.colorStocks.forEach((cs) => {
          colorCounts[cs.color] = cs.count;
        });
        let colorStocks = createColorStocks(room, colorCounts);

        colorStocks = colorStocks.map((cs) => ({
          ...cs,
          consecutiveShortage: calculateConsecutiveShortage(record.roomId, cs.color, state.inspectionRecords) + (cs.belowMin ? 1 : 0),
        }));

        const eraserBelowMin = checkStockLevel(record.eraserCount, room.minStock);
        const sprayBelowMin = checkStockLevel(record.sprayCount, Math.ceil(room.minStock / 2));
        const magnetBelowMin = checkStockLevel(record.magnetCount, room.minStock * 2);

        const needReplenish =
          colorStocks.some((cs) => cs.belowMin) ||
          eraserBelowMin ||
          sprayBelowMin ||
          magnetBelowMin;

        const newRecord: InspectionRecord = {
          ...record,
          id: generateId(),
          colorStocks,
          eraserBelowMin,
          sprayBelowMin,
          magnetBelowMin,
          needReplenish,
          createdAt: now.toISOString(),
        };

        const newSupplyItems: SupplyItem[] = [];

        for (const cs of colorStocks) {
          if (cs.belowMin) {
            newSupplyItems.push({
              id: generateId(),
              roomId: room.id,
              roomName: room.name,
              itemType: 'marker',
              color: cs.color,
              colorName: cs.colorName,
              requiredQuantity: room.minStock - cs.count + 2,
              consecutiveShortage: cs.consecutiveShortage,
              status: 'pending',
              createdAt: now.toISOString(),
            });
          }
        }

        if (eraserBelowMin) {
          newSupplyItems.push({
            id: generateId(),
            roomId: room.id,
            roomName: room.name,
            itemType: 'eraser',
            requiredQuantity: room.minStock - record.eraserCount + 1,
            consecutiveShortage: 1,
            status: 'pending',
            createdAt: now.toISOString(),
          });
        }

        if (sprayBelowMin) {
          newSupplyItems.push({
            id: generateId(),
            roomId: room.id,
            roomName: room.name,
            itemType: 'spray',
            requiredQuantity: Math.ceil(room.minStock / 2) - record.sprayCount + 1,
            consecutiveShortage: 1,
            status: 'pending',
            createdAt: now.toISOString(),
          });
        }

        if (magnetBelowMin) {
          newSupplyItems.push({
            id: generateId(),
            roomId: room.id,
            roomName: room.name,
            itemType: 'magnet',
            requiredQuantity: room.minStock * 2 - record.magnetCount + 4,
            consecutiveShortage: 1,
            status: 'pending',
            createdAt: now.toISOString(),
          });
        }

        set((state) => ({
          inspectionRecords: [newRecord, ...state.inspectionRecords],
          supplyItems: [...newSupplyItems, ...state.supplyItems],
        }));
      },

      updateSupplyItemStatus: (id, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          supplyItems: state.supplyItems.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  completedAt: status === 'completed' ? now : item.completedAt,
                }
              : item
          ),
        }));
      },

      batchUpdateSupplyItems: (ids, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          supplyItems: state.supplyItems.map((item) =>
            ids.includes(item.id)
              ? {
                  ...item,
                  status,
                  completedAt: status === 'completed' ? now : item.completedAt,
                }
              : item
          ),
        }));
      },

      getDashboardStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        const todayInspections = state.inspectionRecords.filter(
          (r) => r.inspectionDate === today
        ).length;
        const pendingSupply = state.supplyItems.filter((s) => s.status === 'pending').length;
        const shortageAlerts = state.supplyItems.filter(
          (s) => s.status === 'pending' && s.consecutiveShortage >= 2
        ).length;

        const totalRooms = state.meetingRooms.length;
        const roomsInspectedToday = new Set(
          state.inspectionRecords
            .filter((r) => r.inspectionDate === today)
            .map((r) => r.roomId)
        ).size;
        const inspectionCompletionRate = totalRooms > 0
          ? Math.round((roomsInspectedToday / totalRooms) * 100)
          : 0;

        return {
          totalRooms,
          pendingSupply,
          todayInspections,
          shortageAlerts,
          inspectionCompletionRate,
        };
      },

      getConsumptionStats: (): ConsumptionStat[] => {
        const state = get();
        const stats: ConsumptionStat[] = [];

        for (const room of state.meetingRooms) {
          const roomRecords = state.inspectionRecords.filter((r) => r.roomId === room.id);
          const totalInspections = roomRecords.length;

          let totalShortages = 0;
          for (const record of roomRecords) {
            const colorShortages = record.colorStocks.filter((cs) => cs.belowMin).length;
            const otherShortages = [
              record.eraserBelowMin,
              record.sprayBelowMin,
              record.magnetBelowMin,
            ].filter(Boolean).length;
            totalShortages += colorShortages + otherShortages;
          }

          const shortageRate = totalInspections > 0
            ? Math.round((totalShortages / (totalInspections * (room.defaultColors.length + 3))) * 100)
            : 0;

          const sortedRecords = [...roomRecords].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );

          let averageConsumptionPerWeek = 0;
          if (sortedRecords.length >= 2) {
            const firstDate = new Date(sortedRecords[0].createdAt);
            const lastDate = new Date(sortedRecords[sortedRecords.length - 1].createdAt);
            const weeksDiff = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7)));
            averageConsumptionPerWeek = Math.round(totalShortages / weeksDiff);
          }

          stats.push({
            roomId: room.id,
            roomName: room.name,
            totalInspections,
            totalShortages,
            shortageRate,
            averageConsumptionPerWeek,
          });
        }

        return stats.sort((a, b) => b.averageConsumptionPerWeek - a.averageConsumptionPerWeek);
      },

      getDepartmentStats: (): DepartmentStat[] => {
        const state = get();
        const deptMap = new Map<string, { bookingCount: number; shortageCount: number; itemCounts: Record<string, number> }>();

        for (const record of state.inspectionRecords) {
          const dept = record.bookingDepartment;
          if (!deptMap.has(dept)) {
            deptMap.set(dept, { bookingCount: 0, shortageCount: 0, itemCounts: {} });
          }
          const deptData = deptMap.get(dept)!;
          deptData.bookingCount++;

          if (record.needReplenish) {
            deptData.shortageCount++;

            for (const cs of record.colorStocks) {
              if (cs.belowMin) {
                const key = `${cs.colorName}白板笔`;
                deptData.itemCounts[key] = (deptData.itemCounts[key] || 0) + 1;
              }
            }
            if (record.eraserBelowMin) {
              deptData.itemCounts['橡皮'] = (deptData.itemCounts['橡皮'] || 0) + 1;
            }
            if (record.sprayBelowMin) {
              deptData.itemCounts['清洁喷雾'] = (deptData.itemCounts['清洁喷雾'] || 0) + 1;
            }
            if (record.magnetBelowMin) {
              deptData.itemCounts['磁贴'] = (deptData.itemCounts['磁贴'] || 0) + 1;
            }
          }
        }

        const result: DepartmentStat[] = [];
        for (const [department, data] of deptMap) {
          const mostMissingItem = Object.entries(data.itemCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || '-';

          result.push({
            department,
            bookingCount: data.bookingCount,
            shortageCount: data.shortageCount,
            shortageRate: Math.round((data.shortageCount / data.bookingCount) * 100),
            mostMissingItem,
          });
        }

        return result.sort((a, b) => b.shortageRate - a.shortageRate);
      },

      getPurchaseSuggestions: (): PurchaseSuggestion[] => {
        const state = get();
        const pendingItems = state.supplyItems.filter((s) => s.status !== 'completed');
        const consumptionStats = state.getConsumptionStats();

        const suggestionMap = new Map<string, PurchaseSuggestion>();

        for (const item of pendingItems) {
          let key = item.itemType;
          if (item.color) {
            key += `-${item.color}`;
          }

          if (!suggestionMap.has(key)) {
            suggestionMap.set(key, {
              itemType: item.itemType,
              color: item.color,
              colorName: item.colorName,
              totalRequired: 0,
              bufferStock: 0,
              suggestedPurchase: 0,
              roomsNeeding: [],
            });
          }

          const suggestion = suggestionMap.get(key)!;
          suggestion.totalRequired += item.requiredQuantity;

          if (!suggestion.roomsNeeding.includes(item.roomName)) {
            suggestion.roomsNeeding.push(item.roomName);
          }
        }

        const bufferWeeks = 2;
        for (const suggestion of suggestionMap.values()) {
          let weeklyConsumption = 0;

          for (const stat of consumptionStats) {
            if (suggestion.roomsNeeding.includes(stat.roomName)) {
              weeklyConsumption += stat.averageConsumptionPerWeek;
            }
          }

          suggestion.bufferStock = Math.max(weeklyConsumption * bufferWeeks, 5);
          suggestion.suggestedPurchase = suggestion.totalRequired + suggestion.bufferStock;
        }

        return Array.from(suggestionMap.values()).sort((a, b) => b.suggestedPurchase - a.suggestedPurchase);
      },

      getRoomById: (id) => {
        return get().meetingRooms.find((r) => r.id === id);
      },

      getRecordsByRoomId: (roomId) => {
        return get().inspectionRecords.filter((r) => r.roomId === roomId);
      },
    }),
    {
      name: 'whiteboard-supply-store',
    }
  )
);

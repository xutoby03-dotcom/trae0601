import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PickupRecord, PickupStatus, MealType, WeeklyStats, AllergyType } from '@/types';
import { ALLERGY_META } from '@/types';
import { generatePickupRecords } from '@/utils/mockData';
import { todayStr, getWeekRange, getWeekDates, formatDate } from '@/utils/dateUtils';

interface PickupStore {
  pickupRecords: PickupRecord[];
  scanQrCode: (qrData: string, pickedBy: 'student' | 'teacher', pickedByName: string) => { success: boolean; message: string; record?: PickupRecord };
  manualPickup: (studentId: string, prepItemId: string, mealType: MealType, pickedBy: 'student' | 'teacher', pickedByName: string) => void;
  recordException: (studentId: string, prepItemId: string, mealType: MealType, status: 'not_picked' | 'wrong_pick' | 'leave', notes?: string) => void;
  getTodayRecords: () => PickupRecord[];
  getRecordsByDate: (date: string) => PickupRecord[];
  getRecordsByStudent: (studentId: string) => PickupRecord[];
  getWeeklyStats: () => WeeklyStats;
  getTodayStats: () => { total: number; picked: number; notPicked: number; wrongPick: number; leave: number };
}

export const usePickupStore = create<PickupStore>()(
  persist(
    (set, get) => ({
      pickupRecords: generatePickupRecords(),

      scanQrCode: (qrData, pickedBy, pickedByName) => {
        const parts = qrData.split(':');
        if (parts.length < 3 || parts[0] !== 'ALLERGY-MEAL') {
          return { success: false, message: '无效的二维码' };
        }
        const prepItemId = parts[1];
        const studentId = parts[2];
        const existing = get().pickupRecords.find(
          (r) => r.prepItemId === prepItemId && r.date === todayStr()
        );
        if (existing && existing.status === 'picked') {
          return { success: false, message: '该餐品已被领取' };
        }
        const mealType: MealType = prepItemId.includes('breakfast') ? 'breakfast' : prepItemId.includes('lunch') ? 'lunch' : 'dinner';
        const record: PickupRecord = {
          id: `rec-${todayStr()}-${mealType}-${studentId}-${Date.now()}`,
          date: todayStr(),
          mealType,
          studentId,
          prepItemId,
          status: 'picked',
          pickedBy,
          pickedByName,
          pickedAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
        };
        set((state) => {
          const idx = state.pickupRecords.findIndex((r) => r.prepItemId === prepItemId && r.date === todayStr());
          if (idx >= 0) {
            const newRecords = [...state.pickupRecords];
            newRecords[idx] = record;
            return { pickupRecords: newRecords };
          }
          return { pickupRecords: [...state.pickupRecords, record] };
        });
        return { success: true, message: '领取成功', record };
      },

      manualPickup: (studentId, prepItemId, mealType, pickedBy, pickedByName) => {
        const record: PickupRecord = {
          id: `rec-${todayStr()}-${mealType}-${studentId}-${Date.now()}`,
          date: todayStr(),
          mealType,
          studentId,
          prepItemId,
          status: 'picked',
          pickedBy,
          pickedByName,
          pickedAt: formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
        };
        set((state) => {
          const idx = state.pickupRecords.findIndex((r) => r.prepItemId === prepItemId && r.date === todayStr());
          if (idx >= 0) {
            const newRecords = [...state.pickupRecords];
            newRecords[idx] = record;
            return { pickupRecords: newRecords };
          }
          return { pickupRecords: [...state.pickupRecords, record] };
        });
      },

      recordException: (studentId, prepItemId, mealType, status, notes) => {
        set((state) => {
          const existing = state.pickupRecords.find(
            (r) => r.prepItemId === prepItemId && r.date === todayStr()
          );
          if (existing) {
            return {
              pickupRecords: state.pickupRecords.map((r) =>
                r.prepItemId === prepItemId && r.date === todayStr()
                  ? { ...r, status, notes }
                  : r
              ),
            };
          }
          return {
            pickupRecords: [
              ...state.pickupRecords,
              {
                id: `rec-${todayStr()}-${mealType}-${studentId}-${Date.now()}`,
                date: todayStr(),
                mealType,
                studentId,
                prepItemId,
                status,
                notes,
              },
            ],
          };
        });
      },

      getTodayRecords: () => get().getRecordsByDate(todayStr()),

      getRecordsByDate: (date) => get().pickupRecords.filter((r) => r.date === date),

      getRecordsByStudent: (studentId) =>
        get().pickupRecords.filter((r) => r.studentId === studentId),

      getWeeklyStats: () => {
        const { start, end } = getWeekRange();
        const weekDates = getWeekDates().map((d) => formatDate(d));
        const records = get().pickupRecords.filter(
          (r) => r.date >= start && r.date <= end
        );

        const dailyData = weekDates.map((date) => ({
          date,
          replacements: records.filter((r) => r.date === date).length,
          notPicked: records.filter((r) => r.date === date && r.status === 'not_picked').length,
        }));

        const allergyCounts: Record<string, number> = {};
        const notPickedMap: Record<string, { studentId: string; studentName: string; className: string; count: number }> = {};

        records.forEach((r) => {
          if (r.status === 'not_picked') {
            const key = r.studentId;
            if (!notPickedMap[key]) {
              notPickedMap[key] = {
                studentId: r.studentId,
                studentName: r.studentId,
                className: '待查',
                count: 0,
              };
            }
            notPickedMap[key].count++;
          }
        });

        const mockAllergies: AllergyType[] = ['nuts', 'dairy', 'seafood', 'eggs', 'wheat', 'soy', 'other'];
        mockAllergies.forEach((a, idx) => {
          allergyCounts[a] = Math.floor(records.length / 7) + idx;
        });

        const allergyRanking = Object.entries(allergyCounts)
          .map(([type, count]) => ({
            type: type as AllergyType,
            name: ALLERGY_META[type as AllergyType].name,
            count,
          }))
          .sort((a, b) => b.count - a.count);

        return {
          weekStart: start,
          weekEnd: end,
          totalReplacements: records.length,
          notPickedCount: records.filter((r) => r.status === 'not_picked').length,
          wrongPickCount: records.filter((r) => r.status === 'wrong_pick').length,
          dailyData,
          allergyRanking,
          notPickedList: Object.values(notPickedMap).sort((a, b) => b.count - a.count),
        };
      },

      getTodayStats: () => {
        const records = get().getTodayRecords();
        return {
          total: records.length,
          picked: records.filter((r) => r.status === 'picked').length,
          notPicked: records.filter((r) => r.status === 'not_picked').length,
          wrongPick: records.filter((r) => r.status === 'wrong_pick').length,
          leave: records.filter((r) => r.status === 'leave').length,
        };
      },
    }),
    {
      name: 'allergy-pickup-store',
    }
  )
);

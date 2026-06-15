import { create } from 'zustand';
import type {
  Medicine,
  DosageSchedule,
  PackingSlot,
  PackingItem,
  MedicationRecord,
  TimeSlot,
  MedicationStatus,
} from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storageUtils';
import { formatDate, generateId, getWeekDates } from '@/utils/dateUtils';
import { mockMedicines, mockSchedules } from '@/utils/mockData';
import { assertPackingValid } from '@/utils/validationUtils';

interface AppState {
  medicines: Medicine[];
  schedules: DosageSchedule[];
  packingSlots: PackingSlot[];
  packingItems: PackingItem[];
  medicationRecords: MedicationRecord[];
  currentWeekDate: Date;

  _persist: () => void;
  initStore: () => void;

  addMedicine: (data: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicine: (id: string, data: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;

  addSchedule: (data: Omit<DosageSchedule, 'id'>) => void;
  updateSchedule: (id: string, data: Partial<DosageSchedule>) => void;
  deleteSchedule: (id: string) => void;

  generateWeekSlots: (weekDate: Date) => void;
  getSlot: (date: string, timeSlot: TimeSlot) => PackingSlot | undefined;
  getSlotItems: (slotId: string) => PackingItem[];
  savePacking: (
    date: string,
    timeSlot: TimeSlot,
    items: { medicineId: string; pillsCount: number }[],
    photoUrl?: string
  ) => void;

  setMedicationStatus: (
    slotId: string,
    status: MedicationStatus,
    notes?: string
  ) => void;
  getMedicationRecord: (slotId: string) => MedicationRecord | undefined;

  setCurrentWeek: (date: Date) => void;
  navigateWeek: (direction: number) => void;
}

const TIME_SLOTS: TimeSlot[] = ['morning', 'noon', 'evening', 'bedtime'];

export const useAppStore = create<AppState>((set, get) => ({
  medicines: [],
  schedules: [],
  packingSlots: [],
  packingItems: [],
  medicationRecords: [],
  currentWeekDate: new Date(),

  initStore: () => {
    const isFirstRun = loadFromStorage<boolean>('initialized', false);

    if (!isFirstRun) {
      set({
        medicines: mockMedicines,
        schedules: mockSchedules,
        packingSlots: [],
        packingItems: [],
        medicationRecords: [],
        currentWeekDate: new Date(),
      });
      saveToStorage('initialized', true);
      get().generateWeekSlots(new Date());
      get()._persist();
    } else {
      set({
        medicines: loadFromStorage<Medicine[]>('medicines', []),
        schedules: loadFromStorage<DosageSchedule[]>('schedules', []),
        packingSlots: loadFromStorage<PackingSlot[]>('packingSlots', []),
        packingItems: loadFromStorage<PackingItem[]>('packingItems', []),
        medicationRecords: loadFromStorage<MedicationRecord[]>('medicationRecords', []),
        currentWeekDate: new Date(),
      });
    }
  },

  _persist: () => {
    const s = get();
    saveToStorage('medicines', s.medicines);
    saveToStorage('schedules', s.schedules);
    saveToStorage('packingSlots', s.packingSlots);
    saveToStorage('packingItems', s.packingItems);
    saveToStorage('medicationRecords', s.medicationRecords);
  },

  addMedicine: (data) => {
    const now = new Date().toISOString();
    const newMedicine: Medicine = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    set((s) => ({ medicines: [...s.medicines, newMedicine] }));
    get()._persist();
  },

  updateMedicine: (id, data) => {
    set((s) => ({
      medicines: s.medicines.map((m) =>
        m.id === id ? { ...m, ...data, updatedAt: new Date().toISOString() } : m
      ),
    }));
    get()._persist();
  },

  deleteMedicine: (id) => {
    set((s) => ({
      medicines: s.medicines.filter((m) => m.id !== id),
      schedules: s.schedules.filter((sch) => sch.medicineId !== id),
    }));
    get()._persist();
  },

  addSchedule: (data) => {
    set((s) => ({ schedules: [...s.schedules, { ...data, id: generateId() }] }));
    get()._persist();
  },

  updateSchedule: (id, data) => {
    set((s) => ({
      schedules: s.schedules.map((sch) =>
        sch.id === id ? { ...sch, ...data } : sch
      ),
    }));
    get()._persist();
  },

  deleteSchedule: (id) => {
    set((s) => ({ schedules: s.schedules.filter((sch) => sch.id !== id) }));
    get()._persist();
  },

  generateWeekSlots: (weekDate) => {
    const dates = getWeekDates(weekDate);
    const existingSlots = get().packingSlots;
    const newSlots: PackingSlot[] = [];

    dates.forEach((d) => {
      const dateStr = formatDate(d);
      TIME_SLOTS.forEach((slot) => {
        const exists = existingSlots.some(
          (s) => s.date === dateStr && s.timeSlot === slot
        );
        if (!exists) {
          newSlots.push({
            id: `slot-${dateStr}-${slot}`,
            date: dateStr,
            timeSlot: slot,
            status: 'pending',
          });
        }
      });
    });

    if (newSlots.length > 0) {
      set((s) => ({ packingSlots: [...s.packingSlots, ...newSlots] }));
      get()._persist();
    }
  },

  getSlot: (date, timeSlot) => {
    return get().packingSlots.find(
      (s) => s.date === date && s.timeSlot === timeSlot
    );
  },

  getSlotItems: (slotId) => {
    return get().packingItems.filter((i) => i.slotId === slotId);
  },

  savePacking: (date, timeSlot, items, photoUrl) => {
    const slot = get().getSlot(date, timeSlot);
    if (!slot) return;

    const slotId = slot.id;
    const state = get();

    try {
      assertPackingValid({
        medicines: state.medicines,
        schedules: state.schedules,
        selectedItems: items,
        timeSlot,
        date,
        hasPhoto: !!(photoUrl || slot.photoUrl),
      });
    } catch (err: any) {
      console.error('[savePacking] 兜底校验拦截：', err?.message);
      alert(err?.message || '分装校验失败，已阻止保存，请检查后重试');
      return;
    }

    set((s) => {
      const oldItems = s.packingItems.filter((i) => i.slotId !== slotId);
      let medicines = [...s.medicines];
      const oldSlotItems = s.packingItems.filter((i) => i.slotId === slotId);

      oldSlotItems.forEach((item) => {
        medicines = medicines.map((m) =>
          m.id === item.medicineId
            ? { ...m, remainingPills: m.remainingPills + item.pillsCount }
            : m
        );
      });

      const newPackingItems: PackingItem[] = items
        .filter((i) => i.pillsCount > 0)
        .map((i) => ({
          id: generateId(),
          slotId,
          medicineId: i.medicineId,
          pillsCount: i.pillsCount,
          isVerified: true,
        }));

      newPackingItems.forEach((item) => {
        medicines = medicines.map((m) =>
          m.id === item.medicineId
            ? { ...m, remainingPills: m.remainingPills - item.pillsCount }
            : m
        );
      });

      const updatedSlot: PackingSlot = {
        ...slot,
        status: 'packed',
        photoUrl: photoUrl || slot.photoUrl,
        packedAt: new Date().toISOString(),
      };

      return {
        packingItems: [...oldItems, ...newPackingItems],
        medicines,
        packingSlots: s.packingSlots.map((s) =>
          s.id === slotId ? updatedSlot : s
        ),
      };
    });

    get()._persist();
  },

  setMedicationStatus: (slotId, status, notes) => {
    set((s) => {
      const existingIdx = s.medicationRecords.findIndex((r) => r.slotId === slotId);
      const record: MedicationRecord = {
        id: generateId(),
        slotId,
        status,
        recordedAt: new Date().toISOString(),
        notes,
      };

      let records: MedicationRecord[];
      if (existingIdx >= 0) {
        records = [...s.medicationRecords];
        records[existingIdx] = { ...records[existingIdx], ...record, id: records[existingIdx].id };
      } else {
        records = [...s.medicationRecords, record];
      }

      return {
        medicationRecords: records,
        packingSlots: s.packingSlots.map((sl) =>
          sl.id === slotId ? { ...sl, status: 'recorded' } : sl
        ),
      };
    });
    get()._persist();
  },

  getMedicationRecord: (slotId) => {
    return get().medicationRecords.find((r) => r.slotId === slotId);
  },

  setCurrentWeek: (date) => {
    set({ currentWeekDate: date });
    get().generateWeekSlots(date);
  },

  navigateWeek: (direction) => {
    const newDate = new Date(get().currentWeekDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    get().setCurrentWeek(newDate);
  },
}));

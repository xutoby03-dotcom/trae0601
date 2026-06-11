import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Trip, Person, Equipment, EquipmentStatus, EquipmentCategory } from '@/types';
import { AVATAR_COLORS } from '@/types';
import { generateId } from '@/utils/formatters';

interface StoreState {
  currentTripId: string | null;
  trips: Trip[];
  people: Person[];
  equipment: Equipment[];

  createTrip: (data: Omit<Trip, 'id' | 'createdAt'>) => string;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  setCurrentTrip: (id: string) => void;

  addPerson: (name: string) => void;
  removePerson: (id: string) => void;
  updatePerson: (id: string, data: Partial<Person>) => void;

  addEquipment: (data: Omit<Equipment, 'id' | 'tripId' | 'forgetCount' | 'status' | 'confirmedAtCamp'>) => void;
  updateEquipment: (id: string, data: Partial<Equipment>) => void;
  removeEquipment: (id: string) => void;
  setEquipmentStatus: (id: string, status: EquipmentStatus) => void;
  toggleConfirmedAtCamp: (id: string) => void;
  bulkSetStatusByPerson: (personId: string, status: EquipmentStatus) => void;
}

const MOCK_TRIP_ID = 'trip-mock-1';

const mockTrips: Trip[] = [
  {
    id: MOCK_TRIP_ID,
    location: '莫干山后坞营地',
    peopleCount: 4,
    days: 2,
    weather: '多云转晴 22-28°C',
    vehicle: 'SUV x 2',
    meetingTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const mockPeople: Person[] = [
  { id: 'p1', tripId: MOCK_TRIP_ID, name: '阿杰', avatarColor: AVATAR_COLORS[0] },
  { id: 'p2', tripId: MOCK_TRIP_ID, name: '小美', avatarColor: AVATAR_COLORS[1] },
  { id: 'p3', tripId: MOCK_TRIP_ID, name: '大刘', avatarColor: AVATAR_COLORS[2] },
  { id: 'p4', tripId: MOCK_TRIP_ID, name: '小西', avatarColor: AVATAR_COLORS[3] },
];

const mockEquipment: Equipment[] = [
  { id: 'e1', tripId: MOCK_TRIP_ID, name: '3-4人帐篷', category: 'tent', weightGrams: 2800, volumeLiters: 15, responsiblePersonId: 'p1', bagName: '大包A', status: 'packed', confirmedAtCamp: false, forgetCount: 0, notes: '' },
  { id: 'e2', tripId: MOCK_TRIP_ID, name: '地布', category: 'tent', weightGrams: 350, volumeLiters: 2, responsiblePersonId: 'p1', bagName: '大包A', status: 'packed', confirmedAtCamp: false, forgetCount: 1, notes: '' },
  { id: 'e3', tripId: MOCK_TRIP_ID, name: '睡袋 x2', category: 'sleep', weightGrams: 2400, volumeLiters: 20, responsiblePersonId: 'p2', bagName: '大包B', status: 'packed', confirmedAtCamp: false, forgetCount: 0, notes: '舒适温度5°C' },
  { id: 'e4', tripId: MOCK_TRIP_ID, name: '充气床垫', category: 'sleep', weightGrams: 1800, volumeLiters: 8, responsiblePersonId: 'p3', bagName: '大包B', status: 'unassigned', confirmedAtCamp: false, forgetCount: 2, notes: '带电泵' },
  { id: 'e5', tripId: MOCK_TRIP_ID, name: '炉头', category: 'cooking', weightGrams: 220, volumeLiters: 1, responsiblePersonId: 'p4', bagName: '厨房包', status: 'at_risk', confirmedAtCamp: false, forgetCount: 3, notes: '检查密封圈' },
  { id: 'e6', tripId: MOCK_TRIP_ID, name: '气罐 x2', category: 'cooking', weightGrams: 480, volumeLiters: 3, responsiblePersonId: null, bagName: null, status: 'unassigned', confirmedAtCamp: false, forgetCount: 2, notes: '注意不能上地铁' },
  { id: 'e7', tripId: MOCK_TRIP_ID, name: '套锅', category: 'cooking', weightGrams: 900, volumeLiters: 5, responsiblePersonId: 'p4', bagName: '厨房包', status: 'packed', confirmedAtCamp: false, forgetCount: 0, notes: '' },
  { id: 'e8', tripId: MOCK_TRIP_ID, name: '营地灯', category: 'lighting', weightGrams: 320, volumeLiters: 1.5, responsiblePersonId: 'p2', bagName: '小包', status: 'in_car', confirmedAtCamp: false, forgetCount: 0, notes: '充电款' },
  { id: 'e9', tripId: MOCK_TRIP_ID, name: '头灯 x4', category: 'lighting', weightGrams: 400, volumeLiters: 2, responsiblePersonId: 'p3', bagName: '小包', status: 'unassigned', confirmedAtCamp: false, forgetCount: 1, notes: '' },
  { id: 'e10', tripId: MOCK_TRIP_ID, name: '急救包', category: 'firstaid', weightGrams: 300, volumeLiters: 2, responsiblePersonId: 'p1', bagName: '小包', status: 'packed', confirmedAtCamp: false, forgetCount: 0, notes: '检查有效期' },
  { id: 'e11', tripId: MOCK_TRIP_ID, name: '蓝牙音箱', category: 'entertainment', weightGrams: 550, volumeLiters: 1.5, responsiblePersonId: 'p2', bagName: '小包', status: 'in_car', confirmedAtCamp: false, forgetCount: 0, notes: '' },
  { id: 'e12', tripId: MOCK_TRIP_ID, name: '天幕', category: 'tent', weightGrams: 3500, volumeLiters: 18, responsiblePersonId: 'p3', bagName: null, status: 'at_risk', confirmedAtCamp: false, forgetCount: 1, notes: '带地钉和营绳' },
  { id: 'e13', tripId: MOCK_TRIP_ID, name: '折叠桌椅', category: 'cooking', weightGrams: 5000, volumeLiters: 30, responsiblePersonId: null, bagName: '车顶', status: 'unassigned', confirmedAtCamp: false, forgetCount: 0, notes: '桌子1张椅子4把' },
  { id: 'e14', tripId: MOCK_TRIP_ID, name: '保温箱', category: 'cooking', weightGrams: 3500, volumeLiters: 40, responsiblePersonId: 'p4', bagName: '车顶', status: 'in_car', confirmedAtCamp: false, forgetCount: 0, notes: '放冰袋和食材' },
  { id: 'e15', tripId: MOCK_TRIP_ID, name: '扑克+桌游', category: 'entertainment', weightGrams: 200, volumeLiters: 0.5, responsiblePersonId: 'p2', bagName: '小包', status: 'packed', confirmedAtCamp: false, forgetCount: 0, notes: '' },
];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentTripId: MOCK_TRIP_ID,
      trips: mockTrips,
      people: mockPeople,
      equipment: mockEquipment,

      createTrip: (data) => {
        const id = generateId();
        const trip: Trip = {
          ...data,
          id,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({
          trips: [...s.trips, trip],
          currentTripId: id,
        }));
        return id;
      },

      updateTrip: (id, data) => {
        set((s) => ({
          trips: s.trips.map((t) => (t.id === id ? { ...t, ...data } : t)),
        }));
      },

      setCurrentTrip: (id) => {
        set({ currentTripId: id });
      },

      addPerson: (name) => {
        const { currentTripId, people } = get();
        if (!currentTripId) return;
        const colorIndex = people.length % AVATAR_COLORS.length;
        const person: Person = {
          id: generateId(),
          tripId: currentTripId,
          name,
          avatarColor: AVATAR_COLORS[colorIndex],
        };
        set((s) => ({ people: [...s.people, person] }));
      },

      removePerson: (id) => {
        set((s) => ({
          people: s.people.filter((p) => p.id !== id),
          equipment: s.equipment.map((e) =>
            e.responsiblePersonId === id ? { ...e, responsiblePersonId: null } : e
          ),
        }));
      },

      updatePerson: (id, data) => {
        set((s) => ({
          people: s.people.map((p) => (p.id === id ? { ...p, ...data } : p)),
        }));
      },

      addEquipment: (data) => {
        const { currentTripId } = get();
        if (!currentTripId) return;
        const item: Equipment = {
          ...data,
          id: generateId(),
          tripId: currentTripId,
          status: 'unassigned',
          confirmedAtCamp: false,
          forgetCount: 0,
        };
        set((s) => ({ equipment: [...s.equipment, item] }));
      },

      updateEquipment: (id, data) => {
        set((s) => ({
          equipment: s.equipment.map((e) => (e.id === id ? { ...e, ...data } : e)),
        }));
      },

      removeEquipment: (id) => {
        set((s) => ({
          equipment: s.equipment.filter((e) => e.id !== id),
        }));
      },

      setEquipmentStatus: (id, status) => {
        set((s) => ({
          equipment: s.equipment.map((e) => {
            if (e.id !== id) return e;
            const forgetCount = status === 'at_risk' ? e.forgetCount + 1 : e.forgetCount;
            return { ...e, status, forgetCount };
          }),
        }));
      },

      toggleConfirmedAtCamp: (id) => {
        set((s) => ({
          equipment: s.equipment.map((e) =>
            e.id === id ? { ...e, confirmedAtCamp: !e.confirmedAtCamp } : e
          ),
        }));
      },

      bulkSetStatusByPerson: (personId, status) => {
        set((s) => ({
          equipment: s.equipment.map((e) => {
            if (e.responsiblePersonId !== personId) return e;
            const forgetCount = status === 'at_risk' ? e.forgetCount + 1 : e.forgetCount;
            return { ...e, status, forgetCount };
          }),
        }));
      },
    }),
    {
      name: 'camping-checklist-storage',
    }
  )
);

export const selectCurrentTrip = (s: StoreState) =>
  s.trips.find((t) => t.id === s.currentTripId) || null;

export const selectCurrentPeople = (s: StoreState) =>
  s.people.filter((p) => p.tripId === s.currentTripId);

export const selectCurrentEquipment = (s: StoreState) =>
  s.equipment.filter((e) => e.tripId === s.currentTripId);

export const selectEquipmentByStatus = (status: EquipmentStatus) => (s: StoreState) =>
  selectCurrentEquipment(s).filter((e) => e.status === status);

export const selectEquipmentByPerson = (personId: string) => (s: StoreState) =>
  selectCurrentEquipment(s).filter((e) => e.responsiblePersonId === personId);

export const selectEquipmentByCategory = (category: EquipmentCategory) => (s: StoreState) =>
  selectCurrentEquipment(s).filter((e) => e.category === category);

export const selectPersonById = (id: string) => (s: StoreState) =>
  s.people.find((p) => p.id === id) || null;

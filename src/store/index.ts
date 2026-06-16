import { create } from 'zustand';
import type {
  UserRole,
  WashingPool,
  Booking,
  CleaningTask,
  PetInfo,
  DeviceStatus,
  Statistics,
  BookingStatus,
  TaskType,
} from '../types';
import {
  mockWashingPools,
  mockBookings,
  mockCleaningTasks,
  mockStatistics,
} from '../data/mockData';

const STORAGE_KEY = 'pet-wash-store';

interface AppState {
  currentRole: UserRole | null;
  washingPools: WashingPool[];
  bookings: Booking[];
  cleaningTasks: CleaningTask[];
  currentBooking: Booking | null;
  statistics: Statistics;
}

interface AppActions {
  setRole: (role: UserRole) => void;
  createBooking: (
    poolId: string,
    poolName: string,
    date: string,
    timeSlot: string,
    petInfo: PetInfo
  ) => Booking;
  startBooking: (bookingId: string) => void;
  endBooking: (
    bookingId: string,
    feedback: {
      waterSpilled: boolean;
      floorNeedsMopping: boolean;
      usedDisinfectant: boolean;
    }
  ) => void;
  updatePoolStatus: (poolId: string, status: DeviceStatus) => void;
  completeTask: (taskId: string) => void;
  getBookingsByPhone: (phone: string) => Booking[];
  getPendingTasks: () => CleaningTask[];
  cancelBooking: (bookingId: string) => void;
}

type AppStore = AppState & AppActions;

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const loadFromStorage = (): Partial<AppState> | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error('Failed to load store from localStorage');
  }
  return null;
};

const saveToStorage = (state: AppState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.error('Failed to save store to localStorage');
  }
};

const getInitialState = (): AppState => {
  const stored = loadFromStorage();
  return {
    currentRole: stored?.currentRole ?? null,
    washingPools: stored?.washingPools ?? mockWashingPools,
    bookings: stored?.bookings ?? mockBookings,
    cleaningTasks: stored?.cleaningTasks ?? mockCleaningTasks,
    currentBooking: stored?.currentBooking ?? null,
    statistics: stored?.statistics ?? mockStatistics,
  };
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...getInitialState(),

  setRole: (role: UserRole) => {
    set((state) => {
      const newState = { ...state, currentRole: role };
      saveToStorage(newState);
      return newState;
    });
  },

  createBooking: (
    poolId: string,
    poolName: string,
    date: string,
    timeSlot: string,
    petInfo: PetInfo
  ) => {
    const newBooking: Booking = {
      id: generateId('booking'),
      poolId,
      poolName,
      date,
      timeSlot,
      petInfo,
      status: 'PENDING',
      createdAt: new Date(),
    };

    set((state) => {
      const newState = {
        ...state,
        bookings: [...state.bookings, newBooking],
      };
      saveToStorage(newState);
      return newState;
    });

    return newBooking;
  },

  startBooking: (bookingId: string) => {
    set((state) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking) return state;

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId
          ? ({ ...b, status: 'IN_USE' as BookingStatus, startTime: new Date() } as Booking)
          : b
      );

      const updatedPools = state.washingPools.map((p) =>
        p.id === booking.poolId ? { ...p, status: 'OCCUPIED' as DeviceStatus } : p
      );

      const newState = {
        ...state,
        bookings: updatedBookings,
        washingPools: updatedPools,
        currentBooking: updatedBookings.find((b) => b.id === bookingId) ?? null,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  endBooking: (
    bookingId: string,
    feedback: {
      waterSpilled: boolean;
      floorNeedsMopping: boolean;
      usedDisinfectant: boolean;
    }
  ) => {
    set((state) => {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking || !booking.startTime) return state;

      const endTime = new Date();
      const startTime = new Date(booking.startTime);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 60000);

      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId
          ? ({
              ...b,
              status: 'COMPLETED' as BookingStatus,
              endTime,
              duration,
              feedback,
            } as Booking)
          : b
      );

      const updatedPools = state.washingPools.map((p) =>
        p.id === booking.poolId ? { ...p, status: 'CLEANING_PENDING' as DeviceStatus } : p
      );

      const newTasks: CleaningTask[] = [];

      if (feedback.floorNeedsMopping) {
        newTasks.push({
          id: generateId('task'),
          poolId: booking.poolId,
          poolName: booking.poolName,
          type: 'MAT_REPLACEMENT' as TaskType,
          priority: 'HIGH',
          status: 'PENDING',
          createdAt: new Date(),
        });
      }

      if (feedback.waterSpilled) {
        newTasks.push({
          id: generateId('task'),
          poolId: booking.poolId,
          poolName: booking.poolName,
          type: 'DRAIN_CLEANING' as TaskType,
          priority: 'HIGH',
          status: 'PENDING',
          createdAt: new Date(),
        });
      }

      if (!feedback.usedDisinfectant) {
        newTasks.push({
          id: generateId('task'),
          poolId: booking.poolId,
          poolName: booking.poolName,
          type: 'DISINFECTANT_REFILL' as TaskType,
          priority: 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date(),
        });
      }

      const newState = {
        ...state,
        bookings: updatedBookings,
        washingPools: updatedPools,
        cleaningTasks: [...state.cleaningTasks, ...newTasks],
        currentBooking: null,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  cancelBooking: (bookingId: string) => {
    set((state) => {
      const updatedBookings = state.bookings.map((b) =>
        b.id === bookingId
          ? ({ ...b, status: 'CANCELLED' as BookingStatus } as Booking)
          : b
      );

      const newState = {
        ...state,
        bookings: updatedBookings,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  updatePoolStatus: (poolId: string, status: DeviceStatus) => {
    set((state) => {
      const newState = {
        ...state,
        washingPools: state.washingPools.map((p) =>
          p.id === poolId ? { ...p, status } : p
        ),
      };
      saveToStorage(newState);
      return newState;
    });
  },

  completeTask: (taskId: string) => {
    set((state) => {
      const task = state.cleaningTasks.find((t) => t.id === taskId);
      if (!task) return state;

      const updatedTasks = state.cleaningTasks.map((t) =>
        t.id === taskId
          ? { ...t, status: 'COMPLETED' as const, completedAt: new Date() }
          : t
      );

      const poolHasPendingTasks = updatedTasks.some(
        (t) => t.poolId === task.poolId && t.status !== 'COMPLETED'
      );

      const updatedPools = poolHasPendingTasks
        ? state.washingPools
        : state.washingPools.map((p) =>
            p.id === task.poolId ? { ...p, status: 'IDLE' as DeviceStatus, lastCleanedAt: new Date() } : p
          );

      const newState = {
        ...state,
        cleaningTasks: updatedTasks,
        washingPools: updatedPools,
      };
      saveToStorage(newState);
      return newState;
    });
  },

  getBookingsByPhone: (phone: string) => {
    return get().bookings.filter((b) => b.petInfo.ownerPhone === phone);
  },

  getPendingTasks: () => {
    return get().cleaningTasks.filter((t) => t.status === 'PENDING');
  },
}));

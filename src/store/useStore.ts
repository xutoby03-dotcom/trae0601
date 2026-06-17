import { create } from 'zustand';
import type {
  User,
  Room,
  Instrument,
  Booking,
  Repair,
  BookingStatus,
  RepairStatus,
} from '@/types';
import {
  mockUsers,
  mockRooms,
  mockInstruments,
  mockBookings,
  mockRepairs,
} from '@/data/mockData';
import { needsApproval } from '@/utils/businessRules';

interface BookingCreateData {
  roomId: string;
  userId: string;
  instrumentId: string;
  piece: string;
  peopleCount: number;
  needMusicStand: boolean;
  expectedVolume: Booking['expectedVolume'];
  startTime: Date;
  endTime: Date;
  parentBookingId?: string;
}

interface RepairCreateData {
  roomId: string;
  bookingId?: string;
  reporterId: string;
  equipmentName: string;
  description: string;
  photos: string[];
}

interface StoreState {
  currentUser: User | null;
  users: User[];
  rooms: Room[];
  instruments: Instrument[];
  bookings: Booking[];
  repairs: Repair[];

  createBooking: (data: BookingCreateData) => Booking;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  approveBooking: (id: string) => void;
  rejectBooking: (id: string) => void;
  checkInBooking: (id: string) => void;
  createRepair: (data: RepairCreateData) => Repair;
  updateRepairStatus: (id: string, status: RepairStatus) => void;
  setCurrentUser: (user: User | null) => void;
}

const STORAGE_KEY = 'music-studio-store';

function reviveDates(key: string, value: unknown): unknown {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Date(value);
  }
  return value;
}

function loadFromStorage(): Partial<StoreState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw, reviveDates) as Partial<StoreState>;
  } catch {
    return null;
  }
}

function saveToStorage(state: StoreState): void {
  try {
    const toSave = {
      currentUser: state.currentUser,
      users: state.users,
      rooms: state.rooms,
      instruments: state.instruments,
      bookings: state.bookings,
      repairs: state.repairs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

const persisted = loadFromStorage();

export const useStore = create<StoreState>((set, get) => ({
  currentUser: persisted?.currentUser ?? mockUsers[0],
  users: persisted?.users ?? mockUsers,
  rooms: persisted?.rooms ?? mockRooms,
  instruments: persisted?.instruments ?? mockInstruments,
  bookings: persisted?.bookings ?? mockBookings,
  repairs: persisted?.repairs ?? mockRepairs,

  createBooking: (data) => {
    const status: BookingStatus = needsApproval(data.startTime, data.endTime)
      ? 'pending_approval'
      : 'approved';
    const newBooking: Booking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...data,
      status,
      createdAt: new Date(),
    };
    set((state) => {
      const newState = { ...state, bookings: [...state.bookings, newBooking] };
      saveToStorage(newState);
      return newState;
    });
    return newBooking;
  },

  updateBookingStatus: (id, status) => {
    set((state) => {
      const newState = {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === id ? { ...b, status } : b,
        ),
      };
      saveToStorage(newState);
      return newState;
    });
  },

  approveBooking: (id) => {
    get().updateBookingStatus(id, 'approved');
  },

  rejectBooking: (id) => {
    get().updateBookingStatus(id, 'rejected');
  },

  checkInBooking: (id) => {
    get().updateBookingStatus(id, 'checked_in');
  },

  createRepair: (data) => {
    const newRepair: Repair = {
      id: `repair-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...data,
      status: 'pending',
      createdAt: new Date(),
    };
    set((state) => {
      const newState = { ...state, repairs: [...state.repairs, newRepair] };
      saveToStorage(newState);
      return newState;
    });
    return newRepair;
  },

  updateRepairStatus: (id, status) => {
    set((state) => {
      const newState = {
        ...state,
        repairs: state.repairs.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                completedAt: status === 'completed' ? new Date() : r.completedAt,
              }
            : r,
        ),
      };
      saveToStorage(newState);
      return newState;
    });
  },

  setCurrentUser: (user) => {
    set((state) => {
      const newState = { ...state, currentUser: user };
      saveToStorage(newState);
      return newState;
    });
  },
}));

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
  processNoShows: () => number;
  processBookingStatusUpdates: () => { noShows: number; checkins: number };
}

const STORAGE_KEY = 'music-studio-store-v2';

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

  processNoShows: () => {
    const now = new Date().getTime();
    const allBookings = get().bookings;
    const CHECKIN_GRACE_MS = 15 * 60 * 1000;

    const overdueBookings = allBookings.filter((b) => {
      if (b.status !== 'waiting_checkin') return false;
      const deadline = new Date(b.startTime).getTime() + CHECKIN_GRACE_MS;
      return now > deadline;
    });

    if (overdueBookings.length === 0) return 0;

    let updatedBookings = [...allBookings];
    let processedCount = 0;

    for (const overdueBooking of overdueBookings) {
      updatedBookings = updatedBookings.map((b) =>
        b.id === overdueBooking.id
          ? { ...b, status: 'no_show' as BookingStatus }
          : b,
      );
      processedCount++;

      const waitlist = updatedBookings
        .filter(
          (b) =>
            b.parentBookingId === overdueBooking.id &&
            b.status === 'waitlisted',
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );

      if (waitlist.length > 0) {
        const nextBooking = waitlist[0];
        const start = new Date(nextBooking.startTime).getTime();
        const checkinOpen = start - CHECKIN_GRACE_MS;
        const checkinDeadline = start + CHECKIN_GRACE_MS;

        let newStatus: BookingStatus = 'approved';
        if (now >= checkinOpen && now < checkinDeadline) {
          newStatus = 'waiting_checkin';
        } else if (now >= checkinDeadline) {
          newStatus = 'waiting_checkin';
        }

        updatedBookings = updatedBookings.map((b) =>
          b.id === nextBooking.id
            ? {
                ...b,
                status: newStatus,
                parentBookingId: undefined,
              }
            : b,
        );
      }
    }

    set((state) => {
      const newState = { ...state, bookings: updatedBookings };
      saveToStorage(newState);
      return newState;
    });

    return processedCount;
  },

  processBookingStatusUpdates: () => {
    const now = new Date().getTime();
    const CHECKIN_GRACE_MS = 15 * 60 * 1000;
    let allBookings = get().bookings;
    let noShowCount = 0;
    let checkinCount = 0;

    const toWaitingCheckin = allBookings.filter((b) => {
      if (b.status !== 'approved') return false;
      const start = new Date(b.startTime).getTime();
      const checkinOpen = start - CHECKIN_GRACE_MS;
      return now >= checkinOpen && now < start + CHECKIN_GRACE_MS;
    });

    if (toWaitingCheckin.length > 0) {
      allBookings = allBookings.map((b) =>
        toWaitingCheckin.some((w) => w.id === b.id)
          ? { ...b, status: 'waiting_checkin' as BookingStatus }
          : b,
      );
      checkinCount = toWaitingCheckin.length;
    }

    const overdueBookings = allBookings.filter((b) => {
      if (b.status !== 'waiting_checkin') return false;
      const deadline = new Date(b.startTime).getTime() + CHECKIN_GRACE_MS;
      return now > deadline;
    });

    if (overdueBookings.length > 0) {
      for (const overdueBooking of overdueBookings) {
        allBookings = allBookings.map((b) =>
          b.id === overdueBooking.id
            ? { ...b, status: 'no_show' as BookingStatus }
            : b,
        );
        noShowCount++;

        const waitlist = allBookings
          .filter(
            (b) =>
              b.parentBookingId === overdueBooking.id &&
              b.status === 'waitlisted',
          )
          .sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );

        if (waitlist.length > 0) {
          const nextBooking = waitlist[0];
          const start = new Date(nextBooking.startTime).getTime();
          const checkinOpen = start - CHECKIN_GRACE_MS;
          const checkinDeadline = start + CHECKIN_GRACE_MS;

          let newStatus: BookingStatus = 'approved';
          if (now >= checkinOpen && now < checkinDeadline) {
            newStatus = 'waiting_checkin';
          } else if (now >= checkinDeadline) {
            newStatus = 'waiting_checkin';
          }

          allBookings = allBookings.map((b) =>
            b.id === nextBooking.id
              ? {
                  ...b,
                  status: newStatus,
                  parentBookingId: undefined,
                }
              : b,
          );
        }
      }
    }

    if (noShowCount === 0 && checkinCount === 0) {
      return { noShows: 0, checkins: 0 };
    }

    set((state) => {
      const newState = { ...state, bookings: allBookings };
      saveToStorage(newState);
      return newState;
    });

    return { noShows: noShowCount, checkins: checkinCount };
  },
}));

import { create } from 'zustand';
import type { Table, Booking, ReturnRecord, DamageRecord, BookingStatus, TableStatus, DamageStatus } from '../types';
import { storage } from '../utils/storage';
import { generateId, generateBookingCode, updateOverdueBookings, validateBookingDuration, checkTimeConflict } from '../utils/bookingUtils';
import { initialTables, initialAdmin, mockBookings, mockDamageRecords } from '../data/mockData';

interface AppState {
  tables: Table[];
  bookings: Booking[];
  returnRecords: ReturnRecord[];
  damageRecords: DamageRecord[];
  currentPhone: string;
  isAdminLoggedIn: boolean;
  adminUsername: string;
  
  initData: () => void;
  refreshData: () => void;
  
  setCurrentPhone: (phone: string) => void;
  
  createBooking: (data: Omit<Booking, 'id' | 'bookingCode' | 'status' | 'createdAt'>) => { success: boolean; message?: string; booking?: Booking };
  cancelBooking: (bookingId: string) => void;
  checkInBooking: (bookingId: string) => boolean;
  completeBooking: (bookingId: string) => void;
  
  createReturnRecord: (data: Omit<ReturnRecord, 'id' | 'createdAt'>) => void;
  
  createDamageRecord: (data: Omit<DamageRecord, 'id' | 'status' | 'reportedAt'>) => void;
  updateDamageStatus: (recordId: string, status: DamageStatus) => void;
  
  updateTableStatus: (tableId: string, status: TableStatus) => void;
  updateTable: (tableId: string, updates: Partial<Table>) => void;
  
  loginAdmin: (username: string, password: string) => boolean;
  logoutAdmin: () => void;
  
  getBookingsByPhone: (phone: string) => Booking[];
  getBookingById: (id: string) => Booking | undefined;
  getTableById: (id: string) => Table | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  tables: [],
  bookings: [],
  returnRecords: [],
  damageRecords: [],
  currentPhone: '',
  isAdminLoggedIn: false,
  adminUsername: '',

  initData: () => {
    let tables = storage.getTables();
    let bookings = storage.getBookings();
    let returnRecords = storage.getReturnRecords();
    let damageRecords = storage.getDamageRecords();
    let admins = storage.getAdmins();
    const currentPhone = storage.getCurrentPhone();

    if (tables.length === 0) {
      tables = initialTables;
      storage.setTables(tables);
    }
    if (bookings.length === 0) {
      bookings = mockBookings;
      storage.setBookings(bookings);
    }
    if (damageRecords.length === 0) {
      damageRecords = mockDamageRecords;
      storage.setDamageRecords(damageRecords);
    }
    if (admins.length === 0) {
      admins = initialAdmin;
      storage.setAdmins(admins);
    }

    updateOverdueBookings();
    bookings = storage.getBookings();

    set({ tables, bookings, returnRecords, damageRecords, currentPhone });
  },

  refreshData: () => {
    updateOverdueBookings();
    set({
      tables: storage.getTables(),
      bookings: storage.getBookings(),
      returnRecords: storage.getReturnRecords(),
      damageRecords: storage.getDamageRecords(),
    });
  },

  setCurrentPhone: (phone: string) => {
    storage.setCurrentPhone(phone);
    set({ currentPhone: phone });
  },

  createBooking: (data) => {
    updateOverdueBookings();
    
    const validation = validateBookingDuration(
      data.phone,
      data.date,
      data.startTime,
      data.endTime
    );
    
    if (!validation.valid) {
      return { success: false, message: validation.message };
    }

    if (checkTimeConflict(data.tableId, data.date, data.startTime, data.endTime)) {
      return { success: false, message: '该时段已被预约，请选择其他时间' };
    }

    const newBooking: Booking = {
      ...data,
      id: generateId('booking'),
      bookingCode: generateBookingCode(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const bookings = [...storage.getBookings(), newBooking];
    storage.setBookings(bookings);
    set({ bookings });

    return { success: true, booking: newBooking };
  },

  cancelBooking: (bookingId: string) => {
    const bookings = storage.getBookings().map((b) =>
      b.id === bookingId ? { ...b, status: 'cancelled' as BookingStatus } : b
    );
    storage.setBookings(bookings);
    set({ bookings });
  },

  checkInBooking: (bookingId: string): boolean => {
    updateOverdueBookings();
    const booking = storage.getBookings().find((b) => b.id === bookingId);
    
    if (!booking || booking.status !== 'pending') {
      return false;
    }

    const bookings = storage.getBookings().map((b) =>
      b.id === bookingId
        ? { ...b, status: 'checked-in' as BookingStatus, checkedInAt: new Date().toISOString() }
        : b
    );
    storage.setBookings(bookings);
    set({ bookings });
    return true;
  },

  completeBooking: (bookingId: string) => {
    const bookings = storage.getBookings().map((b) =>
      b.id === bookingId ? { ...b, status: 'completed' as BookingStatus } : b
    );
    storage.setBookings(bookings);
    set({ bookings });
  },

  createReturnRecord: (data) => {
    const newRecord: ReturnRecord = {
      ...data,
      id: generateId('return'),
      createdAt: new Date().toISOString(),
    };

    const records = [...storage.getReturnRecords(), newRecord];
    storage.setReturnRecords(records);
    set({ returnRecords: records });

    if (data.bookingId) {
      get().completeBooking(data.bookingId);
    }
  },

  createDamageRecord: (data) => {
    const newRecord: DamageRecord = {
      ...data,
      id: generateId('damage'),
      status: 'pending',
      reportedAt: new Date().toISOString(),
    };

    const records = [...storage.getDamageRecords(), newRecord];
    storage.setDamageRecords(records);
    set({ damageRecords: records });
  },

  updateDamageStatus: (recordId: string, status: DamageStatus) => {
    const records = storage.getDamageRecords().map((r) =>
      r.id === recordId
        ? { ...r, status, resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined }
        : r
    );
    storage.setDamageRecords(records);
    set({ damageRecords: records });
  },

  updateTableStatus: (tableId: string, status: TableStatus) => {
    const tables = storage.getTables().map((t) =>
      t.id === tableId ? { ...t, status } : t
    );
    storage.setTables(tables);
    set({ tables });
  },

  updateTable: (tableId: string, updates: Partial<Table>) => {
    const tables = storage.getTables().map((t) =>
      t.id === tableId ? { ...t, ...updates } : t
    );
    storage.setTables(tables);
    set({ tables });
  },

  loginAdmin: (username: string, password: string) => {
    const admins = storage.getAdmins();
    const admin = admins.find((a) => a.username === username && a.password === password);
    if (admin) {
      set({ isAdminLoggedIn: true, adminUsername: admin.username });
      return true;
    }
    return false;
  },

  logoutAdmin: () => {
    set({ isAdminLoggedIn: false, adminUsername: '' });
  },

  getBookingsByPhone: (phone: string) => {
    updateOverdueBookings();
    return storage.getBookings().filter((b) => b.phone === phone).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getBookingById: (id: string) => {
    return storage.getBookings().find((b) => b.id === id);
  },

  getTableById: (id: string) => {
    return storage.getTables().find((t) => t.id === id);
  },
}));

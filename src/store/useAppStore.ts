import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Room, Booking, UserRole, RoomStatus, BookingStatus, DEFAULT_TIME_SLOTS, getRoomTimeSlots } from '@/types';
import { initializeMockData } from '@/data/mockData';
import { 
  generateId, 
  validateDailyBookingLimit, 
  validateConsecutiveBookings,
  getWaitlistPosition,
  getSlotStatus as getSlotStatusUtil,
  formatDate,
} from '@/utils/bookingUtils';

interface AppState {
  currentRole: UserRole;
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  selectedRoomId: string | null;
  showBookingModal: boolean;
  modalRoomId: string | null;
  modalDate: string | null;
  modalTimeSlot: string | null;
  
  setCurrentRole: (role: UserRole) => void;
  setSelectedDate: (date: string) => void;
  setSelectedRoomId: (id: string | null) => void;
  openBookingModal: (roomId: string, date: string, timeSlot: string) => void;
  closeBookingModal: () => void;
  
  addRoom: (room: Omit<Room, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  updateRoomStatus: (id: string, status: RoomStatus, reason?: string) => void;
  deleteRoom: (id: string) => void;
  
  createBooking: (booking: Omit<Booking, 'id' | 'status' | 'isWaitlist' | 'waitlistPosition' | 'createdAt'>, isWaitlist?: boolean) => { success: boolean; message?: string; booking?: Booking };
  cancelBooking: (id: string) => void;
  markNoShow: (id: string) => void;
  processWaitlist: (roomId: string, date: string, timeSlot: string) => void;
  
  getBookingsForRoom: (roomId: string) => Booking[];
  getBookingsForDate: (date: string) => Booking[];
  getBookingsForStudent: (studentName: string) => Booking[];
  getSlotStatus: (roomId: string, date: string, timeSlot: string) => ReturnType<typeof getSlotStatusUtil>;
  getWaitlistForSlot: (roomId: string, date: string, timeSlot: string) => Booking[];
  
  resetData: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => {
      const initialData = initializeMockData();
      
      return {
        currentRole: 'student',
        rooms: initialData.rooms,
        bookings: initialData.bookings,
        selectedDate: formatDate(new Date()),
        selectedRoomId: null,
        showBookingModal: false,
        modalRoomId: null,
        modalDate: null,
        modalTimeSlot: null,
        
        setCurrentRole: (role) => set({ currentRole: role }),
        setSelectedDate: (date) => set({ selectedDate: date }),
        setSelectedRoomId: (id) => set({ selectedRoomId: id }),
        openBookingModal: (roomId, date, timeSlot) => set({
          showBookingModal: true,
          modalRoomId: roomId,
          modalDate: date,
          modalTimeSlot: timeSlot,
        }),
        closeBookingModal: () => set({
          showBookingModal: false,
          modalRoomId: null,
          modalDate: null,
          modalTimeSlot: null,
        }),
        
        addRoom: (room) => set((state) => ({
          rooms: [...state.rooms, {
            ...room,
            id: `room-${generateId()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }],
        })),
        
        updateRoom: (id, updates) => set((state) => ({
          rooms: state.rooms.map(r => r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r),
        })),
        
        updateRoomStatus: (id, status, reason) => set((state) => {
          const room = state.rooms.find(r => r.id === id);
          if (!room) return state;
          
          const now = new Date();
          const today = formatDate(now);
          
          if (status !== 'available') {
            const updatedBookings = state.bookings.map(b => {
              if (b.roomId === id && b.date >= today && b.status !== 'cancelled' && b.status !== 'completed') {
                return {
                  ...b,
                  status: 'cancelled' as BookingStatus,
                  cancelledAt: now.toISOString(),
                };
              }
              return b;
            });
            
            return {
              rooms: state.rooms.map(r => r.id === id ? {
                ...r,
                status,
                maintenanceReason: reason,
                updatedAt: now.toISOString(),
              } : r),
              bookings: updatedBookings,
            };
          }
          
          return {
            rooms: state.rooms.map(r => r.id === id ? {
              ...r,
              status,
              maintenanceReason: undefined,
              updatedAt: now.toISOString(),
            } : r),
          };
        }),
        
        deleteRoom: (id) => set((state) => ({
          rooms: state.rooms.filter(r => r.id !== id),
        })),
        
        createBooking: (bookingData, isWaitlist = false) => {
          const state = get();
          const room = state.rooms.find(r => r.id === bookingData.roomId);
          
          if (!room) {
            return { success: false, message: '琴房不存在' };
          }
          
          if (room.status !== 'available') {
            return { success: false, message: '琴房暂不可用' };
          }

          const roomSlots = getRoomTimeSlots(room);
          if (!roomSlots.includes(bookingData.timeSlot)) {
            return { success: false, message: '该时段琴房未开放' };
          }
          
          const dailyValidation = validateDailyBookingLimit(
            bookingData.studentName,
            bookingData.date,
            state.bookings
          );
          if (!dailyValidation.valid) {
            return { success: false, message: dailyValidation.message };
          }
          
          const consecutiveValidation = validateConsecutiveBookings(
            bookingData.studentName,
            bookingData.date,
            bookingData.timeSlot,
            state.bookings
          );
          if (!consecutiveValidation.valid) {
            return { success: false, message: consecutiveValidation.message };
          }
          
          const slotStatus = getSlotStatusUtil(
            bookingData.roomId,
            bookingData.date,
            bookingData.timeSlot,
            state.bookings,
            room.status,
            roomSlots
          );
          
          if (slotStatus === 'blocked' || slotStatus === 'not_open') {
            return { success: false, message: slotStatus === 'not_open' ? '该时段琴房未开放' : '该时段不可预约' };
          }
          
          const willBeWaitlist = isWaitlist || slotStatus === 'waitlist_only';
          
          const newBooking: Booking = {
            ...bookingData,
            id: `booking-${generateId()}`,
            status: willBeWaitlist ? 'waitlist' : 'confirmed',
            isWaitlist: willBeWaitlist,
            waitlistPosition: willBeWaitlist ? getWaitlistPosition(bookingData.roomId, bookingData.date, bookingData.timeSlot, state.bookings) : undefined,
            createdAt: new Date().toISOString(),
          };
          
          set((state) => ({
            bookings: [...state.bookings, newBooking],
          }));
          
          return { success: true, booking: newBooking };
        },
        
        cancelBooking: (id) => set((state) => {
          const booking = state.bookings.find(b => b.id === id);
          if (!booking) return state;
          
          const updatedBookings = state.bookings.map(b =>
            b.id === id
              ? { ...b, status: 'cancelled' as BookingStatus, cancelledAt: new Date().toISOString() }
              : b
          );
          
          return { bookings: updatedBookings };
        }),
        
        markNoShow: (id) => set((state) => ({
          bookings: state.bookings.map(b =>
            b.id === id ? { ...b, status: 'no_show' as BookingStatus, noShowRecorded: true } : b
          ),
        })),
        
        processWaitlist: (roomId, date, timeSlot) => {
          const state = get();
          const waitlist = state.getWaitlistForSlot(roomId, date, timeSlot);
          
          if (waitlist.length === 0) return;
          
          const firstWaitlist = waitlist[0];
          
          set((state) => ({
            bookings: state.bookings.map(b => {
              if (b.id === firstWaitlist.id) {
                return {
                  ...b,
                  status: 'confirmed' as BookingStatus,
                  isWaitlist: false,
                  waitlistPosition: undefined,
                };
              }
              if (b.roomId === roomId && b.date === date && b.timeSlot === timeSlot && b.isWaitlist && b.waitlistPosition && b.waitlistPosition > 1) {
                return { ...b, waitlistPosition: b.waitlistPosition - 1 };
              }
              return b;
            }),
          }));
        },
        
        getBookingsForRoom: (roomId) => get().bookings.filter(b => b.roomId === roomId),
        getBookingsForDate: (date) => get().bookings.filter(b => b.date === date),
        getBookingsForStudent: (studentName) => get().bookings.filter(b => b.studentName === studentName),
        
        getSlotStatus: (roomId, date, timeSlot) => {
          const state = get();
          const room = state.rooms.find(r => r.id === roomId);
          return getSlotStatusUtil(roomId, date, timeSlot, state.bookings, room?.status || 'available', room ? getRoomTimeSlots(room) : []);
        },
        
        getWaitlistForSlot: (roomId, date, timeSlot) => {
          return get().bookings
            .filter(b => b.roomId === roomId && b.date === date && b.timeSlot === timeSlot && b.isWaitlist && b.status === 'waitlist')
            .sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0));
        },
        
        resetData: () => {
          const freshData = initializeMockData();
          set({
            rooms: freshData.rooms,
            bookings: freshData.bookings,
          });
        },
      };
    },
    {
      name: 'piano-room-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          if (persistedState.rooms && Array.isArray(persistedState.rooms)) {
            persistedState.rooms = persistedState.rooms.map((room: any) => ({
              ...room,
              availableTimeSlots: room.availableTimeSlots && Array.isArray(room.availableTimeSlots) && room.availableTimeSlots.length > 0
                ? room.availableTimeSlots
                : [...DEFAULT_TIME_SLOTS],
            }));
          }
        }
        return persistedState;
      },
    }
  )
);

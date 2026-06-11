import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MeetingRoom, Booking, FaultReport } from "@/types";
import { generateId } from "@/lib/utils";

const DEFAULT_ROOMS: MeetingRoom[] = [
  {
    id: "r1",
    name: "阳光会议室",
    screenName: "Sony VPL-FHZ70",
    supportMethod: "both",
    location: "3楼 301室",
    admin: "张管理",
    adminPhone: "13800138001",
    faultPhotos: [],
    status: "available",
    createdAt: "2026-06-01T10:00:00.000Z",
  },
  {
    id: "r2",
    name: "星空会议室",
    screenName: "Epson CB-L200F",
    supportMethod: "wireless",
    location: "3楼 302室",
    admin: "李管理",
    adminPhone: "13800138002",
    faultPhotos: [],
    status: "in_use",
    createdAt: "2026-06-01T10:05:00.000Z",
  },
  {
    id: "r3",
    name: "彩虹会议室",
    screenName: "MaxHub C65",
    supportMethod: "wired",
    location: "5楼 501室",
    admin: "王管理",
    adminPhone: "13800138003",
    faultPhotos: [],
    status: "faulty",
    createdAt: "2026-06-01T10:10:00.000Z",
  },
  {
    id: "r4",
    name: "海洋会议室",
    screenName: "BenQ TK850",
    supportMethod: "both",
    location: "5楼 502室",
    admin: "赵管理",
    adminPhone: "13800138004",
    faultPhotos: [],
    status: "available",
    createdAt: "2026-06-02T09:00:00.000Z",
  },
];

const createDefaultBookings = (): Booking[] => {
  const now = new Date();
  const r2Start = new Date(now.getTime() - 30 * 60 * 1000);
  const r2End = new Date(now.getTime() + 60 * 60 * 1000);

  return [
    {
      id: "b1",
      roomId: "r2",
      topic: "产品需求评审会",
      startTime: r2Start.toISOString(),
      endTime: r2End.toISOString(),
      equipmentNeeds: "无线投屏、白板",
      host: "陈经理",
      hostPhone: "13900139001",
      status: "ongoing",
      createdAt: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
    },
  ];
};

const DEFAULT_FAULTS: FaultReport[] = [
  {
    id: "f1",
    roomId: "r3",
    description: "投屏线接触不良，经常断连",
    photos: [],
    reporter: "刘员工",
    reporterPhone: "13700137001",
    status: "pending",
    createdAt: "2026-06-10T14:30:00.000Z",
  },
];

interface StoreState {
  rooms: MeetingRoom[];
  bookings: Booking[];
  faults: FaultReport[];

  addRoom: (room: Omit<MeetingRoom, "id" | "createdAt" | "status">) => void;
  updateRoom: (id: string, room: Partial<MeetingRoom>) => void;
  deleteRoom: (id: string) => void;

  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  cancelBooking: (id: string) => void;
  completeBooking: (id: string) => void;
  startBooking: (id: string) => void;
  hasOverlappingBooking: (roomId: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;
  refreshBookingStatuses: () => void;

  addFault: (fault: Omit<FaultReport, "id" | "createdAt" | "status">) => void;
  updateFault: (id: string, fault: Partial<FaultReport>) => void;
  resolveFault: (id: string, repairNote: string) => void;

  getRoomById: (id: string) => MeetingRoom | undefined;
  getActiveBookingByRoomId: (roomId: string) => Booking | undefined;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      rooms: DEFAULT_ROOMS,
      bookings: createDefaultBookings(),
      faults: DEFAULT_FAULTS,

      addRoom: (room) =>
        set((state) => ({
          rooms: [
            ...state.rooms,
            {
              ...room,
              id: generateId("r"),
              createdAt: new Date().toISOString(),
              status: "available",
            },
          ],
        })),

      updateRoom: (id, room) =>
        set((state) => ({
          rooms: state.rooms.map((item) =>
            item.id === id ? { ...item, ...room } : item
          ),
        })),

      deleteRoom: (id) =>
        set((state) => ({
          rooms: state.rooms.filter((item) => item.id !== id),
          bookings: state.bookings.filter((b) => b.roomId !== id),
          faults: state.faults.filter((f) => f.roomId !== id),
        })),

      addBooking: (booking) =>
        set((state) => {
          const start = new Date(booking.startTime);
          const now = new Date();
          let status: Booking["status"] = "upcoming";
          if (start <= now && now < new Date(booking.endTime)) {
            status = "ongoing";
          } else if (now >= new Date(booking.endTime)) {
            status = "completed";
          }

          const newBooking: Booking = {
            ...booking,
            id: generateId("b"),
            createdAt: new Date().toISOString(),
            status,
          };

          if (status === "ongoing") {
            return {
              bookings: [...state.bookings, newBooking],
              rooms: state.rooms.map((r) =>
                r.id === booking.roomId ? { ...r, status: "in_use" } : r
              ),
            };
          }

          return {
            bookings: [...state.bookings, newBooking],
          };
        }),

      updateBooking: (id, booking) =>
        set((state) => ({
          bookings: state.bookings.map((item) =>
            item.id === id ? { ...item, ...booking } : item
          ),
        })),

      cancelBooking: (id) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking) return state;

          const hasOtherOngoing = state.bookings.some(
            (b) => b.id !== id && b.roomId === booking.roomId && b.status === "ongoing"
          );

          return {
            bookings: state.bookings.filter((b) => b.id !== id),
            rooms: hasOtherOngoing
              ? state.rooms
              : state.rooms.map((r) =>
                  r.id === booking.roomId && r.status === "in_use"
                    ? { ...r, status: "available" }
                    : r
                ),
          };
        }),

      completeBooking: (id) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking) return state;

          const hasOtherOngoing = state.bookings.some(
            (b) =>
              b.id !== id &&
              b.roomId === booking.roomId &&
              (b.status === "ongoing" || b.status === "overtime")
          );

          const room = state.rooms.find((r) => r.id === booking.roomId);
          const shouldRestoreAvailable =
            !hasOtherOngoing && room && room.status === "in_use";

          return {
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, status: "completed" } : b
            ),
            rooms: shouldRestoreAvailable
              ? state.rooms.map((r) =>
                  r.id === booking.roomId ? { ...r, status: "available" } : r
                )
              : state.rooms,
          };
        }),

      startBooking: (id) =>
        set((state) => {
          const booking = state.bookings.find((b) => b.id === id);
          if (!booking || booking.status !== "upcoming") return state;

          return {
            bookings: state.bookings.map((b) =>
              b.id === id ? { ...b, status: "ongoing" } : b
            ),
            rooms: state.rooms.map((r) =>
              r.id === booking.roomId && r.status !== "faulty"
                ? { ...r, status: "in_use" }
                : r
            ),
          };
        }),

      hasOverlappingBooking: (roomId, startTime, endTime, excludeBookingId) => {
        const { bookings } = get();
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();

        return bookings.some((b) => {
          if (b.roomId !== roomId) return false;
          if (excludeBookingId && b.id === excludeBookingId) return false;
          if (b.status === "completed") return false;

          const bStart = new Date(b.startTime).getTime();
          const bEnd = new Date(b.endTime).getTime();
          return start < bEnd && end > bStart;
        });
      },

      refreshBookingStatuses: () =>
        set((state) => {
          const now = new Date();
          let roomsChanged = false;

          const updatedBookings = state.bookings.map((booking) => {
            const start = new Date(booking.startTime);
            const end = new Date(booking.endTime);

            let newStatus: Booking["status"] = booking.status;
            if (booking.status === "completed") return booking;

            if (now < start) {
              newStatus = "upcoming";
            } else if (now >= start && now < end) {
              newStatus = "ongoing";
            } else if (now >= end) {
              newStatus = "overtime";
            }

            if (newStatus !== booking.status) {
              roomsChanged = true;
              return { ...booking, status: newStatus };
            }
            return booking;
          });

          if (!roomsChanged) {
            return { bookings: updatedBookings };
          }

          const updatedRooms: MeetingRoom[] = state.rooms.map((room) => {
            if (room.status === "faulty") return room;

            const hasActiveBooking = updatedBookings.some(
              (b) =>
                b.roomId === room.id &&
                (b.status === "ongoing" || b.status === "overtime")
            );

            if (hasActiveBooking && room.status !== "in_use") {
              return { ...room, status: "in_use" as const };
            }
            if (!hasActiveBooking && room.status === "in_use") {
              return { ...room, status: "available" as const };
            }
            return room;
          });

          return { bookings: updatedBookings, rooms: updatedRooms };
        }),

      addFault: (fault) =>
        set((state) => ({
          faults: [
            ...state.faults,
            {
              ...fault,
              id: generateId("f"),
              createdAt: new Date().toISOString(),
              status: "pending",
            },
          ],
          rooms: state.rooms.map((r) =>
            r.id === fault.roomId ? { ...r, status: "faulty" } : r
          ),
        })),

      updateFault: (id, fault) =>
        set((state) => ({
          faults: state.faults.map((item) =>
            item.id === id ? { ...item, ...fault } : item
          ),
        })),

      resolveFault: (id, repairNote) =>
        set((state) => {
          const fault = state.faults.find((f) => f.id === id);
          if (!fault) return state;

          const hasOtherPendingFaults = state.faults.some(
            (f) =>
              f.id !== id &&
              f.roomId === fault.roomId &&
              f.status !== "resolved"
          );

          return {
            faults: state.faults.map((f) =>
              f.id === id
                ? {
                    ...f,
                    status: "resolved",
                    repairNote,
                    resolvedAt: new Date().toISOString(),
                  }
                : f
            ),
            rooms: hasOtherPendingFaults
              ? state.rooms
              : state.rooms.map((r) =>
                  r.id === fault.roomId && r.status === "faulty"
                    ? { ...r, status: "available" }
                    : r
                ),
          };
        }),

      getRoomById: (id) => get().rooms.find((r) => r.id === id),
      getActiveBookingByRoomId: (roomId) =>
        get().bookings.find(
          (b) =>
            b.roomId === roomId &&
            (b.status === "ongoing" || b.status === "overtime")
        ),
    }),
    {
      name: "meeting-room-booking-storage",
    }
  )
);

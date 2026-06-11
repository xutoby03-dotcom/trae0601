import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Ladder,
  Reservation,
  BorrowRecord,
  ReturnRecord,
  LadderStatus,
  ReservationStatus,
  DamageLevel,
} from '@/types';
import { generateId, getInitialLadders, getSampleData } from '@/utils/helpers';

interface StoreState {
  ladders: Ladder[];
  reservations: Reservation[];
  borrowRecords: BorrowRecord[];
  returnRecords: ReturnRecord[];

  initSampleData: () => void;

  createReservation: (
    data: Omit<Reservation, 'id' | 'status' | 'createdAt'>
  ) => { success: boolean; message: string; reservation?: Reservation };

  checkTimeConflict: (
    ladderId: string,
    startTime: string,
    expectedEndTime: string,
    excludeReservationId?: string
  ) => { hasConflict: boolean; conflictReservation?: Reservation; nextAvailableTime?: string };

  confirmBorrow: (reservationId: string, operator?: string) => { success: boolean; message: string };

  confirmReturn: (
    borrowRecordId: string,
    damageLevel: DamageLevel,
    damageDescription: string,
    damagePhoto?: string
  ) => { success: boolean; message: string };

  cancelReservation: (reservationId: string) => { success: boolean; message: string };

  getLadderStatus: (ladderId: string) => LadderStatus;
  refreshLadderStatuses: () => void;

  getLadderCurrentReservation: (ladderId: string) => Reservation | undefined;
  getLadderCurrentBorrow: (ladderId: string) => BorrowRecord | undefined;
  getReservationBorrowRecord: (reservationId: string) => BorrowRecord | undefined;
  getBorrowReturnRecord: (borrowRecordId: string) => ReturnRecord | undefined;

  getOverdueReservations: () => Reservation[];
  getOverdueBorrowRecords: () => { borrow: BorrowRecord; reservation: Reservation; ladder: Ladder }[];
}

const STORAGE_KEY = 'ladder-sharing-store';

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      ladders: getInitialLadders(),
      reservations: [],
      borrowRecords: [],
      returnRecords: [],

      initSampleData: () => {
        const { sampleReservations, sampleBorrowRecords } = getSampleData();
        set({
          reservations: sampleReservations,
          borrowRecords: sampleBorrowRecords,
        });
        get().refreshLadderStatuses();
      },

      checkTimeConflict: (ladderId, startTime, expectedEndTime, excludeReservationId) => {
        const state = get();
        const newStart = new Date(startTime).getTime();
        const newEnd = new Date(expectedEndTime).getTime();

        if (newEnd <= newStart) {
          return { hasConflict: true };
        }

        const activeReservations = state.reservations.filter((r) => {
          if (r.ladderId !== ladderId) return false;
          if (excludeReservationId && r.id === excludeReservationId) return false;
          if (r.status === ReservationStatus.CANCELLED) return false;
          if (r.status === ReservationStatus.COMPLETED) return false;

          const rStart = new Date(r.startTime).getTime();
          const rEnd = new Date(r.expectedEndTime).getTime();
          const overlap = newStart < rEnd && newEnd > rStart;
          return overlap;
        });

        if (activeReservations.length === 0) {
          return { hasConflict: false };
        }

        const conflictReservation = activeReservations[0];
        const nextAvailableTime = conflictReservation.expectedEndTime;

        return { hasConflict: true, conflictReservation, nextAvailableTime };
      },

      createReservation: (data) => {
        const state = get();

        const conflict = get().checkTimeConflict(
          data.ladderId,
          data.startTime,
          data.expectedEndTime
        );

        if (conflict.hasConflict) {
          if (conflict.nextAvailableTime) {
            return {
              success: false,
              message: `时段冲突，该梯子预计 ${new Date(
                conflict.nextAvailableTime
              ).toLocaleString('zh-CN')} 后可取`,
            };
          }
          return { success: false, message: '时段冲突，请选择其他时间' };
        }

        const reservation: Reservation = {
          ...data,
          id: generateId(),
          status: ReservationStatus.PENDING,
          createdAt: new Date().toISOString(),
        };

        const newReservations = [...state.reservations, reservation];
        set({ reservations: newReservations });
        get().refreshLadderStatuses();

        return { success: true, message: '预约成功！', reservation };
      },

      confirmBorrow: (reservationId, operator = '管理员') => {
        const state = get();
        const reservation = state.reservations.find((r) => r.id === reservationId);

        if (!reservation) {
          return { success: false, message: '预约记录不存在' };
        }
        if (reservation.status !== ReservationStatus.PENDING) {
          return { success: false, message: '该预约状态不可借出' };
        }

        const borrowRecord: BorrowRecord = {
          id: generateId(),
          reservationId,
          borrowTime: new Date().toISOString(),
          operator,
        };

        const updatedReservations = state.reservations.map((r) =>
          r.id === reservationId ? { ...r, status: ReservationStatus.BORROWED as const } : r
        );

        set({
          reservations: updatedReservations,
          borrowRecords: [...state.borrowRecords, borrowRecord],
        });
        get().refreshLadderStatuses();

        return { success: true, message: '借出登记成功！' };
      },

      confirmReturn: (borrowRecordId, damageLevel, damageDescription, damagePhoto) => {
        const state = get();
        const borrowRecord = state.borrowRecords.find((br) => br.id === borrowRecordId);

        if (!borrowRecord) {
          return { success: false, message: '借出记录不存在' };
        }
        if (state.returnRecords.find((rr) => rr.borrowRecordId === borrowRecordId)) {
          return { success: false, message: '该借出记录已归还' };
        }

        const returnRecord: ReturnRecord = {
          id: generateId(),
          borrowRecordId,
          returnTime: new Date().toISOString(),
          damageLevel,
          damageDescription,
          damagePhoto,
        };

        const updatedReservations = state.reservations.map((r) =>
          r.id === borrowRecord.reservationId
            ? { ...r, status: ReservationStatus.COMPLETED as const }
            : r
        );

        set({
          reservations: updatedReservations,
          returnRecords: [...state.returnRecords, returnRecord],
        });
        get().refreshLadderStatuses();

        return { success: true, message: '归还登记成功！感谢您的配合' };
      },

      cancelReservation: (reservationId) => {
        const state = get();
        const reservation = state.reservations.find((r) => r.id === reservationId);

        if (!reservation) {
          return { success: false, message: '预约记录不存在' };
        }
        if (reservation.status !== ReservationStatus.PENDING) {
          return { success: false, message: '该状态不可取消' };
        }

        const updatedReservations = state.reservations.map((r) =>
          r.id === reservationId ? { ...r, status: ReservationStatus.CANCELLED as const } : r
        );

        set({ reservations: updatedReservations });
        get().refreshLadderStatuses();

        return { success: true, message: '预约已取消' };
      },

      getLadderStatus: (ladderId) => {
        const state = get();
        const now = new Date().getTime();

        const activeBorrow = state.borrowRecords.find((br) => {
          const reservation = state.reservations.find((r) => r.id === br.reservationId);
          if (!reservation || reservation.ladderId !== ladderId) return false;
          const hasReturn = state.returnRecords.some((rr) => rr.borrowRecordId === br.id);
          return !hasReturn;
        });

        if (activeBorrow) {
          const reservation = state.reservations.find((r) => r.id === activeBorrow.reservationId)!;
          const expectedEnd = new Date(reservation.expectedEndTime).getTime();
          if (now > expectedEnd) {
            return LadderStatus.OVERDUE;
          }
          return LadderStatus.BORROWED;
        }

        const pendingReservation = state.reservations.find((r) => {
          if (r.ladderId !== ladderId) return false;
          if (r.status !== ReservationStatus.PENDING) return false;
          const rStart = new Date(r.startTime).getTime();
          return now <= rStart;
        });

        if (pendingReservation) {
          return LadderStatus.RESERVED;
        }

        return LadderStatus.AVAILABLE;
      },

      refreshLadderStatuses: () => {
        const state = get();
        const updatedLadders = state.ladders.map((ladder) => ({
          ...ladder,
          status: get().getLadderStatus(ladder.id),
        }));
        set({ ladders: updatedLadders });
      },

      getLadderCurrentReservation: (ladderId) => {
        const state = get();
        return state.reservations
          .filter((r) => r.ladderId === ladderId && r.status === ReservationStatus.PENDING)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
      },

      getLadderCurrentBorrow: (ladderId) => {
        const state = get();
        return state.borrowRecords.find((br) => {
          const reservation = state.reservations.find((r) => r.id === br.reservationId);
          if (!reservation || reservation.ladderId !== ladderId) return false;
          return !state.returnRecords.some((rr) => rr.borrowRecordId === br.id);
        });
      },

      getReservationBorrowRecord: (reservationId) => {
        const state = get();
        return state.borrowRecords.find((br) => br.reservationId === reservationId);
      },

      getBorrowReturnRecord: (borrowRecordId) => {
        const state = get();
        return state.returnRecords.find((rr) => rr.borrowRecordId === borrowRecordId);
      },

      getOverdueReservations: () => {
        const state = get();
        const now = new Date().getTime();
        return state.reservations.filter((r) => {
          if (r.status === ReservationStatus.COMPLETED) return false;
          if (r.status === ReservationStatus.CANCELLED) return false;
          return now > new Date(r.expectedEndTime).getTime();
        });
      },

      getOverdueBorrowRecords: () => {
        const state = get();
        const now = new Date().getTime();
        const result: { borrow: BorrowRecord; reservation: Reservation; ladder: Ladder }[] = [];

        state.borrowRecords.forEach((borrow) => {
          const reservation = state.reservations.find((r) => r.id === borrow.reservationId);
          if (!reservation) return;
          if (now <= new Date(reservation.expectedEndTime).getTime()) return;
          if (state.returnRecords.some((rr) => rr.borrowRecordId === borrow.id)) return;

          const ladder = state.ladders.find((l) => l.id === reservation.ladderId);
          if (!ladder) return;

          result.push({ borrow, reservation, ladder });
        });

        return result;
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        ladders: state.ladders,
        reservations: state.reservations,
        borrowRecords: state.borrowRecords,
        returnRecords: state.returnRecords,
      }),
      onRehydrateStorage: () => (state) => {
        state?.refreshLadderStatuses();
      },
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Reservation, ReservationStatus } from '@/types';
import { mockReservations } from '@/utils/mock';
import { isExpired } from '@/utils/date';
import { useBouquetStore } from './bouquetStore';
import { useRecordStore } from './recordStore';

interface ReservationStore {
  reservations: Reservation[];
  createReservation: (data: Omit<Reservation, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => void;
  completeReservation: (id: string, operator: string) => void;
  cancelReservation: (id: string, operator: string, note: string) => void;
  rescheduleReservation: (id: string, newPickupTime: string, operator: string) => void;
  checkTimeoutReservations: () => void;
  getReservationsByStatus: (status: ReservationStatus) => Reservation[];
  getTodayPickups: () => Reservation[];
  getReservationById: (id: string) => Reservation | undefined;
}

export const useReservationStore = create<ReservationStore>()(
  persist(
    (set, get) => ({
      reservations: mockReservations,
      
      createReservation: (data) => {
        const newReservation: Reservation = {
          ...data,
          id: `rs${Date.now()}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set((state) => ({
          reservations: [newReservation, ...state.reservations],
        }));
        
        useBouquetStore.getState().updateReservedCount(data.bouquetId, data.quantity);
        
        useRecordStore.getState().addRecord({
          reservationId: newReservation.id,
          customerName: data.customerName,
          bouquetName: data.bouquetName,
          type: 'create',
          operator: '店员',
          note: '创建预留',
        });
      },
      
      completeReservation: (id, operator) => {
        const reservation = get().getReservationById(id);
        if (!reservation) return;
        
        set((state) => ({
          reservations: state.reservations.map(r =>
            r.id === id ? { ...r, status: 'completed' as ReservationStatus, updatedAt: new Date().toISOString() } : r
          ),
        }));
        
        useBouquetStore.getState().decreaseStock(reservation.bouquetId, reservation.quantity);
        
        useRecordStore.getState().addRecord({
          reservationId: id,
          customerName: reservation.customerName,
          bouquetName: reservation.bouquetName,
          type: 'complete',
          operator,
          note: '确认取花',
        });
      },
      
      cancelReservation: (id, operator, note) => {
        const reservation = get().getReservationById(id);
        if (!reservation) return;
        
        set((state) => ({
          reservations: state.reservations.map(r =>
            r.id === id ? { ...r, status: 'cancelled' as ReservationStatus, updatedAt: new Date().toISOString() } : r
          ),
        }));
        
        useBouquetStore.getState().updateReservedCount(reservation.bouquetId, -reservation.quantity);
        
        useRecordStore.getState().addRecord({
          reservationId: id,
          customerName: reservation.customerName,
          bouquetName: reservation.bouquetName,
          type: 'cancel',
          operator,
          note,
        });
      },
      
      rescheduleReservation: (id, newPickupTime, operator) => {
        const reservation = get().getReservationById(id);
        if (!reservation) return;
        
        set((state) => ({
          reservations: state.reservations.map(r =>
            r.id === id ? { 
              ...r, 
              pickupTime: newPickupTime, 
              status: 'pending' as ReservationStatus,
              updatedAt: new Date().toISOString(),
            } : r
          ),
        }));
        
        useRecordStore.getState().addRecord({
          reservationId: id,
          customerName: reservation.customerName,
          bouquetName: reservation.bouquetName,
          type: 'reschedule',
          operator,
          note: `改期至 ${new Date(newPickupTime).toLocaleString()}`,
        });
      },
      
      checkTimeoutReservations: () => {
        const { reservations } = get();
        const now = new Date();
        
        reservations.forEach((reservation) => {
          if (reservation.status === 'pending' && isExpired(reservation.pickupTime)) {
            const pickupTime = new Date(reservation.pickupTime);
            const diffMinutes = (now.getTime() - pickupTime.getTime()) / (1000 * 60);
            
            if (diffMinutes > 30) {
              set((state) => ({
                reservations: state.reservations.map(r =>
                  r.id === reservation.id ? { ...r, status: 'to_confirm' as ReservationStatus, updatedAt: new Date().toISOString() } : r
                ),
              }));
              
              useBouquetStore.getState().updateReservedCount(reservation.bouquetId, -reservation.quantity);
              
              useRecordStore.getState().addRecord({
                reservationId: reservation.id,
                customerName: reservation.customerName,
                bouquetName: reservation.bouquetName,
                type: 'timeout',
                operator: '系统',
                note: '取花时间已过30分钟，自动转为待确认状态',
              });
            }
          }
        });
      },
      
      getReservationsByStatus: (status) => {
        return get().reservations.filter(r => r.status === status);
      },
      
      getTodayPickups: () => {
        const today = new Date();
        return get().reservations.filter(r => {
          const pickupDate = new Date(r.pickupTime);
          return pickupDate.getDate() === today.getDate() &&
            pickupDate.getMonth() === today.getMonth() &&
            pickupDate.getFullYear() === today.getFullYear() &&
            (r.status === 'pending' || r.status === 'to_confirm');
        }).sort((a, b) => new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime());
      },
      
      getReservationById: (id) => {
        return get().reservations.find(r => r.id === id);
      },
    }),
    {
      name: 'reservation-storage',
    }
  )
);

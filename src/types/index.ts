import type { Seat, Reservation } from '../../shared/types';

export * from '../../shared/types';

export type UserRole = 'student' | 'teacher';

export interface SeatWithStatus extends Seat {
  status: 'available' | 'reserved' | 'checked_in' | 'no_show';
  reservation?: Reservation;
}

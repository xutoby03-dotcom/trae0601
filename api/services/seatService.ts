import { db } from '../data/store';
import type { Seat, SeatRegistrationForm } from '../types';
import { SeatStatus } from '../types';

export const seatService = {
  list(building?: string, room?: string) {
    db.checkAndUpdateTimeouts();
    return db.getSeats(building, room);
  },

  getById(id: string) {
    db.checkAndUpdateTimeouts();
    return db.getSeatById(id);
  },

  register(form: SeatRegistrationForm): Seat {
    let status = SeatStatus.IN_USE;
    const extras: Partial<Seat> = {
      registeredBy: form.registeredBy,
      contact: form.contact,
      expectedLeaveAt: form.expectedLeaveAt,
      registeredAt: Date.now(),
    };
    if (form.tempLeave && form.tempLeaveMinutes) {
      status = SeatStatus.TEMP_LEAVE;
      extras.tempLeaveUntil = Date.now() + form.tempLeaveMinutes * 60000;
    }
    return db.addSeat({
      building: form.building,
      room: form.room,
      seatNumber: form.seatNumber,
      status,
      ...extras,
    });
  },

  updateStatus(id: string, status: SeatStatus, extra?: Partial<Seat>) {
    return db.updateSeatStatus(id, status, extra);
  },

  markTempLeave(id: string, minutes: number) {
    return db.updateSeatStatus(id, SeatStatus.TEMP_LEAVE, {
      tempLeaveUntil: Date.now() + minutes * 60000,
    });
  },

  returnFromTemp(id: string) {
    const seat = db.getSeatById(id);
    if (!seat) return undefined;
    return db.updateSeatStatus(id, SeatStatus.IN_USE, { tempLeaveUntil: undefined });
  },

  release(id: string) {
    return db.resetSeat(id, false);
  },
};

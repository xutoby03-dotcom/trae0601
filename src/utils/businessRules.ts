import type { NoiseLevel, SoundproofLevel, Booking, Room } from '@/types';

export const NOISE_LEVEL_ORDER: Record<NoiseLevel, number> = {
  low: 0,
  medium: 1,
  high: 2,
  extreme: 3,
};

export const SOUNDPROOF_LEVEL_ORDER: Record<SoundproofLevel, number> = {
  basic: 0,
  standard: 1,
  high: 2,
  professional: 3,
};

export function checkNoiseMatch(
  instrumentNoiseLevel: NoiseLevel,
  roomSoundproofLevel: SoundproofLevel,
): boolean {
  return (
    NOISE_LEVEL_ORDER[instrumentNoiseLevel] <=
    SOUNDPROOF_LEVEL_ORDER[roomSoundproofLevel]
  );
}

export function checkTimeConflict(
  existingBookings: Booking[],
  roomId: string,
  startTime: Date,
  endTime: Date,
  excludeBookingId?: string,
): Booking[] {
  return existingBookings.filter((booking) => {
    if (excludeBookingId && booking.id === excludeBookingId) return false;
    if (booking.roomId !== roomId) return false;
    if (
      booking.status === 'cancelled' ||
      booking.status === 'rejected' ||
      booking.status === 'no_show' ||
      booking.status === 'waitlisted'
    ) {
      return false;
    }
    const bookingStart = new Date(booking.startTime).getTime();
    const bookingEnd = new Date(booking.endTime).getTime();
    const newStart = new Date(startTime).getTime();
    const newEnd = new Date(endTime).getTime();
    return newStart < bookingEnd && newEnd > bookingStart;
  });
}

export function calculateDurationHours(
  startTime: Date,
  endTime: Date,
): number {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  return (end - start) / (1000 * 60 * 60);
}

export function needsApproval(
  startTime: Date,
  endTime: Date,
): boolean {
  return calculateDurationHours(startTime, endTime) > 4;
}

export function getCheckinDeadline(startTime: Date): Date {
  return new Date(new Date(startTime).getTime() + 15 * 60 * 1000);
}

export function shouldAutoRelease(booking: Booking): boolean {
  if (booking.status !== 'waiting_checkin') return false;
  const now = new Date().getTime();
  const deadline = getCheckinDeadline(booking.startTime).getTime();
  return now > deadline;
}

export function getEarliestAvailableTime(
  room: Room,
  bookings: Booking[],
  preferredStart: Date,
  durationMinutes: number,
): Date | null {
  const preferred = new Date(preferredStart);
  const durationMs = durationMinutes * 60 * 1000;

  const [openHour, openMinute] = room.openTimeStart.split(':').map(Number);
  const [closeHour, closeMinute] = room.openTimeEnd.split(':').map(Number);

  function getRoomOpen(date: Date): Date {
    const d = new Date(date);
    d.setHours(openHour, openMinute, 0, 0);
    return d;
  }

  function getRoomClose(date: Date): Date {
    const d = new Date(date);
    d.setHours(closeHour, closeMinute, 0, 0);
    return d;
  }

  let candidateStart = new Date(Math.max(preferred.getTime(), getRoomOpen(preferred).getTime()));

  for (let attempts = 0; attempts < 30; attempts++) {
    const candidateEnd = new Date(candidateStart.getTime() + durationMs);
    const dayClose = getRoomClose(candidateStart);

    if (candidateEnd.getTime() > dayClose.getTime()) {
      const nextDay = new Date(candidateStart);
      nextDay.setDate(nextDay.getDate() + 1);
      candidateStart = getRoomOpen(nextDay);
      continue;
    }

    const conflicts = checkTimeConflict(
      bookings,
      room.id,
      candidateStart,
      candidateEnd,
    );

    if (conflicts.length === 0) {
      return candidateStart;
    }

    const latestConflictEnd = conflicts.reduce((latest, b) => {
      const endTime = new Date(b.endTime).getTime();
      return endTime > latest ? endTime : latest;
    }, 0);
    candidateStart = new Date(latestConflictEnd);
  }

  return null;
}

export function generateRoomImageUrl(roomId: string): string {
  return `https://picsum.photos/seed/${roomId}/800/600`;
}

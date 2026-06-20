import type { CanvasDevice, BookingRecord } from '@/types';

export const checkConflicts = (
  devices: CanvasDevice[],
  bookings: BookingRecord[]
): (BookingRecord & { matchedDevice?: CanvasDevice })[] => {
  const conflicts: (BookingRecord & { matchedDevice?: CanvasDevice })[] = [];
  const bookedIds = new Set(bookings.map((b) => b.deviceId));

  for (const device of devices) {
    for (const booking of bookings) {
      const nameMatch =
        device.model.toLowerCase().includes(booking.deviceModel.toLowerCase()) ||
        device.model.toLowerCase().includes(booking.deviceName.toLowerCase());
      const idMatch = bookedIds.has(booking.deviceId) &&
        booking.deviceId.split('-').some((seg) =>
          device.model.toLowerCase().includes(seg.toLowerCase())
        );

      if (nameMatch || idMatch) {
        if (!conflicts.find((c) => c.deviceId === booking.deviceId)) {
          conflicts.push({ ...booking, conflict: true, matchedDevice: device });
        }
      }
    }
  }

  return conflicts;
};

import type { CourseSlot, MaintenanceWindow } from '../types';

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function calculateMaintenanceWindows(slots: CourseSlot[]): MaintenanceWindow[] {
  const sortedSlots = [...slots].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  );

  const windows: MaintenanceWindow[] = [];
  const dayStart = 0;
  const dayEnd = 24 * 60;

  let lastEnd = dayStart;

  for (const slot of sortedSlots) {
    const slotStart = timeToMinutes(slot.startTime);
    if (slotStart > lastEnd) {
      const duration = slotStart - lastEnd;
      const type = duration >= 45 ? 'recommended' : duration >= 20 ? 'available' : 'short';
      windows.push({
        startTime: minutesToTime(lastEnd),
        endTime: slot.startTime,
        duration,
        type,
        reason: type === 'recommended' ? '适合完整维护' : type === 'available' ? '可快速处理' : '时间较短',
      });
    }
    lastEnd = Math.max(lastEnd, timeToMinutes(slot.endTime));
  }

  if (lastEnd < dayEnd) {
    const duration = dayEnd - lastEnd;
    const type = duration >= 45 ? 'recommended' : duration >= 20 ? 'available' : 'short';
    windows.push({
      startTime: minutesToTime(lastEnd),
      endTime: minutesToTime(dayEnd),
      duration,
      type,
      reason: type === 'recommended' ? '闭馆后充分维护' : type === 'available' ? '可快速处理' : '时间较短',
    });
  }

  return windows;
}

export function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getNextWindow(windows: MaintenanceWindow[]): MaintenanceWindow | null {
  const current = getCurrentTimeMinutes();
  const upcoming = windows.filter(
    (w) => timeToMinutes(w.startTime) > current
  );
  return upcoming[0] || null;
}

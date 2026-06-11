export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  barberCount: number
): Array<{ time: string; capacity: number }> {
  const slots: Array<{ time: string; capacity: number }> = [];
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  let current = startMinutes;
  while (current + durationMinutes <= endMinutes) {
    const hour = Math.floor(current / 60);
    const min = current % 60;
    const time = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    slots.push({ time, capacity: barberCount });
    current += durationMinutes;
  }
  
  return slots;
}

export function isToday(dateStr: string): boolean {
  const today = formatDate(new Date());
  return dateStr === today;
}

export function getWeekday(dateStr: string): string {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateStr);
  return weekdays[date.getDay()];
}

export function addMinutes(timeStr: string, minutes: number): string {
  const [hour, min] = timeStr.split(':').map(Number);
  const totalMinutes = hour * 60 + min + minutes;
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

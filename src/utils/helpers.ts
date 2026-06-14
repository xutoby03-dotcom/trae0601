import type { Reservation, Student, Classroom, DashboardStats } from '../types';
import { AUTO_RELEASE_MINUTES } from '../types';

export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function checkAndReleaseNoShows(
  reservations: Reservation[],
  autoReleaseMinutes: number = 15
): { updated: Reservation[]; released: string[] } {
  const now = new Date();
  const released: string[] = [];

  const updated = reservations.map(r => {
    if (r.status === 'pending') {
      const [startTime] = r.timeSlot.split('-');
      const [hours, minutes] = startTime.split(':').map(Number);
      const slotStart = new Date(r.reservationDate);
      slotStart.setHours(hours, minutes + autoReleaseMinutes, 0, 0);

      if (now > slotStart) {
        released.push(r.id);
        return { ...r, status: 'no_show' as const };
      }
    }
    return r;
  });

  return { updated, released };
}

export function calculateDashboardStats(
  classrooms: Classroom[],
  reservations: Reservation[],
  students: Student[]
): DashboardStats {
  const today = getTodayDateString();
  const todayReservations = reservations.filter(r => r.reservationDate === today);

  const totalSeats = classrooms.reduce((sum, c) => sum + c.seatCount, 0);
  const checkedInCount = todayReservations.filter(r => r.status === 'checked_in').length;
  const pendingCount = todayReservations.filter(r => r.status === 'pending').length;
  const noShowCount = todayReservations.filter(r => r.status === 'no_show').length;
  const usedSeats = checkedInCount + pendingCount;
  const availableSeats = Math.max(0, totalSeats - usedSeats);

  const classMap = new Map<string, { total: number; used: number }>();
  todayReservations.forEach(r => {
    const current = classMap.get(r.className) || { total: 0, used: 0 };
    current.total++;
    if (r.status === 'checked_in') current.used++;
    classMap.set(r.className, current);
  });

  const classUsage = Array.from(classMap.entries())
    .map(([className, { total, used }]) => ({
      className,
      total,
      used,
      usageRate: total > 0 ? Math.round((used / total) * 100) : 0,
    }))
    .sort((a, b) => b.usageRate - a.usageRate);

  const frequentNoShows = students
    .filter(s => s.noShowCount >= 2)
    .map(s => ({
      id: s.id,
      studentId: s.id,
      name: s.name,
      className: s.className,
      count: s.noShowCount,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalSeats,
    availableSeats,
    checkedInCount,
    pendingCount,
    noShowCount,
    classUsage,
    frequentNoShows,
  };
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: '待签到',
    checked_in: '已签到',
    no_show: '未签到',
    cancelled: '已取消',
    left_early: '已离开',
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700 border-amber-200',
    checked_in: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    no_show: 'bg-red-100 text-red-700 border-red-200',
    cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
    left_early: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
}

export function getChangeTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    leave: '临时请假',
    seat_change: '更换座位',
    early_leave: '提前离开',
  };
  return labels[type] || type;
}

export function getChangeTypeColor(type: string): string {
  const colors: Record<string, string> = {
    leave: 'bg-orange-100 text-orange-700',
    seat_change: 'bg-blue-100 text-blue-700',
    early_leave: 'bg-purple-100 text-purple-700',
  };
  return colors[type] || 'bg-gray-100 text-gray-700';
}

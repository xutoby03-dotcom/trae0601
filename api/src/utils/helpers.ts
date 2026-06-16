import type { Course, Seat } from '../../../shared/types';

export const findAvailableSeat = (
  course: Course,
  needsOutlet: boolean
): Seat | null => {
  for (const row of course.seats) {
    for (const seat of row) {
      if (
        seat.type === 'auditor' &&
        seat.status === 'available' &&
        (!needsOutlet || seat.hasOutlet)
      ) {
        return seat;
      }
    }
  }
  if (!needsOutlet) {
    return null;
  }
  for (const row of course.seats) {
    for (const seat of row) {
      if (seat.type === 'auditor' && seat.status === 'available') {
        return seat;
      }
    }
  }
  return null;
};

export const calculateAisleRiskScore = (course: Course): number => {
  const approvedCount = course.seats.flat().filter(
    (s) => s.status === 'reserved' || s.status === 'checked_in'
  ).length;

  const auditorSeats = course.seats.flat().filter(
    (s) => s.type === 'auditor'
  ).length;

  if (auditorSeats === 0) return 0;

  const utilizationRate = approvedCount / auditorSeats;

  const aisleCount = course.seats.flat().filter(
    (s) => s.type === 'aisle'
  ).length;

  const totalSeats = course.seats.flat().length;
  const aisleDensity = aisleCount / totalSeats;

  let riskScore = utilizationRate * 100;
  if (utilizationRate > 0.8) {
    riskScore += 20;
  }
  if (aisleDensity < 0.1) {
    riskScore += 15;
  }

  return Math.min(Math.round(riskScore), 100);
};

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

export const formatTime = (time: string): string => {
  return time;
};

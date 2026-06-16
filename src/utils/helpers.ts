import type { Course, Seat } from '../types';

export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
};

export const formatShortDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });
};

export const formatDateTime = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRiskLevel = (score: number): { level: string; color: string } => {
  if (score >= 80) return { level: '高风险', color: 'text-red-600 bg-red-100' };
  if (score >= 50) return { level: '中风险', color: 'text-yellow-600 bg-yellow-100' };
  return { level: '低风险', color: 'text-green-600 bg-green-100' };
};

export const getSeatPosition = (seat: Seat): string => {
  return `第${seat.row + 1}排第${seat.col + 1}座`;
};

export const calculateAisleRisk = (course: Course): number => {
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

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

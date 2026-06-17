import { Vehicle, Seat, Installation, Inspection } from '@/types';
import { daysFromNow, daysBetween, formatDate } from './date';

export interface VehicleRecheckInfo {
  vehicle: Vehicle;
  seat?: Seat;
  installation?: Installation;
  lastInspection?: Inspection;
  daysSinceLastInspection: number;
  status: 'normal' | 'warning' | 'danger';
}

export interface SeatExpiryInfo {
  seat: Seat;
  daysUntilExpiry: number;
  status: 'normal' | 'warning' | 'danger';
}

export interface InspectionStats {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  last30Days: {
    total: number;
    passed: number;
    passRate: number;
  };
}

export const getVehicleRecheckInfo = (
  vehicle: Vehicle,
  installations: Installation[],
  inspections: Inspection[],
  seats: Seat[]
): VehicleRecheckInfo => {
  const vehicleInstallations = installations.filter(i => i.vehicleId === vehicle.id);
  const latestInstallation = vehicleInstallations[vehicleInstallations.length - 1];
  
  const seat = latestInstallation 
    ? seats.find(s => s.id === latestInstallation.seatId) 
    : undefined;

  const relatedInspections = latestInstallation 
    ? inspections.filter(i => i.installationId === latestInstallation.id)
    : [];
  const lastInspection = relatedInspections.reduce((latest, current) =>
    latest ? (new Date(current.date) > new Date(latest.date) ? current : latest) : current
  , relatedInspections[0]);

  const daysSinceLastInspection = lastInspection 
    ? daysBetween(lastInspection.date, new Date())
    : 999;

  let status: 'normal' | 'warning' | 'danger' = 'normal';
  if (daysSinceLastInspection > 45) status = 'danger';
  else if (daysSinceLastInspection > 30) status = 'warning';

  return {
    vehicle,
    seat,
    installation: latestInstallation,
    lastInspection,
    daysSinceLastInspection,
    status
  };
};

export const getAllVehicleRecheckInfo = (
  vehicles: Vehicle[],
  installations: Installation[],
  inspections: Inspection[],
  seats: Seat[]
): VehicleRecheckInfo[] => {
  return vehicles
    .map(v => getVehicleRecheckInfo(v, installations, inspections, seats))
    .sort((a, b) => b.daysSinceLastInspection - a.daysSinceLastInspection);
};

export const getSeatExpiryInfo = (seat: Seat): SeatExpiryInfo => {
  const daysUntilExpiry = daysFromNow(seat.expiryDate);
  
  let status: 'normal' | 'warning' | 'danger' = 'normal';
  if (daysUntilExpiry <= 90) status = 'danger';
  else if (daysUntilExpiry <= 180) status = 'warning';

  return {
    seat,
    daysUntilExpiry,
    status
  };
};

export const getAllSeatExpiryInfo = (seats: Seat[]): SeatExpiryInfo[] => {
  return seats
    .map(s => getSeatExpiryInfo(s))
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
};

export const getInspectionStats = (inspections: Inspection[]): InspectionStats => {
  const total = inspections.length;
  const passed = inspections.filter(i => i.passed).length;
  const failed = total - passed;
  const passRate = total > 0 ? (passed / total) * 100 : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const last30Days = inspections.filter(i => new Date(i.date) >= thirtyDaysAgo);
  const last30DaysPassed = last30Days.filter(i => i.passed).length;
  const last30DaysPassRate = last30Days.length > 0 ? (last30DaysPassed / last30Days.length) * 100 : 0;

  return {
    total,
    passed,
    failed,
    passRate,
    last30Days: {
      total: last30Days.length,
      passed: last30DaysPassed,
      passRate: last30DaysPassRate
    }
  };
};

export const getLongestUnrecheckedVehicle = (
  vehicles: Vehicle[],
  installations: Installation[],
  inspections: Inspection[],
  seats: Seat[]
): VehicleRecheckInfo | null => {
  const info = getAllVehicleRecheckInfo(vehicles, installations, inspections, seats);
  return info.length > 0 ? info[0] : null;
};

export const getExpiringSeats = (seats: Seat[], thresholdDays: number = 180): SeatExpiryInfo[] => {
  return getAllSeatExpiryInfo(seats)
    .filter(s => s.daysUntilExpiry <= thresholdDays);
};

export const getVehicleLastInspectionDate = (
  vehicleId: string,
  installations: Installation[],
  inspections: Inspection[]
): string | null => {
  const vehicleInstallations = installations.filter(i => i.vehicleId === vehicleId);
  const relatedInspections = inspections.filter(i => 
    vehicleInstallations.some(vi => vi.id === i.installationId)
  );
  
  if (relatedInspections.length === 0) return null;
  
  const latest = relatedInspections.reduce((a, b) => 
    new Date(a.date) > new Date(b.date) ? a : b
  );
  return latest.date;
};

export const formatStatusText = (status: 'normal' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'normal': return '正常';
    case 'warning': return '警告';
    case 'danger': return '危险';
  }
};

export const formatStatusColor = (status: 'normal' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'normal': return 'text-success';
    case 'warning': return 'text-warning';
    case 'danger': return 'text-danger';
  }
};

export const formatStatusBgColor = (status: 'normal' | 'warning' | 'danger'): string => {
  switch (status) {
    case 'normal': return 'bg-emerald-100 text-emerald-700';
    case 'warning': return 'bg-amber-100 text-amber-700';
    case 'danger': return 'bg-red-100 text-red-700';
  }
};

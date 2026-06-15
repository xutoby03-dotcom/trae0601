import type {
  Medicine,
  DosageSchedule,
  PackingSlot,
  MedicationRecord,
  TimeSlot,
} from '@/types';
import { daysBetween, formatDate, getMonthStart, getMonthEnd, parseDate } from './dateUtils';

export interface LowStockAlert {
  medicine: Medicine;
  dailyUsage: number;
  daysRemaining: number;
  needRefill: boolean;
}

export interface ExpiryAlert {
  medicine: Medicine;
  daysToExpiry: number;
  isUrgent: boolean;
}

export interface VisitAlert {
  medicine: Medicine;
  schedule: DosageSchedule;
  daysToVisit: number;
  isUrgent: boolean;
}

export interface MissedStats {
  totalMissed: number;
  totalTaken: number;
  totalVomited: number;
  weeklyDistribution: number[];
  byMedicine: { medicineId: string; medicineName: string; count: number }[];
}

export function calculateDailyUsage(
  medicineId: string,
  schedules: DosageSchedule[]
): number {
  return schedules
    .filter((s) => s.medicineId === medicineId)
    .reduce((sum, s) => sum + s.pillsPerTime, 0);
}

export function getLowStockAlerts(
  medicines: Medicine[],
  schedules: DosageSchedule[]
): LowStockAlert[] {
  return medicines
    .map((m) => {
      const dailyUsage = calculateDailyUsage(m.id, schedules);
      const daysRemaining = dailyUsage > 0 ? Math.floor(m.remainingPills / dailyUsage) : 999;
      return {
        medicine: m,
        dailyUsage,
        daysRemaining,
        needRefill: dailyUsage > 0 && daysRemaining < 7,
      };
    })
    .filter((a) => a.needRefill)
    .sort((a, b) => a.daysRemaining - b.daysRemaining);
}

export function getExpiryAlerts(medicines: Medicine[]): ExpiryAlert[] {
  const today = formatDate(new Date());
  return medicines
    .map((m) => {
      const daysToExpiry = daysBetween(today, m.expiryDate);
      return {
        medicine: m,
        daysToExpiry,
        isUrgent: daysToExpiry <= 30,
      };
    })
    .filter((a) => a.isUrgent)
    .sort((a, b) => a.daysToExpiry - b.daysToExpiry);
}

export function getVisitAlerts(
  medicines: Medicine[],
  schedules: DosageSchedule[]
): VisitAlert[] {
  const today = formatDate(new Date());
  const alerts: VisitAlert[] = [];

  schedules.forEach((s) => {
    if (s.nextVisitDate) {
      const medicine = medicines.find((m) => m.id === s.medicineId);
      if (medicine) {
        const daysToVisit = daysBetween(today, s.nextVisitDate);
        if (daysToVisit <= 14) {
          alerts.push({
            medicine,
            schedule: s,
            daysToVisit,
            isUrgent: daysToVisit <= 7,
          });
        }
      }
    }
  });

  return alerts.sort((a, b) => a.daysToVisit - b.daysToVisit);
}

export function getMissedStats(
  records: MedicationRecord[],
  slots: PackingSlot[],
  medicines: Medicine[],
  schedules: DosageSchedule[],
  monthDate: Date
): MissedStats {
  const monthStart = formatDate(getMonthStart(monthDate));
  const monthEnd = formatDate(getMonthEnd(monthDate));

  const monthSlotIds = slots
    .filter((s) => s.date >= monthStart && s.date <= monthEnd)
    .map((s) => s.id);

  const monthRecords = records.filter((r) => monthSlotIds.includes(r.slotId));

  const totalMissed = monthRecords.filter((r) => r.status === 'missed').length;
  const totalTaken = monthRecords.filter((r) => r.status === 'taken').length;
  const totalVomited = monthRecords.filter((r) => r.status === 'vomited').length;

  const weeklyDistribution = [0, 0, 0, 0, 0];
  monthRecords
    .filter((r) => r.status === 'missed')
    .forEach((r) => {
      const slot = slots.find((s) => s.id === r.slotId);
      if (slot) {
        const weekOfMonth = Math.ceil(parseDate(slot.date).getDate() / 7) - 1;
        const idx = Math.min(weekOfMonth, 4);
        weeklyDistribution[idx]++;
      }
    });

  const byMedicineMap = new Map<string, number>();
  const missedSlotIds = monthRecords
    .filter((r) => r.status === 'missed')
    .map((r) => r.slotId);

  missedSlotIds.forEach((slotId) => {
    const slot = slots.find((s) => s.id === slotId);
    if (slot) {
      const slotSchedules = schedules.filter(
        (s) => s.timeSlot === slot.timeSlot
      );
      slotSchedules.forEach((s) => {
        const current = byMedicineMap.get(s.medicineId) || 0;
        byMedicineMap.set(s.medicineId, current + 1);
      });
    }
  });

  const byMedicine = Array.from(byMedicineMap.entries())
    .map(([medicineId, count]) => ({
      medicineId,
      medicineName: medicines.find((m) => m.id === medicineId)?.name || '未知药品',
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalMissed,
    totalTaken,
    totalVomited,
    weeklyDistribution,
    byMedicine,
  };
}

export function getSlotMedicines(
  timeSlot: TimeSlot,
  schedules: DosageSchedule[],
  medicines: Medicine[]
): { schedule: DosageSchedule; medicine: Medicine }[] {
  return schedules
    .filter((s) => s.timeSlot === timeSlot)
    .map((s) => ({
      schedule: s,
      medicine: medicines.find((m) => m.id === s.medicineId)!,
    }))
    .filter((x) => x.medicine);
}

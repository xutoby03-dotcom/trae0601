import type { Medicine, DosageSchedule, PackingItem, ValidationError, TimeSlot } from '@/types';
import { daysBetween, formatDate } from './dateUtils';

export interface PackingValidationInput {
  medicines: Medicine[];
  schedules: DosageSchedule[];
  selectedItems: { medicineId: string; pillsCount: number }[];
  timeSlot: TimeSlot;
}

export function validatePacking(input: PackingValidationInput): ValidationError[] {
  const errors: ValidationError[] = [];
  const { medicines, schedules, selectedItems, timeSlot } = input;

  const relevantSchedules = schedules.filter((s) => s.timeSlot === timeSlot);

  relevantSchedules.forEach((schedule) => {
    const medicine = medicines.find((m) => m.id === schedule.medicineId);
    if (!medicine) return;

    const selected = selectedItems.find((item) => item.medicineId === schedule.medicineId);

    if (!selected || selected.pillsCount === 0) {
      errors.push({
        type: 'missing',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `⚠️ 缺少：${medicine.name}（${medicine.dosage}）应放 ${schedule.pillsPerTime} 片`,
      });
      return;
    }

    if (selected.pillsCount < schedule.pillsPerTime) {
      errors.push({
        type: 'missing',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `⚠️ ${medicine.name} 数量不足：应放 ${schedule.pillsPerTime} 片，当前仅 ${selected.pillsCount} 片`,
      });
    }

    if (selected.pillsCount > schedule.pillsPerTime * 2) {
      errors.push({
        type: 'duplicate',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `⚠️ ${medicine.name} 数量过多：可能重复放置，当前 ${selected.pillsCount} 片`,
      });
    }

    if (medicine.remainingPills < selected.pillsCount) {
      errors.push({
        type: 'insufficient',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `❌ 库存不足：${medicine.name} 仅剩 ${medicine.remainingPills} 片，需要 ${selected.pillsCount} 片`,
      });
    }

    const today = formatDate(new Date());
    const daysToExpiry = daysBetween(today, medicine.expiryDate);
    if (daysToExpiry <= 0) {
      errors.push({
        type: 'expired',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `❌ 药品已过期：${medicine.name} 过期日 ${medicine.expiryDate}`,
      });
    }
  });

  const selectedIds = selectedItems.filter((s) => s.pillsCount > 0).map((s) => s.medicineId);
  selectedIds.forEach((id) => {
    const isInSchedule = relevantSchedules.some((s) => s.medicineId === id);
    if (!isInSchedule) {
      const medicine = medicines.find((m) => m.id === id);
      if (medicine) {
        errors.push({
          type: 'duplicate',
          medicineId: medicine.id,
          medicineName: medicine.name,
          message: `⚠️ ${medicine.name} 不在此时段医嘱中，请确认是否误放`,
        });
      }
    }
  });

  return errors;
}

export function hasFatalErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.type === 'insufficient' || e.type === 'expired');
}

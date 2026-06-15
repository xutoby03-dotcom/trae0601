import type { Medicine, DosageSchedule, ValidationError, TimeSlot } from '@/types';
import { daysBetween, formatDate, formatDateDisplay } from './dateUtils';
import { TIME_SLOT_LABELS } from '@/types';

export interface PackingValidationInput {
  medicines: Medicine[];
  schedules: DosageSchedule[];
  selectedItems: { medicineId: string; pillsCount: number }[];
  timeSlot: TimeSlot;
  date: string;
  hasPhoto: boolean;
}

function makeSlotLabel(date: string, timeSlot: TimeSlot): string {
  return `${formatDateDisplay(date)} ${TIME_SLOT_LABELS[timeSlot].emoji}${TIME_SLOT_LABELS[timeSlot].label}`;
}

export function validatePacking(input: PackingValidationInput): ValidationError[] {
  const errors: ValidationError[] = [];
  const { medicines, schedules, selectedItems, timeSlot, date, hasPhoto } = input;

  const slotLabel = makeSlotLabel(date, timeSlot);
  const relevantSchedules = schedules.filter((s) => s.timeSlot === timeSlot);

  relevantSchedules.forEach((schedule) => {
    const medicine = medicines.find((m) => m.id === schedule.medicineId);
    if (!medicine) return;

    const selected = selectedItems.find((item) => item.medicineId === schedule.medicineId);
    const expected = schedule.pillsPerTime;
    const actual = selected?.pillsCount || 0;

    if (!selected || actual === 0) {
      errors.push({
        type: 'missing',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `❌【${slotLabel}】${medicine.name}（${medicine.dosage}）漏放：应放 ${expected} 片，实际 0 片，差 ${expected} 片`,
        fatal: true,
        expected,
        actual: 0,
      });
      return;
    }

    if (actual < expected) {
      errors.push({
        type: 'missing',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `❌【${slotLabel}】${medicine.name}（${medicine.dosage}）数量不足：应放 ${expected} 片，实际 ${actual} 片，还差 ${expected - actual} 片`,
        fatal: true,
        expected,
        actual,
      });
    }

    if (actual > expected) {
      errors.push({
        type: 'excess',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `❌【${slotLabel}】${medicine.name}（${medicine.dosage}）数量过多：应放 ${expected} 片，实际 ${actual} 片，多放了 ${actual - expected} 片`,
        fatal: true,
        expected,
        actual,
      });
    }

    if (medicine.remainingPills < actual) {
      errors.push({
        type: 'insufficient',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `❌【${slotLabel}】${medicine.name} 库存不足：药盒仅剩 ${medicine.remainingPills} 片，分装需要 ${actual} 片`,
        fatal: true,
      });
    }

    const today = formatDate(new Date());
    const daysToExpiry = daysBetween(today, medicine.expiryDate);
    if (daysToExpiry <= 0) {
      errors.push({
        type: 'expired',
        medicineId: medicine.id,
        medicineName: medicine.name,
        message: `❌【${slotLabel}】${medicine.name} 已过期：过期日 ${medicine.expiryDate}，禁止分装`,
        fatal: true,
      });
    }
  });

  const selectedIds = selectedItems.filter((s) => s.pillsCount > 0).map((s) => s.medicineId);
  selectedIds.forEach((id) => {
    const isInSchedule = relevantSchedules.some((s) => s.medicineId === id);
    if (!isInSchedule) {
      const medicine = medicines.find((m) => m.id === id);
      const item = selectedItems.find((s) => s.medicineId === id);
      if (medicine && item) {
        errors.push({
          type: 'wrongSlot',
          medicineId: medicine.id,
          medicineName: medicine.name,
          message: `❌【${slotLabel}】${medicine.name}（${medicine.dosage}）不属于此时段医嘱，误放了 ${item.pillsCount} 片，请移至正确时段`,
          fatal: true,
          actual: item.pillsCount,
        });
      }
    }
  });

  if (!hasPhoto) {
    errors.push({
      type: 'noPhoto',
      medicineId: '__photo__',
      medicineName: '整盒照片',
      message: `❌【${slotLabel}】未拍摄分装后整盒照片，请拍照或上传后再保存`,
      fatal: true,
    });
  }

  return errors;
}

export function hasFatalErrors(errors: ValidationError[]): boolean {
  return errors.some((e) => e.fatal);
}

export function assertPackingValid(input: PackingValidationInput): void {
  const errors = validatePacking(input);
  if (hasFatalErrors(errors)) {
    const fatalList = errors.filter((e) => e.fatal).map((e) => e.message).join('\n');
    throw new Error(`分装校验不通过，禁止保存：\n${fatalList}`);
  }
}

export type TimeSlot = 'morning' | 'noon' | 'evening' | 'bedtime';

export type PackingStatus = 'pending' | 'packed' | 'recorded';

export type MedicationStatus = 'taken' | 'missed' | 'vomited';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  color: string;
  shape: string;
  remainingPills: number;
  expiryDate: string;
  photoUrl: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface DosageSchedule {
  id: string;
  medicineId: string;
  timeSlot: TimeSlot;
  pillsPerTime: number;
  nextVisitDate?: string;
  notes?: string;
}

export interface PackingSlot {
  id: string;
  date: string;
  timeSlot: TimeSlot;
  status: PackingStatus;
  photoUrl?: string;
  packedAt?: string;
}

export interface PackingItem {
  id: string;
  slotId: string;
  medicineId: string;
  pillsCount: number;
  isVerified: boolean;
}

export interface MedicationRecord {
  id: string;
  slotId: string;
  status: MedicationStatus;
  recordedAt: string;
  notes?: string;
}

export interface ValidationError {
  type: 'missing' | 'insufficient' | 'duplicate' | 'expired';
  medicineId: string;
  medicineName: string;
  message: string;
}

export const TIME_SLOT_LABELS: Record<TimeSlot, { label: string; emoji: string; time: string }> = {
  morning: { label: '早晨', emoji: '🌅', time: '07:00 - 08:00' },
  noon: { label: '中午', emoji: '☀️', time: '12:00 - 13:00' },
  evening: { label: '晚上', emoji: '🌆', time: '18:00 - 19:00' },
  bedtime: { label: '睡前', emoji: '🌙', time: '21:00 - 22:00' },
};

export const MEDICATION_STATUS_LABELS: Record<MedicationStatus, { label: string; color: string; bg: string }> = {
  taken: { label: '已吃', color: 'text-green-700', bg: 'bg-green-100 border-green-400' },
  missed: { label: '漏吃', color: 'text-red-700', bg: 'bg-red-100 border-red-400' },
  vomited: { label: '吐出重服', color: 'text-amber-700', bg: 'bg-amber-100 border-amber-400' },
};

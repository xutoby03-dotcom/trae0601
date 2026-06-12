export interface TargetRange {
  systolicMin: number;
  systolicMax: number;
  diastolicMin: number;
  diastolicMax: number;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface ElderProfile {
  id: string;
  name: string;
  age: number;
  avatar: string;
  medications: string[];
  targetRange: TargetRange;
  emergencyContact: EmergencyContact;
  createdAt: string;
  updatedAt: string;
}

export interface BloodPressureRecord {
  id: string;
  elderId: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  measureTime: string;
  feeling: string;
  photo?: string;
  isAbnormal: boolean;
  needsRetest: boolean;
  retestCompleted: boolean;
  retestRecordId?: string;
  originalRecordId?: string;
  createdAt: string;
}

export type TimeSlot = "morning" | "forenoon" | "noon" | "afternoon" | "evening" | "night";

export interface TimeSlotData {
  slot: TimeSlot;
  label: string;
  count: number;
}

export interface DailyAbnormalData {
  date: string;
  count: number;
}

export interface RetestStats {
  total: number;
  completed: number;
  rate: number;
}

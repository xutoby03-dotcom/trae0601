export type EarSide = 'left' | 'right' | 'both';
export type BatterySize = '10' | '13' | '312' | '675';
export type FeedbackType = 'whistling' | 'sound_low' | 'pain';
export type FeedbackStatus = 'pending' | 'resolved';
export type RecordFilter = 'all' | 'battery' | 'clean';

export interface Device {
  id: string;
  name: string;
  ear: EarSide;
  model: string;
  batterySize: BatterySize;
  storeName: string;
  warrantyDate: string;
  photo?: string;
  nextCheckup?: string;
  batteryLifeDays: number;
  createdAt: string;
}

export interface BatteryRecord {
  id: string;
  deviceId: string;
  date: string;
  remainingPercent: number;
  replacedBy: string;
  hasLeakage: boolean;
  notes?: string;
}

export interface CleanRecord {
  id: string;
  deviceId: string;
  date: string;
  earplug: boolean;
  soundTube: boolean;
  dryBox: boolean;
  microphone: boolean;
  cleanedBy: string;
  notes?: string;
}

export interface Feedback {
  id: string;
  deviceId: string;
  date: string;
  type: FeedbackType;
  description: string;
  status: FeedbackStatus;
}

export interface ChecklistItem {
  id: string;
  feedbackId: string;
  deviceId: string;
  title: string;
  completed: boolean;
  dueDate: string;
  completedAt?: string;
}

export interface BatteryStock {
  size: BatterySize;
  quantity: number;
}

export type AnyRecord = (BatteryRecord & { recordType: 'battery' }) | (CleanRecord & { recordType: 'clean' });

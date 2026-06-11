export interface Pet {
  id: string;
  name: string;
  species: 'dog' | 'cat' | 'other';
  age: number;
  breed: string;
  avatarUrl: string;
  allergies: string;
  foodBrand: string;
  foodAmount: string;
  vaccinePhotoUrl: string;
  notes: string;
  createdAt: string;
}

export type TaskStatus = 'pending' | 'active' | 'completed';

export interface FosterTask {
  id: string;
  petId: string;
  title: string;
  startDate: string;
  endDate: string;
  caretakerName: string;
  caretakerPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  feedingTimesPerDay: number;
  feedingNotes: string;
  walkingRequirements: string;
  medicationInstructions: string;
  initialFoodAmount: number;
  foodUnit: string;
  status: TaskStatus;
  createdAt: string;
}

export interface DailyCheckIn {
  id: string;
  taskId: string;
  checkinDate: string;
  notes: string;
  hasAnomaly: boolean;
  anomalyDescription: string;
  remainingFoodAmount: number;
  createdAt: string;
}

export type CheckInItemType = 'feeding' | 'medication' | 'walking' | 'other';

export interface CheckInItem {
  id: string;
  checkinId: string;
  type: CheckInItemType;
  label: string;
  completed: boolean;
  scheduledTime: string;
  completedAt?: string;
}

export interface CheckInPhoto {
  id: string;
  checkinId: string;
  photoUrl: string;
  caption: string;
  uploadedAt: string;
}

export interface ReviewReport {
  taskId: string;
  totalDays: number;
  completedCheckins: number;
  missedFeedings: number;
  missedMedications: number;
  anomalyRecords: DailyCheckIn[];
  remainingFoodAmount: number;
  initialFoodAmount: number;
  consumedFoodAmount: number;
  suppliesToBuy: string[];
  checkinPhotos: CheckInPhoto[];
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  weight: number;
  allergies: string;
  hospital: string;
  photo: string;
  createdAt: string;
}

export type MealTiming = 'before' | 'after' | 'any';

export interface Medicine {
  id: string;
  petId: string;
  name: string;
  dosage: string;
  frequency: number;
  durationDays: number;
  mealTiming: MealTiming;
  remainingQuantity: number;
  doctorNote: string;
  startDate: string;
  timeSlots: string[];
  createdAt: string;
}

export type FeedingStatus = 'pending' | 'fed' | 'missed' | 'skipped';
export type ReactionType = 'normal' | 'vomiting' | 'low-spirit' | 'good-appetite' | 'other';

export interface FeedingRecord {
  id: string;
  medicineId: string;
  date: string;
  timeSlot: string;
  status: FeedingStatus;
  reaction: ReactionType;
  note: string;
  fedAt: string | null;
}

export interface FeedingTask extends FeedingRecord {
  medicine: Medicine;
  pet: Pet;
}

export type TabType = 'home' | 'pets' | 'medicines' | 'statistics';

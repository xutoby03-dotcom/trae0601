export type Species = "cat" | "dog";
export type DewormType = "internal" | "external";
export type ReminderStatus = "overdue" | "urgent" | "upcoming" | "normal";

export interface Pet {
  id: string;
  name: string;
  species: Species;
  breed: string;
  weight: number;
  weightUnit: "kg" | "lb";
  birthDate: string;
  allergies: string;
  photoUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface DewormRecord {
  id: string;
  petId: string;
  medicineName: string;
  type: DewormType;
  dosage: number;
  dosageUnit: string;
  dateUsed: string;
  nextDate: string;
  operator: string;
  hasAdverseReaction: boolean;
  reactionNote: string;
  createdAt: string;
}

export interface WeightHistory {
  id: string;
  petId: string;
  weight: number;
  recordedAt: string;
}

export interface PetWithNextDeworm extends Pet {
  nextInternalDate?: string;
  nextExternalDate?: string;
  nextInternalStatus?: ReminderStatus;
  nextExternalStatus?: ReminderStatus;
}

export interface PetFormData {
  name: string;
  species: Species;
  breed: string;
  weight: number;
  weightUnit: "kg" | "lb";
  birthDate: string;
  allergies: string;
  photoUrl: string;
}

export interface DewormFormData {
  medicineName: string;
  type: DewormType;
  dosage: number;
  dosageUnit: string;
  dateUsed: string;
  nextDate: string;
  operator: string;
  hasAdverseReaction: boolean;
  reactionNote: string;
}

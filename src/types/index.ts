export type Importance = 'high' | 'medium' | 'low';
export type SupplyCategory = 'water' | 'food' | 'first_aid' | 'equipment' | 'other';

export interface Supply {
  id: string;
  name: string;
  weightGrams: number;
  quantity: number;
  importance: Importance;
  isFragile: boolean;
  category: SupplyCategory;
  isConsumable: boolean;
  photoUrl?: string;
  note?: string;
}

export type StrengthLevel = 1 | 2 | 3 | 4 | 5;

export interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
  strengthLevel: StrengthLevel;
  backpackCapacityKg: number;
  allergies: string[];
  emergencyContactName: string;
  emergencyContactPhone: string;
  confirmed: boolean;
  note?: string;
}

export interface Assignment {
  id: string;
  supplyId: string;
  memberId: string;
  quantityAssigned: number;
  usedSegments: string[];
}

export interface Segment {
  id: string;
  name: string;
  order: number;
}

export interface AppState {
  supplies: Supply[];
  members: Member[];
  assignments: Assignment[];
  segments: Segment[];
}

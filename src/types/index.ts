export type MedicineCategory =
  | 'cold'
  | 'gastro'
  | 'trauma'
  | 'allergy'
  | 'chronic'
  | 'motion'
  | 'other';

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  gender: 'male' | 'female';
  allergies: string;
  chronicConditions: string;
  dedicatedMedicineIds: string[];
  createdAt: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: MedicineCategory;
  applicableTo: string;
  dosage: string;
  expiryDate: string;
  storageLocation: string;
  isPrescription: boolean;
  photoUrl: string;
  stockQuantity: number;
  notes: string;
  createdAt: string;
}

export type TripStatus = 'planning' | 'ongoing' | 'completed';

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  days: number;
  companionIds: string[];
  status: TripStatus;
  notes: string;
  createdAt: string;
}

export interface ConsumptionLog {
  id: string;
  type: 'used' | 'lost';
  quantity: number;
  note: string;
  timestamp: string;
}

export interface TripItem {
  id: string;
  tripId: string;
  medicineId: string;
  suggestedQuantity: number;
  packedQuantity: number;
  packedBy: string;
  isPacked: boolean;
  consumedQuantity: number;
  consumptionLog: ConsumptionLog[];
  addedManually?: boolean;
}

export type MedicineStatus = 'normal' | 'expiring' | 'expired';

export interface AppState {
  familyMembers: FamilyMember[];
  medicines: Medicine[];
  trips: Trip[];
  tripItems: TripItem[];
}

export const CATEGORY_LABELS: Record<MedicineCategory, { label: string; icon: string; color: string }> = {
  cold: { label: '感冒退烧', icon: 'Thermometer', color: 'bg-blue-50 text-blue-700 border-blue-100' },
  gastro: { label: '肠胃用药', icon: 'UtensilsCrossed', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  trauma: { label: '外伤护理', icon: 'Bandage', color: 'bg-rose-50 text-rose-700 border-rose-100' },
  allergy: { label: '过敏用药', icon: 'Flower2', color: 'bg-violet-50 text-violet-700 border-violet-100' },
  chronic: { label: '慢性病药', icon: 'Heart', color: 'bg-red-50 text-red-700 border-red-100' },
  motion: { label: '晕车晕船', icon: 'Car', color: 'bg-cyan-50 text-cyan-700 border-cyan-100' },
  other: { label: '其他药品', icon: 'Pill', color: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export const RELATION_OPTIONS = [
  '本人', '配偶', '父亲', '母亲', '儿子', '女儿', '兄弟', '姐妹', '朋友', '同事', '其他'
];

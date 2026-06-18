export enum MedicineCategory {
  COLD_FEVER = 'cold_fever',
  GASTROINTESTINAL = 'gastro',
  TRAUMA = 'trauma',
  ALLERGY = 'allergy',
  CHRONIC = 'chronic',
  OTHER = 'other'
}

export const CATEGORY_LABELS: Record<MedicineCategory, string> = {
  [MedicineCategory.COLD_FEVER]: '感冒发烧',
  [MedicineCategory.GASTROINTESTINAL]: '肠胃',
  [MedicineCategory.TRAUMA]: '外伤',
  [MedicineCategory.ALLERGY]: '过敏',
  [MedicineCategory.CHRONIC]: '慢病备用',
  [MedicineCategory.OTHER]: '其他'
};

export const CATEGORY_ICONS: Record<MedicineCategory, string> = {
  [MedicineCategory.COLD_FEVER]: 'Thermometer',
  [MedicineCategory.GASTROINTESTINAL]: 'Stomach',
  [MedicineCategory.TRAUMA]: 'Bandage',
  [MedicineCategory.ALLERGY]: 'Shield',
  [MedicineCategory.CHRONIC]: 'Heart',
  [MedicineCategory.OTHER]: 'Pill'
};

export const ESSENTIAL_CATEGORIES: MedicineCategory[] = [
  MedicineCategory.COLD_FEVER,
  MedicineCategory.GASTROINTESTINAL,
  MedicineCategory.TRAUMA,
  MedicineCategory.ALLERGY
];

export type MedicineStatusType = 
  | 'normal' 
  | 'expiring' 
  | 'expired' 
  | 'opened' 
  | 'open_expiring' 
  | 'open_expired';

export interface MedicineStatus {
  status: MedicineStatusType;
  label: string;
  color: 'green' | 'orange' | 'red' | 'blue';
}

export interface Medicine {
  id: string;
  name: string;
  specification: string;
  symptoms: string;
  purchaseDate: string;
  expiryDate: string;
  openDate?: string;
  openExpiryDays?: number;
  location: string;
  quantity: number;
  photo?: string;
  category: MedicineCategory;
  contraindications: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationRecord {
  id: string;
  medicineId?: string;
  medicineName: string;
  userName: string;
  dosage: string;
  symptoms: string;
  needFollowUp: boolean;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  allergies: string[];
  chronicDiseases: string[];
  notes?: string;
}

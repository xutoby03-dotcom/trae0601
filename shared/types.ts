export interface Pet {
  id: number;
  name: string;
  species: 'dog' | 'cat' | 'other';
  breed: string;
  age: number;
  weight: number;
  personality: string;
  sterilized: boolean;
  ownerName: string;
  ownerPhone: string;
  photoUrl?: string;
  medicalHistory?: string;
  allergies?: string;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VaccineRecord {
  id: number;
  petId: number;
  type: 'rabies' | 'cat-triple' | 'dog-quad' | 'deworming' | 'other';
  name: string;
  vaccinationDate: string;
  expiryDate: string;
  certificateUrl?: string;
  status: 'valid' | 'expiring' | 'expired';
  verified: boolean;
  verifiedBy?: number;
  verifiedAt?: string;
  notes?: string;
}

export interface Stay {
  id: number;
  petId: number;
  cageId?: number;
  checkInDate: string;
  checkOutDate?: string;
  actualCheckOut?: string;
  status: 'pending' | 'confirmed' | 'checked-in' | 'checked-out' | 'cancelled';
  vaccinationVerified: boolean;
  requiresIsolation: boolean;
  highRisk: boolean;
  highRiskReason?: string;
  assignedStaffId?: number;
  notes?: string;
  createdAt: string;
}

export interface DailyRecord {
  id: number;
  stayId: number;
  recordDate: string;
  feeding: string;
  defecation: 'normal' | 'soft' | 'diarrhea' | 'constipation' | 'none';
  defecationCount: number;
  mentalState: 'excellent' | 'good' | 'fair' | 'poor';
  waterIntake?: string;
  exercise?: string;
  abnormal: boolean;
  abnormalDescription?: string;
  abnormalPhotos?: string[];
  handlingMeasures?: string;
  recordedBy: number;
  createdAt: string;
}

export interface Cage {
  id: number;
  code: string;
  name: string;
  type: 'normal' | 'isolation';
  suitableFor: 'dog' | 'cat' | 'both';
  size: 'small' | 'medium' | 'large';
  status: 'available' | 'occupied' | 'maintenance';
  currentStayId?: number;
  notes?: string;
}

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'reception' | 'caregiver';
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface VaccinationCheckResult {
  petId: number;
  overallPass: boolean;
  checks: {
    type: string;
    name: string;
    required: boolean;
    hasRecord: boolean;
    status: 'valid' | 'expiring' | 'expired' | 'missing';
    expiryDate?: string;
    daysRemaining?: number;
    message: string;
  }[];
  missingDocuments: string[];
  warnings: string[];
}

export interface DashboardStats {
  todayCheckIn: number;
  todayCheckOut: number;
  currentlyStaying: number;
  pendingMaterials: number;
  isolationCount: number;
  highRiskCount: number;
}

export interface ExpiringVaccineItem {
  pet: Pet;
  vaccine: VaccineRecord;
  daysRemaining: number;
}

export interface PendingMaterialItem {
  pet: Pet;
  stay?: Stay;
  missingItems: string[];
  submittedAt: string;
}

export interface HighRiskItem {
  pet: Pet;
  stay: Stay;
  riskReasons: string[];
}

export type VaccineType = 'rabies' | 'cat-triple' | 'dog-quad' | 'deworming' | 'other';

export const VACCINE_TYPE_NAMES: Record<VaccineType, string> = {
  'rabies': '狂犬疫苗',
  'cat-triple': '猫三联',
  'dog-quad': '犬四联',
  'deworming': '驱虫',
  'other': '其他'
};

export const SPECIES_NAMES: Record<Pet['species'], string> = {
  'dog': '犬',
  'cat': '猫',
  'other': '其他'
};

export const STATUS_NAMES: Record<Stay['status'], string> = {
  'pending': '待确认',
  'confirmed': '已确认',
  'checked-in': '已入住',
  'checked-out': '已退房',
  'cancelled': '已取消'
};

export const MENTAL_STATE_NAMES: Record<DailyRecord['mentalState'], string> = {
  'excellent': '优秀',
  'good': '良好',
  'fair': '一般',
  'poor': '较差'
};

export const DEFECATION_NAMES: Record<DailyRecord['defecation'], string> = {
  'normal': '正常',
  'soft': '偏软',
  'diarrhea': '腹泻',
  'constipation': '便秘',
  'none': '无'
};

export const VACCINE_RULES = {
  dog: {
    required: ['rabies', 'dog-quad'] as VaccineType[],
    optional: ['deworming'] as VaccineType[],
    validityPeriods: {
      'rabies': 365,
      'dog-quad': 365,
      'deworming': 90,
      'cat-triple': 365,
      'other': 365
    }
  },
  cat: {
    required: ['rabies', 'cat-triple'] as VaccineType[],
    optional: ['deworming'] as VaccineType[],
    validityPeriods: {
      'rabies': 365,
      'cat-triple': 365,
      'deworming': 90,
      'dog-quad': 365,
      'other': 365
    }
  },
  other: {
    required: ['rabies'] as VaccineType[],
    optional: ['deworming'] as VaccineType[],
    validityPeriods: {
      'rabies': 365,
      'deworming': 90,
      'cat-triple': 365,
      'dog-quad': 365,
      'other': 365
    }
  }
};

export const EXPIRING_WARNING_DAYS = 30;
export const URGENT_WARNING_DAYS = 7;

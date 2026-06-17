export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  personality: string[];
  foodAmount: number;
  dietaryRestrictions: string[];
  hospital: {
    name: string;
    phone: string;
    address: string;
  };
  photos: string[];
}

export interface Task {
  id: string;
  petId: string;
  date: string;
  time: string;
  accessMethod: string;
  keyLocation: string;
  foodGrams: number;
  medication: string;
  playRequirements: string;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface CheckItem {
  id: string;
  taskId: string;
  type: 'food' | 'water' | 'litter' | 'medication' | 'play';
  label: string;
  completed: boolean;
  photo?: string;
  note?: string;
  completedAt?: string;
}

export interface Abnormality {
  id: string;
  taskId: string;
  type: 'vomit' | 'not-eating' | 'hiding' | 'scratch' | 'other';
  description: string;
  photo?: string;
  reportedAt: string;
}

export interface Report {
  id: string;
  taskId: string;
  remainingFood: number;
  remainingLitter: number;
  remainingMedicine: number;
  nextReminder: string;
  abnormalitySummary: string;
  summary: string;
  createdAt: string;
}

export type AbnormalityType = Abnormality['type'];

export const abnormalityLabels: Record<AbnormalityType, string> = {
  'vomit': '呕吐',
  'not-eating': '没吃',
  'hiding': '躲起来',
  'scratch': '抓伤',
  'other': '其他异常',
};

export const checkItemLabels: Record<CheckItem['type'], string> = {
  'food': '喂食',
  'water': '饮水',
  'litter': '铲屎',
  'medication': '用药',
  'play': '陪玩',
};

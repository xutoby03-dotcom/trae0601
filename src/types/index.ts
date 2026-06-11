export type MobilityLevel = 'independent' | 'assist_needed' | 'wheelchair' | 'bedridden';
export type TaskStatus = 'today' | 'delayed' | 'observation' | 'completed';
export type SkinCondition = 'normal' | 'dry' | 'rash' | 'bruise' | 'wound';

export interface ElderProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  mobilityLevel: MobilityLevel;
  contraindications: string[];
  toiletries: string[];
  preferredTime: string;
  emergencyContact: string;
  emergencyPhone: string;
  avatar: string;
  lastBathDate?: string;
}

export interface BathTask {
  id: string;
  elderId: string;
  assignedTo: string;
  bathroom: string;
  nonSlipMat: boolean;
  changeClothes: boolean;
  estimatedMinutes: number;
  scheduledDate: string;
  status: TaskStatus;
  observationReason?: string;
  delayReason?: string;
  createdAt: string;
}

export interface BathRecord {
  id: string;
  taskId: string;
  elderId: string;
  completedBy: string;
  completedAt: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  skinCondition: SkinCondition;
  fatigueLevel: 1 | 2 | 3 | 4 | 5;
  remarks: string;
  waterTemperature?: number;
  actualDuration?: number;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

export interface AppState {
  elders: ElderProfile[];
  tasks: BathTask[];
  records: BathRecord[];
  members: FamilyMember[];
}

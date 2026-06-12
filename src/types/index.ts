export type Gender = '男' | '女';

export interface Child {
  id: string;
  name: string;
  birthday: string;
  gender: Gender;
  allergyHistory: string;
  vaccinationSite: string;
  guardianPhone: string;
  avatar: string;
  vaccineBookPhoto: string;
  createdAt: string;
}

export type VaccineStatus = 'pending' | 'appointed' | 'completed' | 'overdue';

export interface Vaccine {
  id: string;
  childId: string;
  name: string;
  dose: number;
  suggestedDate: string;
  latestDate: string;
  originalSuggestedDate?: string;
  originalLatestDate?: string;
  status: VaccineStatus;
  notes: string;
  appointmentTime?: string;
  appointmentLocation?: string;
  queueNumber?: string;
  appointmentRemark?: string;
  actualDate?: string;
  proofPhoto?: string;
  reaction?: string;
  delayedReason?: string;
  delayedCount: number;
  createdAt: string;
}

export interface PerChildStat {
  childId: string;
  childName: string;
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface MonthlyDistribution {
  month: string;
  count: number;
}

export interface Statistics {
  totalChildren: number;
  totalVaccines: number;
  pendingVaccines: number;
  completedVaccines: number;
  overdueVaccines: number;
  upcomingVaccines: Vaccine[];
  monthlyDistribution: MonthlyDistribution[];
  delayedVaccines: Vaccine[];
  busiestMonth: string;
  perChildStats: PerChildStat[];
}

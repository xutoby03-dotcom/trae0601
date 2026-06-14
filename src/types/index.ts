export interface Patient {
  id: string;
  name: string;
  disease: string;
  hospital: string;
  doctor: string;
  medicationNotes: string;
  avatar: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  prepared: boolean;
}

export type VisitStatus = 'upcoming' | 'confirmed' | 'completed' | 'cancelled';

export type TransportType = '自驾' | '公交' | '打车' | '地铁' | '步行' | '救护车';

export interface Visit {
  id: string;
  patientId: string;
  department: string;
  visitTime: string;
  checkItems: string;
  materials: MaterialItem[];
  companion: string;
  transport: TransportType;
  status: VisitStatus;
  confirmed: boolean;
}

export interface VisitRecord {
  id: string;
  visitId: string;
  advice: string;
  nextVisit: string;
  dosageChange: string;
}

export interface CompanionStats {
  name: string;
  count: number;
}

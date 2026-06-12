export interface Tank {
  id: string;
  name: string;
  capacity: number;
  filterType: string;
  minTemp: number;
  maxTemp: number;
  photo: string;
  owner: string;
  lastWaterChange: string;
  waterChangeInterval: number;
}

export interface Fish {
  id: string;
  name: string;
  species: string;
  avatar: string;
  addedDate: string;
  status: 'healthy' | 'sick' | 'quarantine';
}

export interface WaterChangeRecord {
  id: string;
  date: string;
  ratio: number;
  temperature: number;
  ph: number;
  addMedicine: boolean;
  medicineName?: string;
  cleanFilter: boolean;
  photo?: string;
  notes?: string;
}

export type ObservationType = 'white_spot' | 'bottom_sitting' | 'filter_noise' | 'appetite_loss' | 'fin_rot' | 'other';

export type ObservationTargetType = 'fish' | 'equipment' | 'water';

export type ObservationStatus = 'pending' | 'recovering' | 'resolved';

export interface Observation {
  id: string;
  date: string;
  type: ObservationType;
  typeLabel: string;
  description: string;
  targetType: ObservationTargetType;
  targetId?: string;
  targetName: string;
  status: ObservationStatus;
  photo?: string;
}

export type ReminderType = 'water_change_overdue' | 'temp_abnormal' | 'consecutive_issues' | 'sick_fish';

export type ReminderLevel = 'warning' | 'danger';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  level: ReminderLevel;
  days?: number;
}

export interface AppState {
  tank: Tank;
  fishes: Fish[];
  waterChanges: WaterChangeRecord[];
  observations: Observation[];
}

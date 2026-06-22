export interface Specimen {
  id: string;
  plantName: string;
  collectionLocation: string;
  plantPart: string;
  pressingDate: string;
  absorbentPaperBatch: string;
  plateWeight: number;
  paperChangeIntervalDays: number;
  currentDryness: number;
  hasMold: boolean;
  hasEdgeRoll: boolean;
  hasColorFade: boolean;
  hasMissingLabel: boolean;
  isCompleted: boolean;
  lastPaperChangeDate: string;
  paperChangeCount: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type SpecimenFormData = Omit<
  Specimen,
  | 'id'
  | 'currentDryness'
  | 'hasMold'
  | 'hasEdgeRoll'
  | 'hasColorFade'
  | 'hasMissingLabel'
  | 'isCompleted'
  | 'lastPaperChangeDate'
  | 'paperChangeCount'
  | 'createdAt'
  | 'updatedAt'
>;

export type SpecimenStatus = 'drying' | 'completed' | 'warning' | 'danger';

export type AlertType = 'mold' | 'edgeRoll' | 'colorFade' | 'missingLabel';

export interface AlertInfo {
  type: AlertType;
  label: string;
  severity: 'warning' | 'danger';
}

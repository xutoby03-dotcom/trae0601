export type InspectionResult = 'normal' | 'abnormal';

export interface Inspection {
  id: string;
  facility_id: string;
  inspection_date: string;
  inspector: string;
  result: InspectionResult;
  issues: string;
  created_at: string;
}

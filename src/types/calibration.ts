export type AnomalyType = 'OFF_BEAT' | 'STOPPED' | 'WEAK_RETURN' | 'GEAR_JAM';

export interface CalibrationRecord {
  id: string;
  sessionId: string;
  pendulumLength: number;
  escapementPosition: number;
  windingDegree: number;
  testDuration: number;
  hourlyError: number;
  tickIntervals: TickInterval[];
  recordTime: number;
  note: string;
}

export interface TickInterval {
  index: number;
  interval: number;
  direction: 'left' | 'right';
}

export interface AnomalyMark {
  id: string;
  sessionId: string;
  recordId: string;
  type: AnomalyType;
  position: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  detectedAt: number;
}

export interface CalibrationSession {
  id: string;
  clockName: string;
  clockModel: string;
  createdAt: number;
  updatedAt: number;
  status: 'active' | 'completed';
  records: CalibrationRecord[];
  anomalies: AnomalyMark[];
}

export interface StabilityReport {
  id: string;
  sessionId: string;
  stabilityScore: number;
  averageError: number;
  maxError: number;
  minError: number;
  errorTrend: 'improving' | 'stable' | 'worsening';
  conclusion: string;
  generatedAt: number;
  recordSummaries: RecordSummary[];
}

export interface RecordSummary {
  recordId: string;
  recordTime: number;
  hourlyError: number;
  anomalyCount: number;
  pendulumLength: number;
  escapementPosition: number;
}

export const ANOMALY_LABELS: Record<AnomalyType, string> = {
  OFF_BEAT: '偏摆',
  STOPPED: '停摆',
  WEAK_RETURN: '回摆无力',
  GEAR_JAM: '齿轮卡滞',
};

export const ANOMALY_COLORS: Record<AnomalyType, string> = {
  OFF_BEAT: '#E8943A',
  STOPPED: '#C44536',
  WEAK_RETURN: '#4A90D9',
  GEAR_JAM: '#9B59B6',
};

export interface KnotRecord {
  id: string;
  knotType: string;
  ropeDiameter: number;
  ropeMaterial: string;
  studentName: string;
  tieTimeSeconds: number;
  testWeight: number;
  slipped: boolean;
  capsized: boolean;
  sheathWear: boolean;
  retryCount: number;
  notes: string;
  createdAt: string;
}

export interface KnotStat {
  knotType: string;
  totalTests: number;
  passCount: number;
  failCount: number;
  slipCount: number;
  capsizeCount: number;
  sheathWearCount: number;
  avgRetryCount: number;
  avgTieTime: number;
  maxTestWeight: number;
  readyForField: boolean;
  reasons: string[];
}

export interface StudentSummary {
  studentName: string;
  totalRecords: number;
  knotStats: KnotStat[];
  totalReadyKnots: number;
  totalUnreadyKnots: number;
}

export const KNOT_TYPES = [
  "八字结",
  "布林结",
  "双渔人结",
  "普鲁士结",
  "蝴蝶结",
  "平结",
];

export const ROPE_MATERIALS = ["尼龙", "涤纶", "迪尼玛", "芳纶"];

export const READINESS_RULES = {
  minTests: 3,
  maxSlipInRecent: 0,
  recentTestsCount: 3,
  maxCapsizeRate: 0.3,
  maxSheathWearRate: 0.3,
  maxAvgRetryCount: 1,
};

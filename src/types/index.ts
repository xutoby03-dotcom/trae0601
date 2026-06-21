export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';

export interface Member {
  id: string;
  name: string;
  voicePart: VoicePart;
  avatarUrl?: string;
  vocalPower: number;
  vocalRange: number;
  experience: number;
  createdAt: string;
}

export interface StagePosition {
  id: string;
  schemeId: string;
  memberId: string | null;
  row: number;
  col: number;
}

export interface Scheme {
  id: string;
  name: string;
  notes: string;
  gridRows: number;
  gridCols: number;
  positions: StagePosition[];
  createdAt: string;
  updatedAt: string;
  overallScore: number;
}

export interface AuditionScore {
  id: string;
  schemeId: string;
  passage: string;
  balance: number;
  clarity: number;
  blend: number;
  comment: string;
  recordedAt: string;
}

export interface SubstituteRecord {
  id: string;
  schemeId: string;
  absentMemberId: string;
  substituteMemberId: string;
  impactScore: number;
  recommendedRow: number;
  recommendedCol: number;
  balanceDelta: number;
  clarityDelta: number;
  blendDelta: number;
}

export interface AcousticResult {
  voiceVolumes: Record<VoicePart, number>;
  heatMatrix: number[][];
  overlapScore: number;
  memberContribution: Map<string, number>;
}

export interface ScoreResult {
  balance: number;
  clarity: number;
  blend: number;
  overall: number;
}

export interface SubstituteCandidate {
  substituteMemberId: string;
  impactScore: number;
  recommendedRow: number;
  recommendedCol: number;
  balanceDelta: number;
  clarityDelta: number;
  blendDelta: number;
  newScore: ScoreResult;
}

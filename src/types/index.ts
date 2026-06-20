export type RouteStatus = 'active' | 'pending_review' | 'adjusting' | 'retired';

export type Grade = 'V0' | 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7' | 'V8+';

export type HoldType = 'jug' | 'crimp' | 'sloper' | 'foothold' | 'pinch';

export type IssueType = 'loose' | 'worn' | 'missing_screw' | 'slippery' | 'broken';

export type Severity = 'low' | 'medium' | 'high';

export type FeedbackType = 'too_hard' | 'too_easy' | 'bad_flow' | 'dangerous' | 'other';

export type FeedbackStatus = 'pending' | 'reviewed';

export type ReviewDecision = 'keep' | 'adjust' | 'retire' | 'escalate';

export type UserRole = 'staff' | 'setter';

export interface Route {
  id: string;
  name: string;
  color: string;
  grade: Grade;
  setter: string;
  setDate: string;
  removeDate: string;
  status: RouteStatus;
  holdIds: string[];
  description?: string;
}

export interface Hold {
  id: string;
  x: number;
  y: number;
  type: HoldType;
  routeId: string | null;
  size: 'small' | 'medium' | 'large';
}

export interface Issue {
  id: string;
  holdId: string;
  routeId: string | null;
  type: IssueType;
  severity: Severity;
  note: string;
  createdAt: string;
  resolved: boolean;
  reporter: string;
}

export interface Feedback {
  id: string;
  routeId: string;
  type: FeedbackType;
  description: string;
  createdAt: string;
  status: FeedbackStatus;
  decision?: ReviewDecision;
  reviewerNote?: string;
  reviewedAt?: string;
  reviewer?: string;
  reporterName?: string;
}

export interface WallSection {
  id: string;
  name: string;
  angle: number;
  rows: number;
  cols: number;
}

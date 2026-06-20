export interface RoutePoint {
  id: string;
  name: string;
  description?: string;
  plannedDuration: number;
  isKeyPoint: boolean;
  order: number;
}

export interface TourRoute {
  id: string;
  name: string;
  description?: string;
  points: RoutePoint[];
  createdAt: number;
  updatedAt: number;
}

export interface PointSession {
  pointId: string;
  plannedDuration: number;
  adjustedDuration: number;
  actualDuration: number;
  startedAt: number | null;
  endedAt: number | null;
  timeAdded: number;
  isCompleted: boolean;
}

export type GuideSessionStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface GuideSession {
  id: string;
  routeId: string;
  routeName: string;
  pointSessions: PointSession[];
  currentPointIndex: number;
  status: GuideSessionStatus;
  startedAt: number | null;
  endedAt: number | null;
  totalPlannedDuration: number;
  totalActualDuration: number;
}

export const STORAGE_KEYS = {
  ROUTES: 'guide_routes',
  CURRENT_SESSION: 'guide_current_session',
  SESSION_HISTORY: 'guide_session_history',
  SETTINGS: 'guide_settings',
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];

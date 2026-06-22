export interface Point {
  x: number;
  y: number;
}

export type PlayerType = 'offense' | 'defense';

export interface Player {
  id: string;
  type: PlayerType;
  label: string;
  startPosition: Point;
}

export interface Disc {
  id: string;
  position: Point;
  holderId: string | null;
  releaseTime: number;
}

export interface Keyframe {
  id: string;
  time: number;
  position: Point;
}

export interface Route {
  id: string;
  playerId: string;
  keyframes: Keyframe[];
  color: string;
}

export type FakeDirection = 'left' | 'right' | 'in' | 'out';

export interface FakeNode {
  id: string;
  playerId: string;
  position: Point;
  time: number;
  direction: FakeDirection;
}

export type WindowQuality = 'good' | 'great' | 'excellent';

export interface TransferWindow {
  id: string;
  fromId: string;
  toId: string;
  startTime: number;
  endTime: number;
  quality: WindowQuality;
}

export type RiskSeverity = 'low' | 'medium' | 'high';

export interface CollisionRisk {
  id: string;
  position: Point;
  time: number;
  playerIds: [string, string];
  severity: RiskSeverity;
}

export interface GapInfo {
  id: string;
  playerId: string;
  startTime: number;
  endTime: number;
  maxDistance: number;
}

export interface ActualPosition {
  id: string;
  playerId: string;
  time: number;
  position: Point;
}

export interface DeviationStats {
  playerId: string;
  avgDeviation: number;
  maxDeviation: number;
  maxDeviationTime: number;
  deviations: { time: number; deviation: number }[];
}

export interface Play {
  id: string;
  name: string;
  duration: number;
  players: Player[];
  disc: Disc;
  routes: Route[];
  fakeNodes: FakeNode[];
  transferWindows: TransferWindow[];
  collisionRisks: CollisionRisk[];
  gaps: GapInfo[];
  actualPositions: ActualPosition[];
  deviationStats: Record<string, DeviationStats>;
}

export type Tool = 'select' | 'offense' | 'defense' | 'disc' | 'route' | 'fake';

export interface EditorState {
  currentTool: Tool;
  selectedId: string | null;
  selectedType: 'player' | 'disc' | 'route' | 'fake' | null;
  isPlaying: boolean;
  currentTime: number;
  playbackSpeed: number;
  showAnalysis: boolean;
  showRoutes: boolean;
  showFakeNodes: boolean;
  showTransferWindows: boolean;
  showCollisionRisks: boolean;
}

export const FIELD_WIDTH = 100;
export const FIELD_HEIGHT = 37;
export const END_ZONE_DEPTH = 18;

export const OFFENSE_COLORS = [
  '#ff6b35',
  '#f7931e',
  '#ffc857',
  '#e97451',
  '#d62828',
  '#ff8c42',
  '#fb8500',
  '#ee6c4d',
];

export const DEFENSE_COLORS = [
  '#0077b6',
  '#00b4d8',
  '#0096c7',
  '#023e8a',
  '#3a86ff',
  '#118ab2',
  '#006494',
  '#003566',
];

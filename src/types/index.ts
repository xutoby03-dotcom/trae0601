export interface Role {
  id: string;
  name: string;
  color: string;
  symbol: string;
  description: string;
}

export interface Resource {
  id: string;
  name: string;
  amount: number;
  unit: string;
}

export interface Trigger {
  id: string;
  name: string;
  condition: string;
  effect: string;
}

export interface Piece {
  id: string;
  name: string;
  roleId: string;
  x: number;
  y: number;
  resources: Resource[];
  triggers: Trigger[];
  notes: string;
}

export interface Version {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  pieces: Piece[];
  stepNumber: number;
}

export interface Scene {
  id: string;
  name: string;
  roles: Role[];
  versions: Version[];
  currentVersionId: string | null;
}

export type DiffType =
  | 'added'
  | 'removed'
  | 'moved'
  | 'role_changed'
  | 'resource_changed'
  | 'trigger_changed'
  | 'notes_changed';

export interface PieceDiff {
  pieceId: string;
  pieceName: string;
  type: DiffType;
  oldValue?: unknown;
  newValue?: unknown;
  oldX?: number;
  oldY?: number;
  newX?: number;
  newY?: number;
}

export interface CompareState {
  isComparing: boolean;
  leftVersionId: string | null;
  rightVersionId: string | null;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentStep: number;
  speed: number;
  versionOrder: string[];
}

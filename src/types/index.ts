export type ItemType = 'pot' | 'gongdao' | 'cup' | 'incense' | 'teaLeaf' | 'flower';

export type Direction = 'top' | 'bottom' | 'left' | 'right';

export type Severity = 'error' | 'warning' | 'info';

export type DetectionType = 'occlusion' | 'distance' | 'handConflict' | 'balance';

export interface TeaItem {
  id: string;
  type: ItemType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  isLeftHand?: boolean;
}

export interface ClothConfig {
  width: number;
  height: number;
  hostDirection: Direction;
  guestDirection: Direction;
}

export interface StageVersion {
  id: string;
  name: string;
  createdAt: number;
  items: TeaItem[];
  clothConfig: ClothConfig;
  movementPath: string;
  thumbnail?: string;
}

export interface DetectionResult {
  id: string;
  type: DetectionType;
  severity: Severity;
  message: string;
  relatedItemIds: string[];
}

export interface ItemTemplate {
  type: ItemType;
  name: string;
  defaultWidth: number;
  defaultHeight: number;
  isLeftHand?: boolean;
  description: string;
}

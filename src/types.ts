export type ToolType =
  | 'select'
  | 'directSelect'
  | 'pen'
  | 'brush'
  | 'rect'
  | 'circle'
  | 'ellipse'
  | 'polygon'
  | 'star'
  | 'text'
  | 'eyedropper';

export type GridType = 'pixel' | 'isometric' | 'polar';

export type FillType = 'none' | 'solid' | 'linearGradient' | 'radialGradient' | 'pattern';

export type StrokeLineCap = 'butt' | 'round' | 'square';
export type StrokeLineJoin = 'miter' | 'round' | 'bevel';
export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion';

export type BooleanOp = 'union' | 'subtract' | 'intersect' | 'exclude';

export type ShapeType = 'path' | 'rect' | 'circle' | 'ellipse' | 'polygon' | 'star' | 'text' | 'group';

export interface Point {
  x: number;
  y: number;
}

export interface AnchorPoint {
  x: number;
  y: number;
  handleIn: Point | null;
  handleOut: Point | null;
  type: 'corner' | 'smooth';
}

export interface GradientStop {
  offset: number;
  color: string;
  opacity: number;
}

export interface Gradient {
  type: 'linear' | 'radial';
  stops: GradientStop[];
  angle: number;
  cx?: number;
  cy?: number;
}

export interface PatternFill {
  type: 'dots' | 'lines' | 'crosshatch' | 'zigzag';
  color: string;
  backgroundColor: string;
  scale: number;
  spacing: number;
  angle: number;
}

export interface Fill {
  type: FillType;
  color: string;
  opacity: number;
  gradient: Gradient | null;
  pattern: PatternFill | null;
}

export interface Stroke {
  color: string;
  width: number;
  opacity: number;
  dashArray: string;
  lineCap: StrokeLineCap;
  lineJoin: StrokeLineJoin;
}

export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: string;
  textAnchor: string;
  pathId: string | null;
  startOffset: number;
}

export interface Shape {
  id: string;
  type: ShapeType;
  anchors: AnchorPoint[];
  pathData: string;
  fill: Fill;
  stroke: Stroke;
  transform: string;
  name: string;
  locked: boolean;
  visible: boolean;
  opacity: number;
  blendMode: BlendMode;
  textProps: TextProperties | null;
  children: string[];
  parentId: string | null;
  booleanOp: BooleanOp | null;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  expanded: boolean;
  shapeIds: string[];
}

export interface Document {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: Layer[];
  shapes: Record<string, Shape>;
  activeLayerId: string;
  thumbnail: string;
  createdAt: number;
  updatedAt: number;
}

export interface CanvasState {
  zoom: number;
  panX: number;
  panY: number;
  gridType: GridType;
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
}

export interface SelectionState {
  shapeIds: string[];
  anchorIndices: number[];
  hoverShapeId: string | null;
  hoverAnchorIndex: number;
}

export interface PenState {
  isDrawing: boolean;
  currentPathId: string | null;
  closePath: boolean;
}

export interface BrushState {
  isDrawing: boolean;
  currentPathId: string | null;
  points: Point[];
}

export interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  shapeId: string | null;
  anchorIndex: number;
  handleType: 'in' | 'out' | 'none';
}

export interface HistoryEntry {
  shapes: Record<string, Shape>;
  layers: Layer[];
  activeLayerId: string;
}

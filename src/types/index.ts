export type ShapeType = 'rectangle' | 'rounded-rect' | 'circle' | 'diamond' | 'parallelogram';

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface NodeData {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
}

export type ConnectionPointPosition = 'top' | 'right' | 'bottom' | 'left';

export interface ConnectionPoint {
  nodeId: string;
  position: ConnectionPointPosition;
}

export interface EdgeData {
  id: string;
  from: ConnectionPoint;
  to: ConnectionPoint;
  points: Point[];
}

export interface CanvasState {
  offsetX: number;
  offsetY: number;
  scale: number;
}

export interface SelectionState {
  nodeIds: string[];
  edgeIds: string[];
}

export interface EditorState {
  nodes: NodeData[];
  edges: EdgeData[];
  canvas: CanvasState;
  selection: SelectionState;
  editingNodeId: string | null;
  connectingFrom: ConnectionPoint | null;
  tempLine: Point[] | null;
}

export interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

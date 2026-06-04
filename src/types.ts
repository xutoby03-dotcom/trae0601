export type TimeUnit = 'day' | 'week' | 'month' | 'quarter';

export type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';

export interface Task {
  id: string;
  name: string;
  parentId: string | null;
  startDate: string;
  endDate: string;
  progress: number;
  isMilestone: boolean;
  assignees: string[];
  expanded: boolean;
  order: number;
  duration: number;
}

export interface Dependency {
  id: string;
  sourceId: string;
  targetId: string;
  type: DependencyType;
  lag: number;
}

export interface CalendarConfig {
  workDays: number[];
  holidays: string[];
}

export interface ProjectData {
  tasks: Task[];
  dependencies: Dependency[];
  calendar: CalendarConfig;
  resources: string[];
}

export interface TaskNode extends Task {
  children: TaskNode[];
  depth: number;
  isCritical?: boolean;
  earlyStart?: string;
  earlyFinish?: string;
  lateStart?: string;
  lateFinish?: string;
  totalFloat?: number;
}

export interface CPMResult {
  criticalPath: string[];
  taskMap: Map<string, TaskNode>;
  projectDuration: number;
  projectEndDate: string;
}

export type DragMode = 'move' | 'resize-start' | 'resize-end' | 'none' | 'link';

export interface DragState {
  mode: DragMode;
  taskId: string | null;
  startX: number;
  initialStart: string;
  initialEnd: string;
}

export interface LinkDragState {
  isDragging: boolean;
  sourceId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface TooltipState {
  visible: boolean;
  taskId: string | null;
  x: number;
  y: number;
}

export interface ResourceConflict {
  resource: string;
  task1Id: string;
  task2Id: string;
  startDate: string;
  endDate: string;
}

export interface TaskConflictDetail {
  conflictedResources: string[];
  overlaps: { resource: string; otherTaskId: string; otherTaskName?: string; overlapStart: string; overlapEnd: string }[];
}

export interface ConflictInfo {
  conflicts: ResourceConflict[];
  conflictedTaskIds: Set<string>;
  conflictedResources: Set<string>;
  taskConflictMap: Map<string, TaskConflictDetail>;
}

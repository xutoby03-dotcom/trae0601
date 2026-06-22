export interface Course {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface SignWord {
  id: string;
  courseId: string;
  name: string;
  standardPoints: {
    handShape: string;
    orientation: string;
    trajectory: string;
    expression: string;
  };
  referenceVideoUrl?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  avatar?: string;
}

export interface DimensionScore {
  handShape: number;
  orientation: number;
  trajectory: number;
  expression: number;
  comments: {
    handShape: string;
    orientation: string;
    trajectory: string;
    expression: string;
  };
}

export type AnnotationType = 'rect' | 'arrow' | 'text';
export type ErrorType = 'handShape' | 'orientation' | 'trajectory' | 'expression' | 'other';

export interface Annotation {
  id: string;
  frameIndex: number;
  timestamp: number;
  type: AnnotationType;
  color: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  endX?: number;
  endY?: number;
  text?: string;
  errorType?: ErrorType;
}

export interface PracticeRecord {
  id: string;
  studentId: string;
  signWordId: string;
  courseId: string;
  videoUrl: string;
  videoName: string;
  scores: DimensionScore;
  annotations: Annotation[];
  overallScore: number;
  practiceDate: string;
  needsReview: boolean;
}

export type ScoreDimension = keyof Omit<DimensionScore, 'comments'>;

export type ToolType = 'select' | 'rect' | 'arrow' | 'text' | 'eraser';

export const ERROR_TYPE_LABELS: Record<ErrorType, string> = {
  handShape: '手形错误',
  orientation: '朝向错误',
  trajectory: '轨迹错误',
  expression: '表情错误',
  other: '其他问题',
};

export const DIMENSION_LABELS: Record<ScoreDimension, string> = {
  handShape: '手形',
  orientation: '朝向',
  trajectory: '移动轨迹',
  expression: '表情配合',
};

export const ANNOTATION_COLORS = [
  '#ff4757',
  '#ff6b6b',
  '#ffa502',
  '#2ed573',
  '#1e90ff',
  '#a55eea',
];

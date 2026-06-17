export type ClothingStatus = 'pending' | 'in_progress' | 'completed';

export type Priority = 'urgent' | 'normal' | 'low';

export type ProcessType = 'sew_button' | 'patch_hole' | 'alter_length' | 'replace_zipper' | 'iron';

export type ClothingCategory = 'pants' | 'shirt' | 'coat' | 'dress' | 'uniform' | 'other';

export type ProblemType = 'button' | 'hole' | 'length' | 'zipper' | 'wrinkle' | 'other';

export type MaterialType = 'thread' | 'button' | 'zipper' | 'fabric';

export interface Clothing {
  id: string;
  owner: string;
  category: ClothingCategory;
  problemType: ProblemType;
  processType: ProcessType;
  priority: Priority;
  washBefore: boolean;
  photoBefore?: string;
  photoAfter?: string;
  deadline: string;
  status: ClothingStatus;
  materialsNeeded: string[];
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  timeSpent?: number;
  notes?: string;
}

export interface Material {
  id: string;
  type: MaterialType;
  name: string;
  color: string;
  quantity: number;
  threshold: number;
  unit: string;
  lastPurchased?: string;
}

export interface AppState {
  clothings: Clothing[];
  materials: Material[];
}

export const CATEGORY_LABELS: Record<ClothingCategory, string> = {
  pants: '裤子',
  shirt: '上衣',
  coat: '外套',
  dress: '裙子',
  uniform: '校服',
  other: '其他',
};

export const PROBLEM_LABELS: Record<ProblemType, string> = {
  button: '纽扣问题',
  hole: '破洞',
  length: '裤长/衣长',
  zipper: '拉链问题',
  wrinkle: '褶皱',
  other: '其他问题',
};

export const PROCESS_LABELS: Record<ProcessType, string> = {
  sew_button: '缝扣',
  patch_hole: '补洞',
  alter_length: '改裤长',
  replace_zipper: '换拉链',
  iron: '熨烫',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  urgent: '紧急',
  normal: '普通',
  low: '不急',
};

export const STATUS_LABELS: Record<ClothingStatus, string> = {
  pending: '待处理',
  in_progress: '进行中',
  completed: '已完成',
};

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  thread: '线',
  button: '纽扣',
  zipper: '拉链',
  fabric: '备用布',
};

export const PROBLEM_TO_PROCESS: Record<ProblemType, ProcessType> = {
  button: 'sew_button',
  hole: 'patch_hole',
  length: 'alter_length',
  zipper: 'replace_zipper',
  wrinkle: 'iron',
  other: 'sew_button',
};

export interface WeightPlan {
  id: string;
  name: string;
  salinity: string;
  wetsuitThickness: string;
  cameraHousing: string;
  lensPort: string;
  buoyancyArm: string;
  leadPosition: string;
  pitchForward: number;
  pitchBackward: number;
  roll: number;
  ascentSpeed: number;
  handling: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface RatingItem {
  key: keyof WeightPlan;
  label: string;
  description: string;
  icon: string;
}

export const RATING_ITEMS: RatingItem[] = [
  { key: 'pitchForward', label: '前倾', description: '镜头向下倾斜程度', icon: 'arrow-down' },
  { key: 'pitchBackward', label: '后仰', description: '镜头向上倾斜程度', icon: 'arrow-up' },
  { key: 'roll', label: '侧翻', description: '左右摇摆程度', icon: 'rotate-cw' },
  { key: 'ascentSpeed', label: '上浮速度', description: '自然上浮快慢', icon: 'trending-up' },
  { key: 'handling', label: '操作手感', description: '整体操控舒适度', icon: 'hand' },
];

export const SALINITY_OPTIONS = ['淡水', '微咸水', '海水', '高盐度'];
export const WETSUIT_OPTIONS = ['3mm', '5mm', '7mm', '干式潜水服'];
export const CAMERA_HOUSING_OPTIONS = ['紧凑型', '单反/微单', '专业水下相机', '运动相机'];
export const LENS_PORT_OPTIONS = ['平面罩', '广角罩', '微距罩', '鱼眼罩'];
export const BUOYANCY_ARM_OPTIONS = ['无浮力臂', '单浮力臂', '双浮力臂', '浮力臂+浮球'];
export const LEAD_POSITION_OPTIONS = ['腰前', '腰后', '腰部两侧', '肩部', '底部配重', '多点分布'];

export type DeviceType = 'main_light' | 'fill_light' | 'rim_light' | 'reflector' | 'background';

export interface CanvasDevice {
  id: string;
  type: DeviceType;
  model: string;
  x: number;
  y: number;
  rotation: number;
  distance?: number;
  angle?: number;
  power?: number;
  colorTemp?: number;
  modifier?: string;
}

export interface CameraSettings {
  cameraModel: string;
  lens: string;
  focalLength: number;
  aperture: string;
  shutterSpeed: string;
  iso: number;
  whiteBalance: number;
}

export type AnnotationType =
  | 'catch_light'
  | 'hard_shadow'
  | 'uneven_bg'
  | 'overexposure'
  | 'underexposure'
  | 'color_cast'
  | 'other';

export interface Annotation {
  id: string;
  imageType: 'final' | 'bts';
  x: number;
  y: number;
  type: AnnotationType;
  severity: 'low' | 'medium' | 'high';
  comment: string;
  author: string;
  createdAt: number;
}

export interface LightingSetup {
  id: string;
  name: string;
  client: string;
  shootDate: string;
  tags: string[];
  devices: CanvasDevice[];
  camera: CameraSettings;
  finalImage: string;
  btsImage: string;
  annotations: Annotation[];
  author: string;
  createdAt: number;
  updatedAt: number;
}

export interface BookingRecord {
  deviceId: string;
  deviceName: string;
  deviceModel: string;
  bookedBy: string;
  date: string;
  startTime: string;
  endTime: string;
  conflict?: boolean;
}

export interface DeviceCatalogItem {
  id: string;
  type: DeviceType;
  name: string;
  model: string;
  defaultColorTemp?: number;
  maxPower?: number;
}

export const ANNOTATION_LABELS: Record<AnnotationType, string> = {
  catch_light: '眼神光问题',
  hard_shadow: '阴影过硬',
  uneven_bg: '背景不均匀',
  overexposure: '局部过曝',
  underexposure: '局部欠曝',
  color_cast: '色偏',
  other: '其他问题',
};

export const ANNOTATION_COLORS: Record<AnnotationType, string> = {
  catch_light: '#F59E0B',
  hard_shadow: '#3B82F6',
  uneven_bg: '#10B981',
  overexposure: '#EF4444',
  underexposure: '#8B5CF6',
  color_cast: '#EC4899',
  other: '#64748B',
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  main_light: '主灯',
  fill_light: '辅灯',
  rim_light: '轮廓灯',
  reflector: '反光板',
  background: '背景纸',
};

export const DEVICE_TYPE_COLORS: Record<DeviceType, string> = {
  main_light: '#EF4444',
  fill_light: '#3B82F6',
  rim_light: '#A855F7',
  reflector: '#FDE68A',
  background: '#10B981',
};

export const LIGHT_MODIFIERS = [
  '标准罩',
  '柔光箱 60×90cm',
  '柔光箱 90×120cm',
  '八角柔光箱 120cm',
  '雷达罩 70cm',
  '柔光伞',
  '反光伞',
  '蜂巢 10°',
  '蜂巢 20°',
  '四页挡光板',
  '猪嘴',
  '硫酸纸',
];

export const SEVERITY_LABELS: Record<'low' | 'medium' | 'high', string> = {
  low: '轻微',
  medium: '中等',
  high: '严重',
};

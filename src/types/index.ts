export type LayerType = 'image' | 'text' | 'mosaic' | 'drawing' | 'cutout';

export type ToolType = 'select' | 'crop' | 'rotate' | 'flip' | 'text' | 'mosaic' | 'drawing' | 'lasso';

export type CropRatio = 'free' | '1:1' | '4:3' | '16:9' | '9:16' | 'custom';

export type BlendMode = 
  | 'source-over'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'darken'
  | 'lighten'
  | 'color-dodge'
  | 'color-burn';

export interface Point {
  x: number;
  y: number;
}

export interface HistoryEntry<T = unknown> {
  timestamp: number;
  snapshot: T;
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: BlendMode;
  x: number;
  y: number;
  width: number;
  height: number;
  history: HistoryEntry[];
  historyIndex: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  imageData: ImageData | null;
  filters: FilterSettings;
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  strokeColor: string;
  strokeWidth: number;
  shadowBlur: number;
  shadowColor: string;
  shadowOffsetX: number;
  shadowOffsetY: number;
}

export interface MosaicPath {
  points: Point[];
  brushSize: number;
}

export interface MosaicLayer extends BaseLayer {
  type: 'mosaic';
  imageData: ImageData | null;
  brushSize: number;
  paths: MosaicPath[];
}

export interface DrawingPath {
  points: Point[];
  color: string;
  size: number;
}

export interface DrawingLayer extends BaseLayer {
  type: 'drawing';
  brushColor: string;
  brushSize: number;
  paths: DrawingPath[];
}

export interface CutoutLayer extends BaseLayer {
  type: 'cutout';
  imageData: ImageData | null;
  maskData: Uint8ClampedArray | null;
}

export type Layer = ImageLayer | TextLayer | MosaicLayer | DrawingLayer | CutoutLayer;

export interface FilterSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  blur: number;
  sharpen: number;
  grayscale: number;
  invert: number;
  nostalgia: number;
  lomo: number;
}

export interface CropSettings {
  ratio: CropRatio;
  customWidth: number;
  customHeight: number;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface ExportSettings {
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number;
  filename: string;
}

export interface HistogramData {
  r: number[];
  g: number[];
  b: number[];
  max: number;
}

export const DEFAULT_FILTERS: FilterSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  blur: 0,
  sharpen: 0,
  grayscale: 0,
  invert: 0,
  nostalgia: 0,
  lomo: 0,
};

export const CROP_RATIOS: Record<CropRatio, number | null> = {
  'free': null,
  '1:1': 1,
  '4:3': 4 / 3,
  '16:9': 16 / 9,
  '9:16': 9 / 16,
  'custom': null,
};

export const FONT_FAMILIES = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Courier New',
  'Verdana',
  'Impact',
  'Comic Sans MS',
  'Microsoft YaHei',
  'SimHei',
  'SimSun',
  'KaiTi',
];

export const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'source-over', label: '正常' },
  { value: 'multiply', label: '正片叠底' },
  { value: 'screen', label: '滤色' },
  { value: 'overlay', label: '叠加' },
  { value: 'darken', label: '变暗' },
  { value: 'lighten', label: '变亮' },
  { value: 'color-dodge', label: '颜色减淡' },
  { value: 'color-burn', label: '颜色加深' },
];

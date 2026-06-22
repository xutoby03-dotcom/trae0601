export type PrintIssueType = 'ghosting' | 'gap' | 'smudge' | 'stretch';

export type PlateStatus = 'pending' | 'testing' | 'passed';

export interface PrintIssue {
  type: PrintIssueType;
  label: string;
  marked: boolean;
  remark: string;
}

export interface ColorPlate {
  id: string;
  plateNumber: string;
  colorName: string;
  colorHex: string;
  offsetX: number;
  offsetY: number;
  testCount: number;
  pinPositionX: number;
  pinPositionY: number;
  issues: PrintIssue[];
  status: PlateStatus;
}

export interface FinalParams {
  confirmedAt: string;
  operator: string;
  overallOffsetX: number;
  overallOffsetY: number;
  temperature: number;
  humidity: number;
  remark: string;
}

export interface CalibrationTask {
  id: string;
  taskNo: string;
  paperBatch: string;
  paperType: string;
  createdAt: string;
  updatedAt: string;
  plates: ColorPlate[];
  finalParams: FinalParams | null;
  isCompleted: boolean;
}

export const DEFAULT_ISSUES: PrintIssue[] = [
  { type: 'ghosting', label: '重影', marked: false, remark: '' },
  { type: 'gap', label: '漏白', marked: false, remark: '' },
  { type: 'smudge', label: '蹭脏', marked: false, remark: '' },
  { type: 'stretch', label: '纸张伸缩', marked: false, remark: '' },
];

export const PRESET_COLORS = [
  { name: '墨黑', hex: '#1a1a1a' },
  { name: '朱砂', hex: '#c44536' },
  { name: '石青', hex: '#1e6091' },
  { name: '藤黄', hex: '#e8a33d' },
  { name: '赭石', hex: '#a0522d' },
  { name: '花青', hex: '#2a4d7a' },
  { name: '胭脂', hex: '#9c2542' },
  { name: '翠绿', hex: '#4a7c59' },
];

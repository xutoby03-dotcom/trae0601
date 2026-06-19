export interface Device {
  id: string;
  location: string;
  model: string;
  install_date: string;
  battery_type: string;
  battery_replace_date: string;
  maintenance_phone: string;
  photo?: string;
  created_at: string;
}

export type SoundStatus = 'normal' | 'weak' | 'silent';
export type LightStatus = 'normal' | 'blink' | 'off';
export type VentilationStatus = 'good' | 'fair' | 'poor';
export type HoseStatus = 'normal' | 'aging' | 'damaged';
export type ValveStatus = 'normal' | 'loose' | 'leak';
export type BatteryLevel = 'good' | 'low' | 'dead';

export interface Inspection {
  id: string;
  device_id: string;
  inspect_date: string;
  sound_status: SoundStatus;
  light_status: LightStatus;
  ventilation: VentilationStatus;
  hose_status: HoseStatus;
  valve_status: ValveStatus;
  battery_level: BatteryLevel;
  photo?: string;
  remark: string;
  has_anomaly: boolean;
  anomaly_types: string[];
  created_at: string;
}

export type TaskType = 'battery' | 'sound' | 'hose' | 'valve' | 'other';
export type TaskStatus = 'pending' | 'processing' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface MaintenanceTask {
  id: string;
  device_id: string;
  inspection_id?: string;
  task_type: TaskType;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  handle_time?: string;
  handle_remark: string;
  created_at: string;
}

export const BATTERY_TYPE_OPTIONS: { value: string; label: string; lifeMonths: number }[] = [
  { value: 'AA', label: '5号碱性电池 (AA)', lifeMonths: 12 },
  { value: 'AAA', label: '7号碱性电池 (AAA)', lifeMonths: 12 },
  { value: '9V', label: '9V 叠层电池', lifeMonths: 12 },
  { value: 'CR123A', label: 'CR123A 锂电池', lifeMonths: 36 },
  { value: 'CR2', label: 'CR2 锂电池', lifeMonths: 36 },
  { value: 'LIPO', label: '内置锂电 (可充电)', lifeMonths: 24 },
];

export const SOUND_OPTIONS: { value: SoundStatus; label: string; level: 'success' | 'warning' | 'danger' }[] = [
  { value: 'normal', label: '正常发声', level: 'success' },
  { value: 'weak', label: '声音微弱', level: 'warning' },
  { value: 'silent', label: '完全无声', level: 'danger' },
];

export const LIGHT_OPTIONS: { value: LightStatus; label: string; level: 'success' | 'warning' | 'danger' }[] = [
  { value: 'normal', label: '正常常亮', level: 'success' },
  { value: 'blink', label: '指示灯闪烁', level: 'warning' },
  { value: 'off', label: '指示灯不亮', level: 'danger' },
];

export const VENTILATION_OPTIONS: { value: VentilationStatus; label: string; level: 'success' | 'warning' | 'danger' }[] = [
  { value: 'good', label: '通风良好', level: 'success' },
  { value: 'fair', label: '通风一般', level: 'warning' },
  { value: 'poor', label: '通风较差', level: 'warning' },
];

export const HOSE_OPTIONS: { value: HoseStatus; label: string; level: 'success' | 'warning' | 'danger' }[] = [
  { value: 'normal', label: '软管正常', level: 'success' },
  { value: 'aging', label: '软管老化', level: 'warning' },
  { value: 'damaged', label: '软管破损', level: 'danger' },
];

export const VALVE_OPTIONS: { value: ValveStatus; label: string; level: 'success' | 'warning' | 'danger' }[] = [
  { value: 'normal', label: '阀门正常', level: 'success' },
  { value: 'loose', label: '阀门松动', level: 'warning' },
  { value: 'leak', label: '阀门漏气', level: 'danger' },
];

export const BATTERY_OPTIONS: { value: BatteryLevel; label: string; level: 'success' | 'warning' | 'danger' }[] = [
  { value: 'good', label: '电量充足', level: 'success' },
  { value: 'low', label: '电量低', level: 'warning' },
  { value: 'dead', label: '无电', level: 'danger' },
];

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  battery: '电池问题',
  sound: '声响/指示灯问题',
  hose: '灶具软管问题',
  valve: '阀门问题',
  other: '其他问题',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: '待处理',
  processing: '处理中',
  done: '已完成',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

export const getBatteryLifeMonths = (batteryType: string): number => {
  const found = BATTERY_TYPE_OPTIONS.find(b => b.value === batteryType);
  return found?.lifeMonths ?? 12;
};

export type FaultType =
  | 'noise'
  | 'sinking'
  | 'backrest_loose'
  | 'wheel_jammed'
  | 'armrest_broken'
  | 'seat_collapse';

export const FAULT_TYPE_LABEL: Record<FaultType, string> = {
  noise: '异响',
  sinking: '下沉',
  backrest_loose: '靠背松',
  wheel_jammed: '轮子卡',
  armrest_broken: '扶手坏',
  seat_collapse: '坐垫塌陷',
};

export type Frequency = 'rare' | 'occasional' | 'frequent' | 'always';

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  rare: '偶尔（<1次/周）',
  occasional: '有时（1-3次/周）',
  frequent: '频繁（4-6次/周）',
  always: '总是（每天）',
};

export const FREQUENCY_WEIGHT: Record<Frequency, number> = {
  rare: 1,
  occasional: 2,
  frequent: 3,
  always: 4,
};

export type ArmrestType = 'fixed' | '3d' | '4d' | 'none';

export const ARMREST_TYPE_LABEL: Record<ArmrestType, string> = {
  fixed: '固定扶手',
  '3d': '3D扶手',
  '4d': '4D扶手',
  none: '无扶手',
};

export type OrderStatus = 'pending' | 'repairing' | 'done' | 'closed';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '待处理',
  repairing: '维修中',
  done: '已完成',
  closed: '已关闭',
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  pending: 'orange',
  repairing: 'blue',
  done: 'green',
  closed: 'default',
};

export interface Chair {
  id: string;
  code: string;
  area: string;
  model: string;
  purchaseDate: string;
  gasRodBatch: string;
  armrestType: ArmrestType;
  photo?: string;
  disabled?: boolean;
}

export interface RepairOrder {
  id: string;
  chairId: string;
  reporter: string;
  faultTypes: FaultType[];
  frequency: Frequency;
  description: string;
  status: OrderStatus;
  createdAt: string;
  assignee?: string;
  repair?: RepairRecord;
  needDisable?: boolean;
}

export interface Part {
  name: string;
  quantity: number;
  unitCost: number;
}

export interface RepairRecord {
  id: string;
  orderId: string;
  startedAt: string;
  finishedAt: string;
  partsReplaced: Part[];
  laborCost: number;
  totalCost: number;
  handler: string;
  needDisable: boolean;
  beforePhoto?: string;
  afterPhoto?: string;
  notes: string;
}

export const AREAS = ['A区研发部', 'B区产品部', 'C区市场部', 'D区行政部', 'E区会议室', 'F区休息区'];
export const MODELS = ['冈村 Contessa 2', '海沃氏 Zody', 'Herman Miller Aeron', '西昊 C300', '黑白调 E3', '永艺 Mellet'];
export const HANDLERS = ['李师傅', '王师傅', '赵师傅', '孙师傅'];

import type { FaultPhenomenon, FaultStatus } from './types';

export const BUILDINGS = [
  { code: 'A1', name: 'A1栋', floors: 32 },
  { code: 'A2', name: 'A2栋', floors: 32 },
  { code: 'A3', name: 'A3栋', floors: 28 },
  { code: 'B1', name: 'B1栋', floors: 24 },
  { code: 'B2', name: 'B2栋', floors: 24 },
  { code: 'C1', name: 'C1栋', floors: 18 },
  { code: 'C2', name: 'C2栋', floors: 18 },
  { code: 'D1', name: 'D1栋', floors: 11 },
];

export const UNITS = ['1单元', '2单元', '3单元'];

export const ELEVATORS_PER_UNIT = ['1号梯', '2号梯'];

export const PHENOMENON_OPTIONS: { value: FaultPhenomenon; label: string; icon: string }[] = [
  { value: 'door_stuck', label: '门卡/打不开', icon: 'door' },
  { value: 'not_moving', label: '不运行/停运', icon: 'pause' },
  { value: 'strange_noise', label: '异常响声', icon: 'volume' },
  { value: 'button_fault', label: '按键失灵', icon: 'keyboard' },
  { value: 'light_out', label: '灯不亮', icon: 'lightbulb' },
  { value: 'air_condition', label: '空调/通风故障', icon: 'wind' },
  { value: 'display_error', label: '显示错误', icon: 'monitor' },
  { value: 'other', label: '其他', icon: 'more' },
];

export const STATUS_CONFIG: Record<
  FaultStatus,
  { label: string; color: string; bg: string; border: string; dot: string; text: string }
> = {
  urgent: {
    label: '紧急',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-300',
    dot: 'bg-red-500',
    text: '紧急待处理',
  },
  processing: {
    label: '处理中',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    dot: 'bg-orange-500',
    text: '正在维修处理',
  },
  waiting_parts: {
    label: '等配件',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    dot: 'bg-amber-500',
    text: '等待配件中',
  },
  recovered: {
    label: '已恢复',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    dot: 'bg-emerald-500',
    text: '电梯已恢复运行',
  },
  repeated: {
    label: '反复故障',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-400',
    dot: 'bg-yellow-500',
    text: '该电梯故障频发',
  },
};

export const STATUS_TAB_ORDER: FaultStatus[] = ['urgent', 'processing', 'waiting_parts', 'recovered', 'repeated'];

export const STORAGE_KEYS = {
  TICKETS: 'elevator_fault_tickets_v1',
  SUBSCRIPTIONS: 'elevator_subscriptions_v1',
  ROLE: 'elevator_user_role_v1',
  NOTIFICATIONS: 'elevator_notifications_v1',
};

export const HANDLER_OPTIONS = ['张师傅', '李师傅', '王师傅', '赵师傅', '陈师傅', '外包维修队'];

export type SeatStatus = 'quiet' | 'warning' | 'serious';

export type NoiseType = 'call' | 'keyboard' | 'eating' | 'occupied' | 'talking' | 'equipment';

export type HandleResult = 'reminded' | 'moved' | 'cleared' | 'false_alarm' | 'pending';

export type Floor = 1 | 2 | 3;

export type Zone = 'A' | 'B' | 'C';

export interface Seat {
  id: string;
  floor: Floor;
  zone: Zone;
  deskNumber: number;
  seatNumber: number;
  status: SeatStatus;
  feedbackCount24h: number;
  isOccupied: boolean;
}

export interface Feedback {
  id: string;
  seatId: string;
  floor: Floor;
  zone: Zone;
  deskNumber: number;
  seatNumber: number;
  noiseType: NoiseType;
  occurTime: string;
  submitTime: string;
  photos: string[];
  reporterId: string;
  reporterName: string;
  status: HandleResult;
  handleTime?: string;
  handlerId?: string;
  handlerName?: string;
}

export interface Statistics {
  topZones: { zone: string; count: number }[];
  avgHandleTime: number;
  repeatReporters: { id: string; name: string; count: number }[];
  freeSeatsByFloor: { floor: number; count: number }[];
  quietestPeriods: { day: number; hour: number; score: number }[][];
}

export const NOISE_TYPE_LABELS: Record<NoiseType, string> = {
  call: '通话',
  keyboard: '键盘声',
  eating: '吃东西',
  occupied: '占座',
  talking: '聊天',
  equipment: '设备噪音',
};

export const HANDLE_RESULT_LABELS: Record<HandleResult, string> = {
  reminded: '已提醒',
  moved: '建议换座',
  cleared: '已清场',
  false_alarm: '误报',
  pending: '待处理',
};

export const FLOOR_LABELS: Record<Floor, string> = {
  1: '1楼',
  2: '2楼',
  3: '3楼',
};

export const ZONE_LABELS: Record<Zone, string> = {
  A: 'A区',
  B: 'B区',
  C: 'C区',
};

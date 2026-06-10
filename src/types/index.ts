export type RoomStatus = 'normal' | 'repairing' | 'missing_parts' | 'not_inspected';

export type TicketStatus = 'pending' | 'assigned' | 'processing' | 'completed';

export type DeviceType = 'projector' | 'sound' | 'remote' | 'camera' | 'whiteboard' | 'other';

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  projector: string;
  microphone: string;
  camera: string;
  whiteboard: string;
  manager: string;
  managerContact?: string;
  status: RoomStatus;
  lastInspectedAt: string | null;
  createdAt: string;
}

export interface Inspection {
  id: string;
  roomId: string;
  inspectedAt: string;
  inspector: string;
  projectorOk: boolean;
  soundOk: boolean;
  remotePresent: boolean;
  batteryOk: boolean;
  photos: string[];
  notes: string;
  result: 'normal' | 'needs_repair' | 'missing_parts';
}

export interface Ticket {
  id: string;
  roomId: string;
  title: string;
  description: string;
  reporterName: string;
  reporterContact: string;
  meetingTime?: string;
  deviceType: DeviceType;
  status: TicketStatus;
  createdAt: string;
  assignedAt?: string;
  completedAt?: string;
  assignee?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface TicketLog {
  id: string;
  ticketId: string;
  action: string;
  operator: string;
  note?: string;
  createdAt: string;
}

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  normal: '正常',
  repairing: '待维修',
  missing_parts: '缺配件',
  not_inspected: '今日未巡检',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  pending: '待派单',
  assigned: '已派单',
  processing: '处理中',
  completed: '已修好',
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  projector: '投屏设备',
  sound: '音响/麦克风',
  remote: '遥控器',
  camera: '摄像头',
  whiteboard: '白板',
  other: '其他',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
};

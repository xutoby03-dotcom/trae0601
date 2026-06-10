import type { Room, Inspection, Ticket, TicketLog } from '@/types';

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

export const mockRooms: Room[] = [
  {
    id: 'room-1',
    name: '创新会议室',
    location: 'A栋3层301',
    capacity: 10,
    projector: '爱普生 CB-X49',
    microphone: '舒尔无线麦 x2',
    camera: '罗技 C930e',
    whiteboard: '交互式电子白板',
    manager: '张小明',
    managerContact: '13800138001',
    status: 'normal',
    lastInspectedAt: todayAt(9, 0),
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'room-2',
    name: '协作会议室',
    location: 'A栋3层302',
    capacity: 6,
    projector: '极米 H3S',
    microphone: '有线麦 x2',
    camera: '无',
    whiteboard: '普通白板',
    manager: '李华',
    managerContact: '13800138002',
    status: 'repairing',
    lastInspectedAt: yesterdayAt(14, 30),
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'room-3',
    name: '董事会议室',
    location: 'B栋5层501',
    capacity: 20,
    projector: '索尼 VPL-FHZ70',
    microphone: '博世会议系统 x8',
    camera: '思科 SX20',
    whiteboard: '交互式电子白板 x2',
    manager: '王芳',
    managerContact: '13800138003',
    status: 'normal',
    lastInspectedAt: todayAt(8, 30),
    createdAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'room-4',
    name: '培训室',
    location: 'A栋2层201',
    capacity: 30,
    projector: '明基 E592',
    microphone: '手持无线麦 x2',
    camera: '无',
    whiteboard: '普通白板 x2',
    manager: '赵强',
    managerContact: '13800138004',
    status: 'missing_parts',
    lastInspectedAt: todayAt(10, 0),
    createdAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'room-5',
    name: '头脑风暴室',
    location: 'C栋1层101',
    capacity: 8,
    projector: '极米 Z6X',
    microphone: '内置麦克风',
    camera: '罗技 Brio',
    whiteboard: '玻璃白板 x3',
    manager: '陈静',
    managerContact: '13800138005',
    status: 'not_inspected',
    lastInspectedAt: yesterdayAt(16, 0),
    createdAt: yesterday.toISOString(),
  },
  {
    id: 'room-6',
    name: '视频会议室',
    location: 'B栋3层305',
    capacity: 12,
    projector: '爱普生 CB-2265U',
    microphone: '宝利通全向麦',
    camera: '宝利通 Studio',
    whiteboard: '普通白板',
    manager: '周磊',
    managerContact: '13800138006',
    status: 'normal',
    lastInspectedAt: todayAt(9, 30),
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'room-7',
    name: '小型洽谈室',
    location: 'A栋1层102',
    capacity: 4,
    projector: '无',
    microphone: '无',
    camera: '无',
    whiteboard: '小型白板',
    manager: '吴敏',
    managerContact: '13800138007',
    status: 'not_inspected',
    lastInspectedAt: twoDaysAgo.toISOString(),
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'room-8',
    name: '路演厅',
    location: 'C栋1层',
    capacity: 50,
    projector: '科视 4K激光',
    microphone: '专业手持麦 x4 + 头戴麦 x2',
    camera: '索尼专业摄像机 x2',
    whiteboard: '无',
    manager: '孙涛',
    managerContact: '13800138008',
    status: 'repairing',
    lastInspectedAt: yesterdayAt(11, 0),
    createdAt: twoDaysAgo.toISOString(),
  },
];

function todayAt(hour: number, minute: number): string {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function yesterdayAt(hour: number, minute: number): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

export const mockInspections: Inspection[] = [
  {
    id: 'insp-1',
    roomId: 'room-1',
    inspectedAt: todayAt(9, 0),
    inspector: '张小明',
    projectorOk: true,
    soundOk: true,
    remotePresent: true,
    batteryOk: true,
    photos: [],
    notes: '一切正常',
    result: 'normal',
  },
  {
    id: 'insp-2',
    roomId: 'room-2',
    inspectedAt: yesterdayAt(14, 30),
    inspector: '李华',
    projectorOk: false,
    soundOk: true,
    remotePresent: true,
    batteryOk: true,
    photos: [],
    notes: '投影仪灯泡老化，画面偏黄，需要更换',
    result: 'needs_repair',
  },
  {
    id: 'insp-3',
    roomId: 'room-3',
    inspectedAt: todayAt(8, 30),
    inspector: '王芳',
    projectorOk: true,
    soundOk: true,
    remotePresent: true,
    batteryOk: true,
    photos: [],
    notes: '设备运行良好',
    result: 'normal',
  },
  {
    id: 'insp-4',
    roomId: 'room-4',
    inspectedAt: todayAt(10, 0),
    inspector: '赵强',
    projectorOk: true,
    soundOk: true,
    remotePresent: false,
    batteryOk: true,
    photos: [],
    notes: '缺少投影仪遥控器',
    result: 'missing_parts',
  },
  {
    id: 'insp-5',
    roomId: 'room-5',
    inspectedAt: yesterdayAt(16, 0),
    inspector: '陈静',
    projectorOk: true,
    soundOk: true,
    remotePresent: true,
    batteryOk: true,
    photos: [],
    notes: '正常',
    result: 'normal',
  },
  {
    id: 'insp-6',
    roomId: 'room-6',
    inspectedAt: todayAt(9, 30),
    inspector: '周磊',
    projectorOk: true,
    soundOk: true,
    remotePresent: true,
    batteryOk: true,
    photos: [],
    notes: '视频会议系统正常',
    result: 'normal',
  },
  {
    id: 'insp-7',
    roomId: 'room-8',
    inspectedAt: yesterdayAt(11, 0),
    inspector: '孙涛',
    projectorOk: true,
    soundOk: false,
    remotePresent: true,
    batteryOk: false,
    photos: [],
    notes: '2号手持麦无声音，电池也没电了',
    result: 'needs_repair',
  },
];

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    roomId: 'room-2',
    title: '投影仪画面偏黄',
    description: '投影仪灯泡老化，画面偏黄，影响会议展示效果。下午有重要客户会议需要使用。',
    reporterName: '李华',
    reporterContact: '13800138002',
    meetingTime: '今天 14:00',
    deviceType: 'projector',
    status: 'processing',
    createdAt: yesterdayAt(15, 0),
    assignedAt: yesterdayAt(16, 0),
    assignee: 'IT运维-王工',
    priority: 'high',
  },
  {
    id: 'ticket-2',
    roomId: 'room-4',
    title: '缺少投影仪遥控器',
    description: '培训室找不到投影仪遥控器，无法正常使用。',
    reporterName: '赵强',
    reporterContact: '13800138004',
    meetingTime: '明天 10:00',
    deviceType: 'remote',
    status: 'assigned',
    createdAt: todayAt(10, 30),
    assignedAt: todayAt(11, 0),
    assignee: '行政部-小刘',
    priority: 'medium',
  },
  {
    id: 'ticket-3',
    roomId: 'room-8',
    title: '手持麦克风无声音',
    description: '2号手持麦克风没有声音，电池也没电了，需要更换电池或维修。',
    reporterName: '孙涛',
    reporterContact: '13800138008',
    meetingTime: '周五 09:00',
    deviceType: 'sound',
    status: 'pending',
    createdAt: yesterdayAt(11, 30),
    priority: 'high',
  },
  {
    id: 'ticket-4',
    roomId: 'room-1',
    title: '白板笔用完了',
    description: '会议室白板笔都干了，需要补充新的白板笔。',
    reporterName: '员工-小周',
    reporterContact: '13800138099',
    meetingTime: '',
    deviceType: 'whiteboard',
    status: 'completed',
    createdAt: twoDaysAgo.toISOString(),
    assignedAt: twoDaysAgo.toISOString(),
    completedAt: yesterdayAt(10, 0),
    assignee: '行政部-小刘',
    priority: 'low',
  },
  {
    id: 'ticket-5',
    roomId: 'room-3',
    title: '摄像头画面模糊',
    description: '视频会议时摄像头画面模糊，需要调试或清洁镜头。',
    reporterName: '王芳',
    reporterContact: '13800138003',
    meetingTime: '今天 16:00',
    deviceType: 'camera',
    status: 'completed',
    createdAt: threeDaysAgo.toISOString(),
    assignedAt: threeDaysAgo.toISOString(),
    completedAt: twoDaysAgo.toISOString(),
    assignee: 'IT运维-李工',
    priority: 'medium',
  },
  {
    id: 'ticket-6',
    roomId: 'room-6',
    title: '投屏经常断连',
    description: '无线投屏经常断连，影响会议效率。',
    reporterName: '员工-小吴',
    reporterContact: '13800138088',
    meetingTime: '本周内',
    deviceType: 'projector',
    status: 'pending',
    createdAt: todayAt(14, 0),
    priority: 'medium',
  },
];

export const mockTicketLogs: TicketLog[] = [
  {
    id: 'log-1',
    ticketId: 'ticket-1',
    action: '创建工单',
    operator: '李华',
    createdAt: yesterdayAt(15, 0),
  },
  {
    id: 'log-2',
    ticketId: 'ticket-1',
    action: '派单',
    operator: '管理员',
    note: '指派给 IT运维-王工',
    createdAt: yesterdayAt(16, 0),
  },
  {
    id: 'log-3',
    ticketId: 'ticket-1',
    action: '开始处理',
    operator: 'IT运维-王工',
    note: '已联系供应商，灯泡预计明天到货',
    createdAt: todayAt(9, 0),
  },
  {
    id: 'log-4',
    ticketId: 'ticket-2',
    action: '创建工单',
    operator: '赵强',
    createdAt: todayAt(10, 30),
  },
  {
    id: 'log-5',
    ticketId: 'ticket-2',
    action: '派单',
    operator: '管理员',
    note: '指派给行政部-小刘',
    createdAt: todayAt(11, 0),
  },
  {
    id: 'log-6',
    ticketId: 'ticket-3',
    action: '创建工单',
    operator: '孙涛',
    createdAt: yesterdayAt(11, 30),
  },
  {
    id: 'log-7',
    ticketId: 'ticket-4',
    action: '创建工单',
    operator: '员工-小周',
    createdAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'log-8',
    ticketId: 'ticket-4',
    action: '派单',
    operator: '管理员',
    note: '指派给行政部-小刘',
    createdAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'log-9',
    ticketId: 'ticket-4',
    action: '完成维修',
    operator: '行政部-小刘',
    note: '已补充白板笔',
    createdAt: yesterdayAt(10, 0),
  },
  {
    id: 'log-10',
    ticketId: 'ticket-5',
    action: '创建工单',
    operator: '王芳',
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'log-11',
    ticketId: 'ticket-5',
    action: '派单',
    operator: '管理员',
    note: '指派给 IT运维-李工',
    createdAt: threeDaysAgo.toISOString(),
  },
  {
    id: 'log-12',
    ticketId: 'ticket-5',
    action: '完成维修',
    operator: 'IT运维-李工',
    note: '已清洁镜头并调试焦距',
    createdAt: twoDaysAgo.toISOString(),
  },
  {
    id: 'log-13',
    ticketId: 'ticket-6',
    action: '创建工单',
    operator: '员工-小吴',
    createdAt: todayAt(14, 0),
  },
];

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}月${day}日 ${hours}:${minutes}`;
}

export function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

export function getDurationHours(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffMs = endDate.getTime() - startDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60));
}

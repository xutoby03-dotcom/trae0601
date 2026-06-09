export type TicketStatus = 'pending' | 'repairing' | 'resolved' | 'procurement'
export type Urgency = 'urgent' | 'high' | 'normal'
export type RoomStatus = 'active' | 'maintenance'

export interface PhotoItem {
  url: string
  caption: string
}

export function normalizePhotos(raw: PhotoItem[] | string[]): PhotoItem[] {
  if (!raw || raw.length === 0) return []
  if (typeof raw[0] === 'string') {
    return (raw as string[]).map((url) => ({ url, caption: '' }))
  }
  return raw as PhotoItem[]
}

export interface MeetingRoom {
  id: string
  name: string
  floor: string
  capacity: number
  equipment: string[]
  responsiblePerson: string
  status: RoomStatus
}

export interface Ticket {
  id: string
  roomId: string
  equipmentType: string
  faultDescription: string
  urgency: Urgency
  photos: PhotoItem[]
  affectedMeetingTime: string
  status: TicketStatus
  createdAt: string
  assignee: string
  faultCause: string
  solution: string
  needVendor: boolean
  estimatedRecovery: string
  completedAt: string
  reporter: string
}

export const EQUIPMENT_OPTIONS = [
  '投影仪',
  '麦克风',
  '白板',
  '视频会议终端',
  '音响系统',
  '显示屏',
  'HDMI线缆',
  '电源插座',
  '空调',
  '网络设备',
  '电子白板',
  '翻页笔',
]

export const FAULT_PRESETS: Record<string, string[]> = {
  '投影仪': ['无法开机', '画面模糊', '画面偏色', '无信号', '灯泡故障', '遥控器失灵'],
  '麦克风': ['无声音', '杂音干扰', '音量过小', '电池耗尽', '连接失败', '啸叫'],
  '白板': ['白板笔没墨', '白板擦丢失', '白板表面损坏', '磁扣缺失'],
  '视频会议终端': ['无法启动', '摄像头故障', '对方听不到', '画面卡顿', '账号登录失败'],
  '音响系统': ['无声音', '杂音', '音量失控', '蓝牙连接失败', '喇叭损坏'],
  '显示屏': ['黑屏', '花屏', '色彩异常', '触控失灵', '接口松动'],
  'HDMI线缆': ['线缆缺失', '接口损坏', '信号不稳定', '线缆过短'],
  '电源插座': ['插座损坏', '供电不足', '接口不匹配', '线路故障'],
  '空调': ['无法启动', '制冷不足', '噪音过大', '遥控器丢失', '漏水'],
  '网络设备': ['无网络', '网速慢', 'WiFi密码错误', '路由器故障'],
  '电子白板': ['无法开机', '触控不准', '软件崩溃', '连接失败', '笔尖磨损'],
  '翻页笔': ['电池耗尽', '接收器丢失', '按键失灵', '连接失败'],
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  pending: '待处理',
  repairing: '维修中',
  resolved: '已修好',
  procurement: '需采购',
}

export const URGENCY_LABELS: Record<Urgency, string> = {
  urgent: '紧急',
  high: '较急',
  normal: '一般',
}

export const FLOORS = ['1F', '2F', '3F', '4F', '5F', '6F', '7F', '8F', '9F', '10F', 'B1', 'B2']

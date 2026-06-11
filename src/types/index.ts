export type ScreenSupportMethod = "wired" | "wireless" | "both";

export type RoomStatus = "available" | "in_use" | "faulty";

export type BookingStatus = "upcoming" | "ongoing" | "completed" | "overtime";

export type FaultStatus = "pending" | "repairing" | "resolved";

export interface MeetingRoom {
  id: string;
  name: string;
  screenName: string;
  supportMethod: ScreenSupportMethod;
  location: string;
  admin: string;
  adminPhone: string;
  faultPhotos: string[];
  status: RoomStatus;
  createdAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  topic: string;
  startTime: string;
  endTime: string;
  equipmentNeeds: string;
  host: string;
  hostPhone: string;
  status: BookingStatus;
  createdAt: string;
}

export interface FaultReport {
  id: string;
  roomId: string;
  description: string;
  photos: string[];
  reporter: string;
  reporterPhone: string;
  status: FaultStatus;
  repairNote?: string;
  createdAt: string;
  resolvedAt?: string;
}

export const SCREEN_SUPPORT_METHOD_LABELS: Record<ScreenSupportMethod, string> = {
  wired: "有线投屏",
  wireless: "无线投屏",
  both: "有线+无线",
};

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
  available: "空闲",
  in_use: "使用中",
  faulty: "故障",
};

export const ROOM_STATUS_COLORS: Record<RoomStatus, string> = {
  available: "bg-green-100 text-green-700",
  in_use: "bg-blue-100 text-blue-700",
  faulty: "bg-red-100 text-red-700",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  upcoming: "即将开始",
  ongoing: "进行中",
  completed: "已结束",
  overtime: "已超时",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  upcoming: "bg-yellow-100 text-yellow-700",
  ongoing: "bg-green-100 text-green-700",
  completed: "bg-gray-100 text-gray-700",
  overtime: "bg-red-100 text-red-700",
};

export const FAULT_STATUS_LABELS: Record<FaultStatus, string> = {
  pending: "待处理",
  repairing: "维修中",
  resolved: "已解决",
};

export const FAULT_STATUS_COLORS: Record<FaultStatus, string> = {
  pending: "bg-orange-100 text-orange-700",
  repairing: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
};

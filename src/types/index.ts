export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  heaterModel: string;
  capacityLiters: number;
  heaterType: 'gas' | 'electric';
  installDate: string;
  lastMaintenanceDate: string;
  photoUrl: string;
  status: 'active' | 'maintenance' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface Inspection {
  id: string;
  roomId: string;
  inspectionDate: string;
  inspector: string;
  waterTemperature: number;
  waterFlowRate: number;
  hasLeak: boolean;
  hasNoise: boolean;
  alarmCode: string;
  socketNormal: boolean;
  exhaustNormal: boolean;
  notes: string;
  status: 'normal' | 'warning' | 'critical';
  photos: string[];
}

export interface Complaint {
  id: string;
  roomId: string;
  orderId: string;
  orderNumber: string;
  guestName: string;
  complaintDate: string;
  complaintType: 'not_hot' | 'unstable' | 'tripping' | 'other';
  description: string;
  status: 'pending' | 'processing' | 'resolved' | 'closed';
  handlingNotes: string;
}

export interface Repair {
  id: string;
  roomId: string;
  sourceType: 'inspection' | 'complaint' | 'routine';
  sourceId: string;
  title: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignee: string;
  scheduledDate: string;
  completedDate: string | null;
  cost: number;
  notes: string;
}

export interface Maintenance {
  id: string;
  roomId: string;
  date: string;
  type: string;
  description: string;
  technician: string;
  cost: number;
  notes: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  roomId: string;
}

export type HeaterType = 'gas' | 'electric';
export type RoomStatus = 'active' | 'maintenance' | 'disabled';
export type InspectionStatus = 'normal' | 'warning' | 'critical';
export type ComplaintType = 'not_hot' | 'unstable' | 'tripping' | 'other';
export type ComplaintStatus = 'pending' | 'processing' | 'resolved' | 'closed';
export type RepairStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
export type RepairSourceType = 'inspection' | 'complaint' | 'routine';

export interface LifespanInfo {
  years: number;
  percentage: number;
  level: 'normal' | 'warning' | 'critical';
}

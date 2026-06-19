import type {
  Room,
  Inspection,
  LifespanInfo,
  HeaterType,
  RoomStatus,
  InspectionStatus,
  ComplaintType,
  ComplaintStatus,
  RepairStatus,
} from '@/types';

export const getRoomStatusLabel = (status: RoomStatus): string => {
  const labels: Record<RoomStatus, string> = {
    active: '正常营业',
    maintenance: '维修中',
    disabled: '已停用',
  };
  return labels[status];
};

export const getRoomStatusColor = (status: RoomStatus): string => {
  const colors: Record<RoomStatus, string> = {
    active: 'bg-success-100 text-success-700',
    maintenance: 'bg-warning-100 text-warning-700',
    disabled: 'bg-dark-200 text-dark-600',
  };
  return colors[status];
};

export const getHeaterTypeLabel = (type: HeaterType): string => {
  return type === 'gas' ? '燃气热水器' : '电热水器';
};

export const getInspectionStatusLabel = (status: InspectionStatus): string => {
  const labels: Record<InspectionStatus, string> = {
    normal: '正常',
    warning: '警告',
    critical: '严重异常',
  };
  return labels[status];
};

export const getInspectionStatusColor = (status: InspectionStatus): string => {
  const colors: Record<InspectionStatus, string> = {
    normal: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    critical: 'bg-danger-100 text-danger-700',
  };
  return colors[status];
};

export const getComplaintTypeLabel = (type: ComplaintType): string => {
  const labels: Record<ComplaintType, string> = {
    not_hot: '水不热',
    unstable: '忽冷忽热',
    tripping: '跳闸',
    other: '其他问题',
  };
  return labels[type];
};

export const getComplaintStatusLabel = (status: ComplaintStatus): string => {
  const labels: Record<ComplaintStatus, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    closed: '已关闭',
  };
  return labels[status];
};

export const getComplaintStatusColor = (status: ComplaintStatus): string => {
  const colors: Record<ComplaintStatus, string> = {
    pending: 'bg-danger-100 text-danger-700',
    processing: 'bg-warning-100 text-warning-700',
    resolved: 'bg-success-100 text-success-700',
    closed: 'bg-dark-200 text-dark-600',
  };
  return colors[status];
};

export const getRepairStatusLabel = (status: RepairStatus): string => {
  const labels: Record<RepairStatus, string> = {
    pending: '待派单',
    assigned: '已派单',
    in_progress: '维修中',
    completed: '已完成',
    cancelled: '已取消',
  };
  return labels[status];
};

export const getRepairStatusColor = (status: RepairStatus): string => {
  const colors: Record<RepairStatus, string> = {
    pending: 'bg-dark-200 text-dark-600',
    assigned: 'bg-primary-100 text-primary-700',
    in_progress: 'bg-warning-100 text-warning-700',
    completed: 'bg-success-100 text-success-700',
    cancelled: 'bg-dark-100 text-dark-500',
  };
  return colors[status];
};

export const calculateLifespan = (room: Room): LifespanInfo => {
  const installDate = new Date(room.installDate);
  const now = new Date();
  const years = (now.getTime() - installDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  
  const maxYears = room.heaterType === 'gas' ? 8 : 10;
  const percentage = Math.min((years / maxYears) * 100, 100);
  
  let level: LifespanInfo['level'] = 'normal';
  const warningThreshold = room.heaterType === 'gas' ? 6 : 8;
  const criticalThreshold = room.heaterType === 'gas' ? 7.5 : 9.5;
  
  if (years >= criticalThreshold) {
    level = 'critical';
  } else if (years >= warningThreshold) {
    level = 'warning';
  }
  
  return {
    years: Math.round(years * 10) / 10,
    percentage: Math.round(percentage),
    level,
  };
};

export const evaluateInspectionStatus = (inspection: {
  waterTemperature: number;
  waterFlowRate: number;
  hasLeak: boolean;
  hasNoise: boolean;
  alarmCode: string;
  socketNormal: boolean;
  exhaustNormal: boolean;
}): InspectionStatus => {
  const hasCriticalIssue = 
    inspection.hasLeak || 
    inspection.hasNoise || 
    inspection.alarmCode !== '' ||
    !inspection.socketNormal ||
    !inspection.exhaustNormal ||
    inspection.waterTemperature < 35 ||
    inspection.waterTemperature > 60;
  
  const hasWarningIssue = 
    inspection.waterTemperature < 40 ||
    inspection.waterTemperature > 55 ||
    inspection.waterFlowRate < 6;
  
  if (hasCriticalIssue) {
    return 'critical';
  }
  if (hasWarningIssue) {
    return 'warning';
  }
  return 'normal';
};

export const isPeakSeasonCheck = (room: Room, lastRepairDate?: string, recentComplaints?: number): boolean => {
  const lifespan = calculateLifespan(room);
  
  if (lifespan.years > 5) return true;
  if (room.floor > 10) return true;
  if (recentComplaints && recentComplaints > 0) return true;
  if (lastRepairDate) {
    const daysSinceRepair = (new Date().getTime() - new Date(lastRepairDate).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceRepair < 90) return true;
  }
  
  return false;
};

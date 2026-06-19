import type { Inspection, MaintenanceTask, TaskType, TaskPriority } from '@/constants';
import { generateId, todayStr } from './dateUtils';

interface DetectedAnomaly {
  task_type: TaskType;
  description: string;
  priority: TaskPriority;
}

export const detectAnomalies = (inspection: Omit<Inspection, 'id' | 'has_anomaly' | 'anomaly_types' | 'created_at'>): DetectedAnomaly[] => {
  const anomalies: DetectedAnomaly[] = [];

  if (inspection.battery_level === 'dead') {
    anomalies.push({ task_type: 'battery', description: '电池无电，需立即更换', priority: 'high' });
  } else if (inspection.battery_level === 'low') {
    anomalies.push({ task_type: 'battery', description: '电池电量低，建议尽快更换', priority: 'high' });
  }

  if (inspection.sound_status === 'silent') {
    anomalies.push({ task_type: 'sound', description: '按下测试键完全无声，传感器或蜂鸣器可能失效', priority: 'high' });
  } else if (inspection.sound_status === 'weak') {
    anomalies.push({ task_type: 'sound', description: '报警声音微弱，需检查蜂鸣器', priority: 'medium' });
  }

  if (inspection.light_status === 'off') {
    anomalies.push({ task_type: 'sound', description: '指示灯不亮，需检查电源或LED', priority: 'medium' });
  } else if (inspection.light_status === 'blink') {
    anomalies.push({ task_type: 'sound', description: '指示灯异常闪烁，需排查原因', priority: 'medium' });
  }

  if (inspection.hose_status === 'damaged') {
    anomalies.push({ task_type: 'hose', description: '灶具软管有破损，存在泄漏风险，立即更换', priority: 'high' });
  } else if (inspection.hose_status === 'aging') {
    anomalies.push({ task_type: 'hose', description: '灶具软管老化，建议安排更换', priority: 'high' });
  }

  if (inspection.valve_status === 'leak') {
    anomalies.push({ task_type: 'valve', description: '阀门存在漏气！请立即关闭燃气总阀并联系专业人员', priority: 'high' });
  } else if (inspection.valve_status === 'loose') {
    anomalies.push({ task_type: 'valve', description: '阀门连接松动，需紧固并检测密封性', priority: 'medium' });
  }

  return anomalies;
};

export const anomaliesToTasks = (
  anomalies: DetectedAnomaly[],
  deviceId: string,
  inspectionId: string
): MaintenanceTask[] => {
  return anomalies.map(a => ({
    id: generateId(),
    device_id: deviceId,
    inspection_id: inspectionId,
    task_type: a.task_type,
    description: a.description,
    status: 'pending',
    priority: a.priority,
    assignee: '',
    handle_remark: '',
    created_at: todayStr(),
  }));
};

export const buildInspectionAnomalyTypes = (anomalies: DetectedAnomaly[]): string[] => {
  const types = new Set<string>();
  anomalies.forEach(a => types.add(a.task_type));
  return Array.from(types);
};

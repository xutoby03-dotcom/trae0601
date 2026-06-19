import type { Device, Inspection, MaintenanceTask } from '@/constants';
import { generateId, addMonths } from './dateUtils';
import { detectAnomalies, buildInspectionAnomalyTypes } from './anomalyDetector';

const now = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const mockDevices: Device[] = [
  {
    id: 'dev_kitchen',
    location: '厨房主位（燃气灶上方）',
    model: 'HD1000 家用燃气报警器',
    install_date: iso(-400),
    battery_type: 'AA',
    battery_replace_date: iso(-380),
    maintenance_phone: '400-812-3456',
    photo: undefined,
    created_at: iso(-400),
  },
  {
    id: 'dev_balcony',
    location: '阳台壁挂炉旁',
    model: 'JT-GBW-808 燃气报警器',
    install_date: iso(-600),
    battery_type: 'CR123A',
    battery_replace_date: iso(-550),
    maintenance_phone: '400-888-9999',
    photo: undefined,
    created_at: iso(-600),
  },
  {
    id: 'dev_basement',
    location: '地下室热水器旁',
    model: 'GS834 可燃气体探测器',
    install_date: iso(-200),
    battery_type: '9V',
    battery_replace_date: iso(-190),
    maintenance_phone: '138-0000-1234',
    photo: undefined,
    created_at: iso(-200),
  },
];

const buildInspection = (
  deviceId: string,
  daysAgo: number,
  opts: Partial<Omit<Inspection, 'id' | 'device_id' | 'inspect_date' | 'has_anomaly' | 'anomaly_types' | 'created_at'>> = {}
): Inspection => {
  const base = {
    sound_status: 'normal' as const,
    light_status: 'normal' as const,
    ventilation: 'good' as const,
    hose_status: 'normal' as const,
    valve_status: 'normal' as const,
    battery_level: 'good' as const,
    remark: '',
    ...opts,
  };
  const anomalies = detectAnomalies({ device_id: deviceId, inspect_date: iso(-daysAgo), ...base });
  return {
    id: generateId(),
    device_id: deviceId,
    inspect_date: iso(-daysAgo),
    ...base,
    has_anomaly: anomalies.length > 0,
    anomaly_types: buildInspectionAnomalyTypes(anomalies),
    created_at: iso(-daysAgo),
  };
};

export const mockInspections: Inspection[] = [
  buildInspection('dev_kitchen', 5, { sound_status: 'silent', battery_level: 'low', remark: '按下测试键没反应，电池指示灯红色' }),
  buildInspection('dev_balcony', 12, { hose_status: 'aging', remark: '橡胶软管有轻微裂纹' }),
  buildInspection('dev_kitchen', 40, {}),
  buildInspection('dev_kitchen', 75, {}),
  buildInspection('dev_balcony', 45, {}),
  buildInspection('dev_basement', 35, { valve_status: 'loose', remark: '连接处有点松，已经用扳手紧了一下' }),
  buildInspection('dev_basement', 65, {}),
];

export const generateMockTasks = (inspections: Inspection[]): MaintenanceTask[] => {
  const tasks: MaintenanceTask[] = [];

  // 根据异常自检记录生成任务
  inspections.forEach(ins => {
    if (!ins.has_anomaly) return;
    const anomalies = detectAnomalies(ins);
    anomalies.forEach((a, idx) => {
      if (ins.device_id === 'dev_kitchen' && idx === 0) {
        tasks.push({
          id: generateId(),
          device_id: ins.device_id,
          inspection_id: ins.id,
          task_type: a.task_type,
          description: a.description,
          status: 'pending',
          priority: a.priority,
          assignee: '',
          handle_remark: '',
          created_at: ins.inspect_date,
        });
      } else if (ins.device_id === 'dev_balcony' && idx === 0) {
        tasks.push({
          id: generateId(),
          device_id: ins.device_id,
          inspection_id: ins.id,
          task_type: a.task_type,
          description: a.description,
          status: 'processing',
          priority: a.priority,
          assignee: '户主本人',
          handle_remark: '',
          created_at: ins.inspect_date,
        });
      } else if (ins.device_id === 'dev_basement' && idx === 0) {
        tasks.push({
          id: generateId(),
          device_id: ins.device_id,
          inspection_id: ins.id,
          task_type: a.task_type,
          description: a.description,
          status: 'done',
          priority: a.priority,
          assignee: '李师傅',
          handle_time: addMonths(ins.inspect_date, 0),
          handle_remark: '已重新紧固阀门接口，涂抹肥皂水检漏无气泡',
          created_at: ins.inspect_date,
        });
      }
    });
  });

  // 电池即将到期任务
  tasks.push({
    id: generateId(),
    device_id: 'dev_basement',
    task_type: 'battery',
    description: '9V叠层电池使用寿命即将到期，建议提前更换',
    status: 'pending',
    priority: 'medium',
    assignee: '',
    handle_remark: '',
    created_at: iso(-2),
  });

  return tasks;
};

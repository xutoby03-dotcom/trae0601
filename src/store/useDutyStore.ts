import { create } from 'zustand';
import type {
  DutyRecord,
  AlertEvent,
  MaintenanceOrder,
  DutyFormData,
  ShiftSummary,
  ProcessStatus,
  AlertType,
} from '../utils/types';
import { generateId } from '../utils/helpers';
import {
  detectIntervalAbnormal,
  detectCondensation,
  shouldTriggerMaintenance,
  createIntervalAlert,
  createCondensationAlert,
} from '../utils/alertDetector';

interface DutyState {
  records: DutyRecord[];
  alerts: AlertEvent[];
  maintenanceOrders: MaintenanceOrder[];
  lowVisibilityStart: number | null;
  shiftStartTime: number;

  addRecord: (data: DutyFormData) => { record: DutyRecord; newAlerts: AlertEvent[] };
  updateAlertStatus: (id: string, status: ProcessStatus, resolution?: string) => void;
  addManualAlert: (alert: Omit<AlertEvent, 'id' | 'timestamp' | 'status'>) => void;
  addMaintenanceOrder: (order: Omit<MaintenanceOrder, 'id' | 'createdAt' | 'status'>) => void;
  updateMaintenanceOrderStatus: (
    id: string,
    status: MaintenanceOrder['status']
  ) => void;
  getSummary: () => ShiftSummary;
  getActiveAlertsByType: (type: AlertType) => AlertEvent[];
  resetShift: () => void;
  loadMockData: () => void;
}

const SHIFT_DURATION = 12 * 60 * 60 * 1000;

export const useDutyStore = create<DutyState>((set, get) => ({
  records: [],
  alerts: [],
  maintenanceOrders: [],
  lowVisibilityStart: null,
  shiftStartTime: Date.now() - 4 * 60 * 60 * 1000,

  addRecord: (data) => {
    const state = get();
    const now = Date.now();
    const newAlerts: AlertEvent[] = [];

    const intervalCheck = detectIntervalAbnormal(data);

    let newLowVisibilityStart = state.lowVisibilityStart;
    if (data.visibility <= 500 && newLowVisibilityStart === null) {
      newLowVisibilityStart = now;
    } else if (data.visibility > 500) {
      newLowVisibilityStart = null;
    }

    const record: DutyRecord = {
      id: generateId(),
      timestamp: now,
      visibility: data.visibility,
      windDirection: data.windDirection,
      windSpeed: data.windSpeed,
      seaState: data.seaState,
      humidity: data.humidity,
      lightPeriod: data.lightPeriod,
      lightPeriodNormal: intervalCheck.lightNormal,
      fogInterval: data.fogInterval,
      fogIntervalNormal: intervalCheck.fogNormal,
      vesselFeedback: data.vesselFeedback,
      vesselCount: data.vesselCount,
      remarks: data.remarks || undefined,
    };

    if (intervalCheck.isAbnormal) {
      const alert = createIntervalAlert(data, intervalCheck.message, record.id);
      if (alert) newAlerts.push(alert);
    }

    const updatedRecords = [...state.records, record];
    const condensationCheck = detectCondensation({
      recentRecords: updatedRecords,
      currentTimestamp: now,
      lowVisibilityStart: newLowVisibilityStart,
    });

    if (condensationCheck.isCondensation) {
      const existingCondensation = state.alerts.find(
        (a) => a.type === 'condensation' && a.status !== 'resolved'
      );
      if (!existingCondensation) {
        newAlerts.push(createCondensationAlert(condensationCheck.message, record.id));
      }
    }

    let newMaintenanceOrder: MaintenanceOrder | null = null;
    if (shouldTriggerMaintenance(updatedRecords)) {
      const existingMaintenance = state.alerts.find(
        (a) => a.type === 'maintenance' && a.status === 'pending'
      );
      if (!existingMaintenance) {
        const last3 = updatedRecords.slice(-3);
        const lightAbnormalCount = last3.filter((r) => !r.lightPeriodNormal).length;
        const fogAbnormalCount = last3.filter((r) => !r.fogIntervalNormal).length;

        const equipmentList: string[] = [];
        const issueList: string[] = [];

        if (lightAbnormalCount > 0) {
          equipmentList.push('航标灯光计时器');
          const abnormalValues = last3
            .filter((r) => !r.lightPeriodNormal)
            .map((r) => `${r.lightPeriod}s`);
          issueList.push(
            `灯光周期连续${lightAbnormalCount}次超出标准范围(2-10s)，异常值: ${abnormalValues.join('、')}`
          );
        }
        if (fogAbnormalCount > 0) {
          equipmentList.push('雾号发声控制器');
          const abnormalValues = last3
            .filter((r) => !r.fogIntervalNormal)
            .map((r) => `${r.fogInterval}s`);
          issueList.push(
            `雾号间隔连续${fogAbnormalCount}次超出标准范围(30-120s)，异常值: ${abnormalValues.join('、')}`
          );
        }

        const equipment = equipmentList.join(' + ');
        const issue = issueList.join('；');
        const description = `最近3条记录中，${issue}，建议立即检修相关计时模块。`;
        const priority =
          lightAbnormalCount >= 3 || fogAbnormalCount >= 3 ? 'high' : 'medium';

        newMaintenanceOrder = {
          id: generateId(),
          createdAt: now,
          equipment,
          issue,
          priority,
          status: 'open',
          description,
        };

        newAlerts.push({
          id: generateId(),
          timestamp: now,
          type: 'maintenance',
          level: priority === 'high' ? 'critical' : 'warning',
          title: `自动生成维护工单：${equipment}`,
          description,
          status: 'pending',
          relatedRecordId: record.id,
        });
      }
    }

    const updatedMaintenanceOrders = newMaintenanceOrder
      ? [...state.maintenanceOrders, newMaintenanceOrder]
      : state.maintenanceOrders;

    set({
      records: updatedRecords,
      alerts: [...state.alerts, ...newAlerts],
      maintenanceOrders: updatedMaintenanceOrders,
      lowVisibilityStart: newLowVisibilityStart,
    });

    return { record, newAlerts };
  },

  updateAlertStatus: (id, status, resolution) => {
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              resolvedAt: status === 'resolved' ? Date.now() : a.resolvedAt,
              resolution: resolution || a.resolution,
            }
          : a
      ),
    }));
  },

  addManualAlert: (alert) => {
    set((state) => ({
      alerts: [
        ...state.alerts,
        {
          ...alert,
          id: generateId(),
          timestamp: Date.now(),
          status: 'pending',
        },
      ],
    }));
  },

  addMaintenanceOrder: (order) => {
    const newOrder: MaintenanceOrder = {
      ...order,
      id: generateId(),
      createdAt: Date.now(),
      status: 'open',
    };
    set((state) => ({
      maintenanceOrders: [...state.maintenanceOrders, newOrder],
      alerts: [
        ...state.alerts,
        {
          id: generateId(),
          timestamp: Date.now(),
          type: 'maintenance',
          level: order.priority === 'high' ? 'critical' : order.priority === 'medium' ? 'warning' : 'info',
          title: `维护工单：${order.equipment}`,
          description: order.issue,
          status: 'pending',
        },
      ],
    }));
  },

  updateMaintenanceOrderStatus: (id, status) => {
    set((state) => ({
      maintenanceOrders: state.maintenanceOrders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    }));
  },

  getSummary: () => {
    const state = get();
    const shiftCutoff = state.shiftStartTime;
    const shiftRecords = state.records.filter((r) => r.timestamp >= shiftCutoff);
    const shiftAlerts = state.alerts.filter((a) => a.timestamp >= shiftCutoff);

    const visibilities = shiftRecords.map((r) => r.visibility);

    return {
      recordCount: shiftRecords.length,
      alertCount: shiftAlerts.length,
      criticalAlertCount: shiftAlerts.filter((a) => a.level === 'critical').length,
      unresolvedAlertCount: shiftAlerts.filter((a) => a.status !== 'resolved').length,
      maintenanceOrderCount: state.maintenanceOrders.filter(
        (o) => o.status !== 'completed'
      ).length,
      avgVisibility:
        visibilities.length > 0
          ? Math.round(visibilities.reduce((a, b) => a + b, 0) / visibilities.length)
          : 0,
      minVisibility: visibilities.length > 0 ? Math.min(...visibilities) : 0,
    };
  },

  getActiveAlertsByType: (type) => {
    const state = get();
    return state.alerts.filter((a) => a.type === type && a.status !== 'resolved');
  },

  resetShift: () => {
    set({
      records: [],
      alerts: [],
      maintenanceOrders: [],
      lowVisibilityStart: null,
      shiftStartTime: Date.now(),
    });
  },

  loadMockData: () => {
    const now = Date.now();
    const baseTime = now - 4 * 60 * 60 * 1000;

    const mockRecords: DutyRecord[] = [];
    const mockAlerts: AlertEvent[] = [];

    for (let i = 0; i < 8; i++) {
      const t = baseTime + i * 30 * 60 * 1000;
      const visibility = [800, 450, 300, 200, 350, 500, 600, 700][i];
      const lightPeriod = [4, 5, 4, 12, 5, 4, 15, 4][i];
      const fogInterval = [60, 60, 25, 60, 60, 130, 60, 60][i];

      const lightNormal = lightPeriod >= 2 && lightPeriod <= 10;
      const fogNormal = fogInterval >= 30 && fogInterval <= 120;

      mockRecords.push({
        id: `mock-record-${i}`,
        timestamp: t,
        visibility,
        windDirection: (['NE', 'E', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const)[i],
        windSpeed: [12, 15, 18, 20, 17, 14, 10, 8][i],
        seaState: ([2, 3, 4, 5, 4, 3, 2, 2] as const)[i],
        humidity: [72, 78, 82, 88, 85, 80, 75, 70][i],
        lightPeriod,
        lightPeriodNormal: lightNormal,
        fogInterval,
        fogIntervalNormal: fogNormal,
        vesselFeedback: (['none', 'positive', 'positive', 'negative', 'positive', 'none', 'positive', 'positive'] as const)[i],
        vesselCount: [0, 2, 3, 1, 2, 0, 1, 2][i],
      });

      if (!lightNormal || !fogNormal) {
        mockAlerts.push({
          id: `mock-alert-interval-${i}`,
          timestamp: t + 60000,
          type: 'interval_abnormal',
          level: !lightNormal && !fogNormal ? 'critical' : 'warning',
          title: '设备周期异常',
          description: `${!lightNormal ? `灯光周期 ${lightPeriod}s 异常；` : ''}${!fogNormal ? `雾号间隔 ${fogInterval}s 异常` : ''}`,
          status: i >= 6 ? 'pending' : i >= 4 ? 'processing' : 'resolved',
          relatedRecordId: `mock-record-${i}`,
          handler: i < 4 ? '张值守' : undefined,
          resolvedAt: i < 4 ? t + 15 * 60000 : undefined,
          resolution: i < 4 ? '已重新校准设备计时器' : undefined,
        });
      }
    }

    mockAlerts.push({
      id: 'mock-alert-power',
      timestamp: baseTime + 2 * 60 * 60 * 1000,
      type: 'power_switch',
      level: 'warning',
      title: '备用电源切换',
      description: '主电源电压波动，已自动切换至备用柴油发电机组',
      status: 'resolved',
      handler: '李值守',
      resolvedAt: baseTime + 2 * 60 * 60 * 1000 + 45 * 60000,
      resolution: '主电源已修复，切换回主电源',
    });

    mockAlerts.push({
      id: 'mock-alert-condensation',
      timestamp: baseTime + 1.5 * 60 * 60 * 1000,
      type: 'condensation',
      level: 'warning',
      title: '设备结露预警',
      description: '湿度达88%且低能见度持续超过30分钟，光学镜头可能结露',
      status: 'processing',
      handler: '张值守',
    });

    mockAlerts.push({
      id: 'mock-alert-maintenance',
      timestamp: baseTime + 3 * 60 * 60 * 1000,
      type: 'maintenance',
      level: 'warning',
      title: '自动生成维护工单',
      description: '连续3次检测到设备周期异常，建议立即检修计时器模块',
      status: 'pending',
    });

    mockAlerts.sort((a, b) => b.timestamp - a.timestamp);

    const mockOrders: MaintenanceOrder[] = [
      {
        id: 'mock-order-1',
        createdAt: baseTime + 3.1 * 60 * 60 * 1000,
        equipment: '雾号计时器',
        issue: '雾号间隔不稳定，出现偏差',
        priority: 'high',
        status: 'open',
        description: '近期多次出现雾号间隔超出30-120秒标准范围',
      },
      {
        id: 'mock-order-2',
        createdAt: baseTime + 1.6 * 60 * 60 * 1000,
        equipment: '光学镜头除露系统',
        issue: '高湿度下除露效果不理想',
        priority: 'medium',
        status: 'in_progress',
        description: '建议更换加热除露膜',
      },
    ];

    set({
      records: mockRecords,
      alerts: mockAlerts,
      maintenanceOrders: mockOrders,
      lowVisibilityStart: mockRecords[3].timestamp,
      shiftStartTime: baseTime,
    });
  },
}));

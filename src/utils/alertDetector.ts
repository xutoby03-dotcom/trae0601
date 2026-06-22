import type { DutyFormData, AlertEvent, AlertLevel, DutyRecord } from './types';
import {
  NORMAL_LIGHT_PERIOD,
  NORMAL_FOG_INTERVAL,
  CONDENSATION_HUMIDITY_THRESHOLD,
  CONDENSATION_VISIBILITY_THRESHOLD,
  CONDENSATION_DURATION_THRESHOLD,
} from './constants';
import { generateId } from './helpers';

interface DetectionContext {
  recentRecords: DutyRecord[];
  currentTimestamp: number;
  lowVisibilityStart: number | null;
}

export function detectIntervalAbnormal(data: DutyFormData): {
  isAbnormal: boolean;
  lightNormal: boolean;
  fogNormal: boolean;
  message: string;
} {
  const lightNormal =
    data.lightPeriod >= NORMAL_LIGHT_PERIOD.min &&
    data.lightPeriod <= NORMAL_LIGHT_PERIOD.max;

  const fogNormal =
    data.fogInterval >= NORMAL_FOG_INTERVAL.min &&
    data.fogInterval <= NORMAL_FOG_INTERVAL.max;

  const messages: string[] = [];
  if (!lightNormal) {
    messages.push(
      `灯光周期 ${data.lightPeriod}s 超出标准范围 (${NORMAL_LIGHT_PERIOD.min}-${NORMAL_LIGHT_PERIOD.max}s)`
    );
  }
  if (!fogNormal) {
    messages.push(
      `雾号间隔 ${data.fogInterval}s 超出标准范围 (${NORMAL_FOG_INTERVAL.min}-${NORMAL_FOG_INTERVAL.max}s)`
    );
  }

  return {
    isAbnormal: !lightNormal || !fogNormal,
    lightNormal,
    fogNormal,
    message: messages.join('；'),
  };
}

export function detectCondensation(ctx: DetectionContext): {
  isCondensation: boolean;
  message: string;
} {
  const { recentRecords, currentTimestamp, lowVisibilityStart } = ctx;
  const latest = recentRecords[recentRecords.length - 1];

  if (!latest) return { isCondensation: false, message: '' };

  if (latest.humidity >= CONDENSATION_HUMIDITY_THRESHOLD) {
    return {
      isCondensation: true,
      message: `环境湿度 ${latest.humidity}% 超过阈值 (${CONDENSATION_HUMIDITY_THRESHOLD}%)，设备可能结露`,
    };
  }

  if (
    latest.visibility <= CONDENSATION_VISIBILITY_THRESHOLD &&
    lowVisibilityStart !== null &&
    currentTimestamp - lowVisibilityStart >= CONDENSATION_DURATION_THRESHOLD
  ) {
    const minutes = Math.round((currentTimestamp - lowVisibilityStart) / 60000);
    return {
      isCondensation: true,
      message: `低能见度 (<=${CONDENSATION_VISIBILITY_THRESHOLD}m) 持续 ${minutes} 分钟，设备可能结露`,
    };
  }

  return { isCondensation: false, message: '' };
}

export function shouldTriggerMaintenance(
  recentRecords: DutyRecord[]
): boolean {
  if (recentRecords.length < 3) return false;

  const last3 = recentRecords.slice(-3);
  const abnormalCount = last3.filter((r) => {
    const lightNormal =
      r.lightPeriod >= NORMAL_LIGHT_PERIOD.min &&
      r.lightPeriod <= NORMAL_LIGHT_PERIOD.max;
    const fogNormal =
      r.fogInterval >= NORMAL_FOG_INTERVAL.min &&
      r.fogInterval <= NORMAL_FOG_INTERVAL.max;
    return !lightNormal || !fogNormal;
  }).length;

  return abnormalCount >= 3;
}

export function createIntervalAlert(
  data: DutyFormData,
  message: string,
  recordId: string
): AlertEvent | null {
  const lightNormal =
    data.lightPeriod >= NORMAL_LIGHT_PERIOD.min &&
    data.lightPeriod <= NORMAL_LIGHT_PERIOD.max;
  const fogNormal =
    data.fogInterval >= NORMAL_FOG_INTERVAL.min &&
    data.fogInterval <= NORMAL_FOG_INTERVAL.max;

  if (lightNormal && fogNormal) return null;

  const bothAbnormal = !lightNormal && !fogNormal;
  const level: AlertLevel = bothAbnormal ? 'critical' : 'warning';
  const title = bothAbnormal ? '灯光与雾号周期双重异常' : '设备周期异常';

  return {
    id: generateId(),
    timestamp: Date.now(),
    type: 'interval_abnormal',
    level,
    title,
    description: message,
    status: 'pending',
    relatedRecordId: recordId,
  };
}

export function createCondensationAlert(
  message: string,
  recordId: string
): AlertEvent {
  return {
    id: generateId(),
    timestamp: Date.now(),
    type: 'condensation',
    level: 'warning',
    title: '设备结露预警',
    description: message,
    status: 'pending',
    relatedRecordId: recordId,
  };
}

export function createPowerSwitchAlert(
  reason: string,
  handler: string
): AlertEvent {
  return {
    id: generateId(),
    timestamp: Date.now(),
    type: 'power_switch',
    level: 'warning',
    title: '备用电源切换',
    description: reason || '主电源故障，已切换至备用电源',
    status: 'pending',
    handler,
  };
}

export function createMaintenanceAlert(
  equipment: string,
  issue: string
): AlertEvent {
  return {
    id: generateId(),
    timestamp: Date.now(),
    type: 'maintenance',
    level: 'info',
    title: `维护工单：${equipment}`,
    description: issue,
    status: 'pending',
  };
}

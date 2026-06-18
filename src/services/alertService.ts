import type { Device, Measurement, Settings, Alert, CuffSize } from '../types';

const getRecommendedCuffSize = (armCircumference: number): CuffSize | null => {
  if (armCircumference >= 22 && armCircumference <= 26) return 'small';
  if (armCircumference >= 27 && armCircumference <= 31) return 'medium';
  if (armCircumference >= 32 && armCircumference <= 36) return 'large';
  if (armCircumference >= 37 && armCircumference <= 42) return 'extra-large';
  return null;
};

const getCuffSizeRange = (size: CuffSize): string => {
  const ranges: Record<CuffSize, string> = {
    small: '22-26cm',
    medium: '27-31cm',
    large: '32-36cm',
    'extra-large': '37-42cm',
  };
  return ranges[size];
};

export const checkMeasurementAbnormal = (
  systolic: number,
  diastolic: number,
  heartRate: number,
  settings: Settings,
  recentMeasurements: Measurement[]
): { isAbnormal: boolean; abnormalReason: string } => {
  const reasons: string[] = [];

  if (systolic > settings.systolicHigh) {
    reasons.push(`收缩压偏高（${systolic} > ${settings.systolicHigh}）`);
  }
  if (systolic < settings.systolicLow) {
    reasons.push(`收缩压偏低（${systolic} < ${settings.systolicLow}）`);
  }
  if (diastolic > settings.diastolicHigh) {
    reasons.push(`舒张压偏高（${diastolic} > ${settings.diastolicHigh}）`);
  }
  if (diastolic < settings.diastolicLow) {
    reasons.push(`舒张压偏低（${diastolic} < ${settings.diastolicLow}）`);
  }

  const pulsePressure = systolic - diastolic;
  if (pulsePressure > 60) {
    reasons.push(`脉压差过大（${pulsePressure} > 60）`);
  }
  if (pulsePressure < 20) {
    reasons.push(`脉压差过小（${pulsePressure} < 20）`);
  }

  if (heartRate > 100) {
    reasons.push(`心率偏快（${heartRate} > 100）`);
  }
  if (heartRate < 60) {
    reasons.push(`心率偏慢（${heartRate} < 60）`);
  }

  if (recentMeasurements.length >= 3) {
    const recentSystolics = recentMeasurements.map((m) => m.systolic);
    const maxDiff = Math.max(...recentSystolics, systolic) - Math.min(...recentSystolics, systolic);
    if (maxDiff > 20) {
      reasons.push(`连续读数波动较大（差异 ${maxDiff} > 20）`);
    }
  }

  return {
    isAbnormal: reasons.length > 0,
    abnormalReason: reasons.join('；'),
  };
};

export const generateAlerts = (
  device: Device,
  measurements: Measurement[],
  settings: Settings
): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();

  if (device.armCircumference) {
    const recommended = getRecommendedCuffSize(device.armCircumference);
    if (recommended && recommended !== device.cuffSize) {
      alerts.push({
        id: `alert-cuff-${Date.now()}`,
        type: 'cuff',
        severity: 'warning',
        message: `您的上臂周长 ${device.armCircumference}cm，建议使用${getCuffSizeRange(recommended)}的袖带。当前使用的是${getCuffSizeRange(device.cuffSize)}，尺寸不合适可能影响测量准确性。`,
        createdAt: now.toISOString(),
      });
    }
  }

  const calibrationDate = new Date(device.calibrationDate);
  const nextCalibrationDate = new Date(calibrationDate);
  nextCalibrationDate.setDate(nextCalibrationDate.getDate() + settings.calibrationIntervalDays);
  
  const daysUntilCalibration = Math.ceil(
    (nextCalibrationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilCalibration < 0) {
    alerts.push({
      id: `alert-calibration-${Date.now()}`,
      type: 'calibration',
      severity: 'error',
      message: `设备校准已超期 ${Math.abs(daysUntilCalibration)} 天！建议尽快联系厂家或医院重新校准，以确保测量数据准确。`,
      createdAt: now.toISOString(),
    });
  } else if (daysUntilCalibration <= 30) {
    alerts.push({
      id: `alert-calibration-${Date.now()}`,
      type: 'calibration',
      severity: 'warning',
      message: `设备将在 ${daysUntilCalibration} 天后需要校准，请提前安排校准事宜。上次校准日期：${device.calibrationDate}`,
      createdAt: now.toISOString(),
    });
  }

  if (device.batteryLevel < 20) {
    alerts.push({
      id: `alert-battery-${Date.now()}`,
      type: 'battery',
      severity: device.batteryLevel < 10 ? 'error' : 'warning',
      message: `设备电量不足（${device.batteryLevel}%），请及时更换${device.batteryType}，避免测量中断。`,
      createdAt: now.toISOString(),
    });
  }

  const todayStr = now.toISOString().split('T')[0];
  const todayMeasurements = measurements.filter((m) => m.date === todayStr);
  
  if (todayMeasurements.length > 0) {
    const abnormalToday = todayMeasurements.filter((m) => m.isAbnormal);
    if (abnormalToday.length >= 2) {
      alerts.push({
        id: `alert-abnormal-${Date.now()}`,
        type: 'abnormal-reading',
        severity: 'warning',
        message: `今日已有 ${abnormalToday.length} 次异常读数。${abnormalToday[0].abnormalReason ? '原因：' + abnormalToday[0].abnormalReason : ''} 建议休息后复测，如持续异常请及时就医。`,
        measurementId: abnormalToday[0].id,
        createdAt: now.toISOString(),
      });
    }
  }

  const last3Measurements = measurements.slice(0, 3);
  if (last3Measurements.length === 3) {
    const allAbnormal = last3Measurements.every((m) => m.isAbnormal);
    if (allAbnormal) {
      alerts.push({
        id: `alert-abnormal-continuous-${Date.now()}`,
        type: 'abnormal-reading',
        severity: 'error',
        message: '最近连续3次测量结果均异常！请立即休息10分钟后复测。若仍异常，请拨打120或联系医生。',
        createdAt: now.toISOString(),
      });
    }
  }

  return alerts;
};

export const checkIfMeasuredToday = (measurements: Measurement[]): boolean => {
  const todayStr = new Date().toISOString().split('T')[0];
  return measurements.some((m) => m.date === todayStr);
};

export const getAbnormalCount = (measurements: Measurement[], days: number = 7): number => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];
  
  return measurements.filter((m) => m.date >= cutoffStr && m.isAbnormal).length;
};

export const getDaysUntilVisit = (nextVisitDate?: string): number | null => {
  if (!nextVisitDate) return null;
  const visitDate = new Date(nextVisitDate);
  const now = new Date();
  return Math.ceil((visitDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

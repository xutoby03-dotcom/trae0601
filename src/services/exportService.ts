import type { Device, Measurement, Settings, CuffSize } from '../types';
import { armLabels, postureLabels, cuffSizeLabels } from '../types';
import { sortMeasurementsByDateTimeDesc } from '../lib/utils';

const CUFF_SIZE_RANGES: Record<CuffSize, [number, number]> = {
  small: [22, 26],
  medium: [27, 31],
  large: [32, 36],
  'extra-large': [37, 42],
};

const getRecommendedCuffSize = (armCircumference: number): CuffSize | null => {
  if (armCircumference >= 22 && armCircumference <= 26) return 'small';
  if (armCircumference >= 27 && armCircumference <= 31) return 'medium';
  if (armCircumference >= 32 && armCircumference <= 36) return 'large';
  if (armCircumference >= 37 && armCircumference <= 42) return 'extra-large';
  return null;
};

const buildVisitChecklist = (
  filteredMeasurements: Measurement[],
  device: Device | null,
  settings: Settings
): string[] => {
  const items: string[] = [];
  const now = new Date();

  if (filteredMeasurements.length > 0) {
    const abnormalRecords = filteredMeasurements.filter((m) => m.isAbnormal);
    if (abnormalRecords.length > 0) {
      const reasonCounts: Record<string, number> = {};
      abnormalRecords.forEach((m) => {
        if (m.abnormalReason) {
          m.abnormalReason.split('；').forEach((r) => {
            const trimmed = r.trim();
            if (trimmed) {
              reasonCounts[trimmed] = (reasonCounts[trimmed] || 0) + 1;
            }
          });
        }
      });

      items.push(`【异常读数】共 ${abnormalRecords.length} 次异常，原因汇总：`);
      Object.entries(reasonCounts)
        .sort((a, b) => b[1] - a[1])
        .forEach(([reason, count]) => {
          items.push(`  - ${reason}（${count}次）`);
        });
    } else {
      items.push('【异常读数】无异常');
    }
  }

  if (device) {
    if (device.batteryLevel < 20) {
      items.push(
        `【电量不足】当前电量 ${device.batteryLevel}%，${device.batteryType}需更换，低电量可能导致读数偏差`
      );
    } else {
      items.push(`【电量状态】当前电量 ${device.batteryLevel}%，正常`);
    }

    if (device.armCircumference) {
      const recommended = getRecommendedCuffSize(device.armCircumference);
      if (recommended && recommended !== device.cuffSize) {
        const [recMin, recMax] = CUFF_SIZE_RANGES[recommended];
        items.push(
          `【袖带不匹配】上臂周长 ${device.armCircumference}cm，应使用${cuffSizeLabels[recommended]}（${recMin}-${recMax}cm），当前使用${cuffSizeLabels[device.cuffSize]}，需更换`
        );
      } else {
        items.push(
          `【袖带尺寸】${cuffSizeLabels[device.cuffSize]}，上臂周长 ${device.armCircumference}cm，匹配正常`
        );
      }
    } else {
      items.push(`【袖带尺寸】${cuffSizeLabels[device.cuffSize]}，未录入上臂周长，无法判断是否匹配`);
    }

    const calibrationDate = new Date(device.calibrationDate);
    const nextCalDate = new Date(calibrationDate);
    nextCalDate.setDate(nextCalDate.getDate() + settings.calibrationIntervalDays);
    const daysUntilCal = Math.ceil(
      (nextCalDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilCal < 0) {
      items.push(
        `【校准超期】已超期 ${Math.abs(daysUntilCal)} 天，上次校准 ${device.calibrationDate}，超期设备读数不可靠，建议尽快校准`
      );
    } else if (daysUntilCal <= 30) {
      items.push(
        `【即将校准】还剩 ${daysUntilCal} 天需校准，上次校准 ${device.calibrationDate}`
      );
    } else {
      items.push(`【校准状态】上次校准 ${device.calibrationDate}，状态正常`);
    }
  }

  if (settings.nextVisitDate) {
    const visitDate = new Date(settings.nextVisitDate);
    const daysUntilVisit = Math.ceil(
      (visitDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysUntilVisit <= 0) {
      items.push('【复诊提醒】已到复诊日期，请及时就诊');
    } else if (daysUntilVisit <= 7) {
      items.push(`【复诊提醒】距下次复诊还有 ${daysUntilVisit} 天`);
    }
  }

  return items;
};

export const generateCSV = (
  measurements: Measurement[],
  device: Device | null,
  settings: Settings,
  startDate?: string,
  endDate?: string
): string => {
  let filteredMeasurements = measurements;
  
  if (startDate) {
    filteredMeasurements = filteredMeasurements.filter((m) => m.date >= startDate);
  }
  if (endDate) {
    filteredMeasurements = filteredMeasurements.filter((m) => m.date <= endDate);
  }

  const sortedMeasurements = sortMeasurementsByDateTimeDesc(filteredMeasurements);

  const lines: string[] = [];

  lines.push('血压测量记录报告');
  lines.push(`生成时间：${new Date().toLocaleString('zh-CN')}`);
  if (startDate && endDate) {
    lines.push(`统计范围：${startDate} 至 ${endDate}`);
  }
  lines.push('');

  lines.push('=== 复诊问题清单（请优先关注）===');
  const checklist = buildVisitChecklist(sortedMeasurements, device, settings);
  if (checklist.length > 0) {
    checklist.forEach((item) => lines.push(item));
  } else {
    lines.push('暂无需要特别关注的问题');
  }
  lines.push('');

  if (device) {
    lines.push('=== 设备信息 ===');
    lines.push(`品牌：${device.brand}`);
    lines.push(`型号：${device.model}`);
    lines.push(`袖带尺寸：${cuffSizeLabels[device.cuffSize]}`);
    if (device.armCircumference) {
      lines.push(`上臂周长：${device.armCircumference}cm`);
    }
    lines.push(`电池类型：${device.batteryType}`);
    lines.push(`当前电量：${device.batteryLevel}%`);
    lines.push(`购买日期：${device.purchaseDate}`);
    lines.push(`校准日期：${device.calibrationDate}`);
    lines.push(`校准周期：${settings.calibrationIntervalDays}天`);
    lines.push('');
  }

  lines.push('=== 参考标准 ===');
  lines.push(`收缩压正常范围：${settings.systolicLow} - ${settings.systolicHigh} mmHg`);
  lines.push(`舒张压正常范围：${settings.diastolicLow} - ${settings.diastolicHigh} mmHg`);
  lines.push('');

  lines.push('=== 测量记录（按时间倒序）===');
  
  const headers = [
    '日期',
    '时间',
    '手臂',
    '姿势',
    '休息时间(分钟)',
    '收缩压(mmHg)',
    '舒张压(mmHg)',
    '心率(次/分)',
    '脉压差(mmHg)',
    '是否异常',
    '异常原因',
    '备注',
  ];
  lines.push(headers.join(','));

  sortedMeasurements.forEach((m) => {
    const pulsePressure = m.systolic - m.diastolic;
    const row = [
      m.date,
      m.time,
      armLabels[m.arm],
      postureLabels[m.posture],
      m.restMinutes.toString(),
      m.systolic.toString(),
      m.diastolic.toString(),
      m.heartRate.toString(),
      pulsePressure.toString(),
      m.isAbnormal ? '是' : '否',
      `"${m.abnormalReason || ''}"`,
      `"${m.notes || ''}"`,
    ];
    lines.push(row.join(','));
  });

  if (sortedMeasurements.length > 0) {
    lines.push('');
    lines.push('=== 统计摘要 ===');
    
    const systolicValues = sortedMeasurements.map((m) => m.systolic);
    const diastolicValues = sortedMeasurements.map((m) => m.diastolic);
    const heartRateValues = sortedMeasurements.map((m) => m.heartRate);
    
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    lines.push(`记录总数：${sortedMeasurements.length} 条`);
    lines.push(`异常次数：${sortedMeasurements.filter((m) => m.isAbnormal).length} 次`);
    lines.push(`平均收缩压：${avg(systolicValues).toFixed(1)} mmHg`);
    lines.push(`平均舒张压：${avg(diastolicValues).toFixed(1)} mmHg`);
    lines.push(`平均心率：${avg(heartRateValues).toFixed(1)} 次/分`);
    lines.push(`最高收缩压：${Math.max(...systolicValues)} mmHg`);
    lines.push(`最低收缩压：${Math.min(...systolicValues)} mmHg`);
    lines.push(`最高舒张压：${Math.max(...diastolicValues)} mmHg`);
    lines.push(`最低舒张压：${Math.min(...diastolicValues)} mmHg`);
  }

  return lines.join('\n');
};

export const downloadCSV = (content: string, filename: string) => {
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const getDefaultDateRange = (): { startDate: string; endDate: string } => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
  };
};

export const getTrendData = (
  measurements: Measurement[],
  nextVisitDate?: string
) => {
  let filtered = measurements;
  
  if (nextVisitDate) {
    const visit = new Date(nextVisitDate);
    const start = new Date(visit);
    start.setDate(start.getDate() - 30);
    const startStr = start.toISOString().split('T')[0];
    const visitStr = visit.toISOString().split('T')[0];
    filtered = measurements.filter((m) => m.date >= startStr && m.date <= visitStr);
  }

  const dailyData: Record<string, {
    date: string;
    systolic: number[];
    diastolic: number[];
    heartRate: number[];
  }> = {};

  filtered.forEach((m) => {
    if (!dailyData[m.date]) {
      dailyData[m.date] = {
        date: m.date,
        systolic: [],
        diastolic: [],
        heartRate: [],
      };
    }
    dailyData[m.date].systolic.push(m.systolic);
    dailyData[m.date].diastolic.push(m.diastolic);
    dailyData[m.date].heartRate.push(m.heartRate);
  });

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return Object.values(dailyData)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      date: d.date.slice(5),
      systolic: Math.round(avg(d.systolic)),
      diastolic: Math.round(avg(d.diastolic)),
      heartRate: Math.round(avg(d.heartRate)),
      measurementCount: d.systolic.length,
    }));
};

export const getSummaryStats = (measurements: Measurement[], nextVisitDate?: string) => {
  let filtered = measurements;
  
  if (nextVisitDate) {
    const visit = new Date(nextVisitDate);
    const start = new Date(visit);
    start.setDate(start.getDate() - 30);
    const startStr = start.toISOString().split('T')[0];
    const visitStr = visit.toISOString().split('T')[0];
    filtered = measurements.filter((m) => m.date >= startStr && m.date <= visitStr);
  }

  if (filtered.length === 0) {
    return null;
  }

  const systolicValues = filtered.map((m) => m.systolic);
  const diastolicValues = filtered.map((m) => m.diastolic);
  const heartRateValues = filtered.map((m) => m.heartRate);
  
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const abnormalCount = filtered.filter((m) => m.isAbnormal).length;

  return {
    totalMeasurements: filtered.length,
    abnormalCount,
    abnormalRate: (abnormalCount / filtered.length * 100).toFixed(1),
    avgSystolic: Math.round(avg(systolicValues)),
    avgDiastolic: Math.round(avg(diastolicValues)),
    avgHeartRate: Math.round(avg(heartRateValues)),
    maxSystolic: Math.max(...systolicValues),
    minSystolic: Math.min(...systolicValues),
    maxDiastolic: Math.max(...diastolicValues),
    minDiastolic: Math.min(...diastolicValues),
  };
};

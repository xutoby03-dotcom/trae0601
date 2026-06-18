import type { Device, Measurement, Settings } from '../types';
import { armLabels, postureLabels } from '../types';

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

  const lines: string[] = [];

  lines.push('血压测量记录报告');
  lines.push(`生成时间：${new Date().toLocaleString('zh-CN')}`);
  lines.push('');
  
  if (device) {
    lines.push('=== 设备信息 ===');
    lines.push(`品牌：${device.brand}`);
    lines.push(`型号：${device.model}`);
    lines.push(`袖带尺寸：${device.cuffSize}`);
    lines.push(`电池类型：${device.batteryType}`);
    lines.push(`购买日期：${device.purchaseDate}`);
    lines.push(`校准日期：${device.calibrationDate}`);
    lines.push(`当前电量：${device.batteryLevel}%`);
    lines.push('');
  }

  lines.push('=== 参考标准 ===');
  lines.push(`收缩压正常范围：${settings.systolicLow} - ${settings.systolicHigh} mmHg`);
  lines.push(`舒张压正常范围：${settings.diastolicLow} - ${settings.diastolicHigh} mmHg`);
  lines.push('');

  lines.push('=== 测量记录 ===');
  
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

  filteredMeasurements.forEach((m) => {
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

  if (filteredMeasurements.length > 0) {
    lines.push('');
    lines.push('=== 统计摘要 ===');
    
    const systolicValues = filteredMeasurements.map((m) => m.systolic);
    const diastolicValues = filteredMeasurements.map((m) => m.diastolic);
    const heartRateValues = filteredMeasurements.map((m) => m.heartRate);
    
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    
    lines.push(`记录总数：${filteredMeasurements.length} 条`);
    lines.push(`异常次数：${filteredMeasurements.filter((m) => m.isAbnormal).length} 次`);
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

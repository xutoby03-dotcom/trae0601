import { addHours, subDays, subHours, subMinutes, formatISO } from 'date-fns';
import type { Equipment, Probe, Maintenance, Batch, Inspection, TemperatureRecord, AbnormalLog } from '@/types';
import { TEMP_MIN, TEMP_MAX } from '@/types';

const now = new Date();

export const equipments: Equipment[] = [
  {
    id: 'eq-001',
    code: 'FX-001',
    capacity: 200,
    layers: 4,
    probePositions: ['上层左', '上层右', '中层', '下层'],
    createdAt: formatISO(subDays(now, 180)),
  },
  {
    id: 'eq-002',
    code: 'FX-002',
    capacity: 180,
    layers: 4,
    probePositions: ['上层', '中层左', '中层右', '下层'],
    createdAt: formatISO(subDays(now, 120)),
  },
  {
    id: 'eq-003',
    code: 'FX-003',
    capacity: 250,
    layers: 5,
    probePositions: ['顶层', '上层', '中层', '下层', '底层'],
    createdAt: formatISO(subDays(now, 90)),
  },
];

export const probes: Probe[] = [
  {
    id: 'pb-001',
    equipmentId: 'eq-001',
    position: '上层左',
    calibrationCycle: 30,
    lastCalibration: formatISO(subDays(now, 20)),
    status: 'normal',
  },
  {
    id: 'pb-002',
    equipmentId: 'eq-001',
    position: '下层',
    calibrationCycle: 30,
    lastCalibration: formatISO(subDays(now, 35)),
    status: 'need_calibration',
  },
  {
    id: 'pb-003',
    equipmentId: 'eq-002',
    position: '上层',
    calibrationCycle: 30,
    lastCalibration: formatISO(subDays(now, 15)),
    status: 'normal',
  },
  {
    id: 'pb-004',
    equipmentId: 'eq-002',
    position: '中层右',
    calibrationCycle: 30,
    lastCalibration: formatISO(subDays(now, 25)),
    status: 'normal',
  },
  {
    id: 'pb-005',
    equipmentId: 'eq-003',
    position: '顶层',
    calibrationCycle: 30,
    lastCalibration: formatISO(subDays(now, 40)),
    status: 'normal',
  },
  {
    id: 'pb-006',
    equipmentId: 'eq-003',
    position: '底层',
    calibrationCycle: 30,
    lastCalibration: formatISO(subDays(now, 45)),
    status: 'normal',
  },
];

export const maintenances: Maintenance[] = [
  {
    id: 'mt-001',
    equipmentId: 'eq-001',
    date: formatISO(subDays(now, 80)),
    content: '定期清洁消毒，检查密封条',
  },
  {
    id: 'mt-002',
    equipmentId: 'eq-001',
    date: formatISO(subDays(now, 40)),
    content: '温度探头校准，压缩机检查',
  },
  {
    id: 'mt-003',
    equipmentId: 'eq-002',
    date: formatISO(subDays(now, 60)),
    content: '更换空气过滤器，检查风扇',
  },
  {
    id: 'mt-004',
    equipmentId: 'eq-003',
    date: formatISO(subDays(now, 20)),
    content: '加湿器维护，排水系统清理',
  },
  {
    id: 'mt-005',
    equipmentId: 'eq-003',
    date: formatISO(subDays(now, 5)),
    content: '门体铰链润滑，控制面板检查',
  },
];

const recipes = [
  '法式乡村面包',
  '可颂面团',
  '布里欧修',
  '全麦吐司',
  '肉桂卷',
  '酸种面包',
  '可颂面团',
  '巧克力丹麦',
];

const weights = [5, 8, 10, 12, 15, 18, 20, 12];
const inTimeOffsets = [1, 3, 5, 7, 9, 11, 13, 15];
const fermentHours = [18, 16, 20, 17, 19, 18, 16, 17];
const equipmentIds = ['eq-001', 'eq-001', 'eq-002', 'eq-002', 'eq-003', 'eq-003', 'eq-001', 'eq-003'];
const layers = [1, 2, 1, 3, 1, 2, 3, 4];

export const batches: Batch[] = recipes.map((recipe, index) => ({
  id: `batch-${String(index + 1).padStart(3, '0')}`,
  equipmentId: equipmentIds[index],
  recipe,
  weight: weights[index],
  targetTemp: 4,
  inTime: formatISO(subHours(now, inTimeOffsets[index])),
  expectOutTime: formatISO(addHours(subHours(now, inTimeOffsets[index]), fermentHours[index])),
  layer: layers[index],
  status: 'fermenting',
}));

function generateTempRecords(): TemperatureRecord[] {
  const records: TemperatureRecord[] = [];
  const abnormalPeriods = [
    { start: 4, end: 9, type: 'low' as const },
    { start: 18, end: 23, type: 'high' as const },
    { start: 38, end: 43, type: 'low' as const },
  ];

  for (let i = 0; i < 48; i++) {
    const time = formatISO(subMinutes(now, (47 - i) * 30));
    const isAbnormal = abnormalPeriods.some((p) => i >= p.start && i <= p.end);
    let temperature: number;

    if (isAbnormal) {
      const period = abnormalPeriods.find((p) => i >= p.start && i <= p.end)!;
      if (period.type === 'low') {
        temperature = parseFloat((Math.random() * 1 + 0).toFixed(1));
      } else {
        temperature = parseFloat((Math.random() * 2 + 7).toFixed(1));
      }
    } else {
      temperature = parseFloat((Math.random() * 4 + 2).toFixed(1));
    }

    records.push({ time, temperature, isAbnormal });
  }

  return records;
}

export const temperatureRecords: TemperatureRecord[] = generateTempRecords();

function generateInspections(): Inspection[] {
  const records: Inspection[] = [];
  const hours = [23, 20, 17, 14, 11, 8, 5, 2, 1, 0];
  const temps = [4.2, 7.5, 3.8, 0.8, 4.5, 5.2, 3.5, 4.0, 8.2, 4.8];
  const humidities = [72, 65, 70, 55, 68, 75, 78, 70, 60, 73];
  const doorFlags = [false, true, false, false, false, false, true, false, false, false];
  const frostFlags = [false, false, false, true, false, false, false, false, false, false];
  const soundFlags = [false, false, false, false, false, true, false, false, false, false];
  const equipIds = ['eq-001', 'eq-001', 'eq-002', 'eq-003', 'eq-002', 'eq-001', 'eq-003', 'eq-002', 'eq-001', 'eq-003'];

  for (let i = 0; i < 10; i++) {
    const temp = temps[i];
    const isAbnormal = temp < TEMP_MIN || temp > TEMP_MAX;
    let remark: string | undefined;

    if (isAbnormal) {
      if (temp < TEMP_MIN) {
        remark = `温度过低：${temp}°C，低于标准范围 ${TEMP_MIN}-${TEMP_MAX}°C`;
      } else {
        remark = `温度过高：${temp}°C，高于标准范围 ${TEMP_MIN}-${TEMP_MAX}°C`;
      }
    }

    records.push({
      id: `ins-${String(i + 1).padStart(3, '0')}`,
      equipmentId: equipIds[i],
      time: formatISO(subHours(now, hours[i])),
      actualTemp: temp,
      humidity: humidities[i],
      doorFrequentOpen: doorFlags[i],
      frosting: frostFlags[i],
      abnormalSound: soundFlags[i],
      remark,
    });
  }

  return records;
}

export const inspections: Inspection[] = generateInspections();

export const abnormalLogs: AbnormalLog[] = [
  {
    id: 'ab-001',
    inspectionId: 'ins-002',
    batchIds: ['batch-001', 'batch-002', 'batch-007'],
    type: 'temp_high',
    tempDeviation: 1.5,
    status: 'resolved',
  },
  {
    id: 'ab-002',
    inspectionId: 'ins-004',
    batchIds: ['batch-005', 'batch-006', 'batch-008'],
    type: 'temp_low',
    tempDeviation: -1.2,
    status: 'pending',
  },
  {
    id: 'ab-003',
    inspectionId: 'ins-009',
    batchIds: ['batch-001', 'batch-002'],
    type: 'temp_high',
    tempDeviation: 2.2,
    status: 'pending',
  },
];

export const equipmentList = equipments;
export const probeList = probes;
export const maintenanceList = maintenances;
export const batchList = batches;
export const inspectionList = inspections;
export const abnormalLogList = abnormalLogs;

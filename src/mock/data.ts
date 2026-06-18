import type { Device, Measurement, Settings } from '../types';

export const mockDevice: Device = {
  id: 'device-001',
  brand: '欧姆龙',
  model: 'HEM-7136',
  cuffSize: 'medium',
  batteryType: '7号电池 x 4',
  purchaseDate: '2025-03-15',
  calibrationDate: '2025-12-20',
  batteryLevel: 15,
  armCircumference: 29,
  photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=omron%20blood%20pressure%20monitor%20digital%20medical%20device%20on%20white%20background&image_size=square',
  createdAt: '2025-03-15T10:00:00Z',
  updatedAt: '2026-06-10T08:30:00Z',
};

const generateMockMeasurements = (): Measurement[] => {
  const measurements: Measurement[] = [];
  const today = new Date();
  
  const baseReadings = [
    { systolic: 128, diastolic: 82, heartRate: 72 },
    { systolic: 135, diastolic: 88, heartRate: 75 },
    { systolic: 122, diastolic: 78, heartRate: 70 },
    { systolic: 145, diastolic: 92, heartRate: 78 },
    { systolic: 130, diastolic: 85, heartRate: 73 },
    { systolic: 155, diastolic: 95, heartRate: 82 },
    { systolic: 125, diastolic: 80, heartRate: 71 },
    { systolic: 138, diastolic: 86, heartRate: 76 },
    { systolic: 160, diastolic: 100, heartRate: 85 },
    { systolic: 128, diastolic: 82, heartRate: 72 },
  ];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const dateStr = date.toISOString().split('T')[0];
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const times = isWeekend ? ['07:30', '20:00'] : ['07:00', '19:30'];
    
    times.forEach((time, idx) => {
      const readingIdx = (i * 2 + idx) % baseReadings.length;
      const base = baseReadings[readingIdx];
      const variance = Math.floor(Math.random() * 10) - 5;
      
      const systolic = base.systolic + variance;
      const diastolic = base.diastolic + Math.floor(variance * 0.6);
      const heartRate = base.heartRate + Math.floor(Math.random() * 6) - 3;
      
      const isAbnormal = systolic > 140 || diastolic > 90 || systolic < 90 || diastolic < 60;
      let abnormalReason = '';
      if (systolic > 140) abnormalReason += '收缩压偏高；';
      if (diastolic > 90) abnormalReason += '舒张压偏高；';
      if (systolic < 90) abnormalReason += '收缩压偏低；';
      if (diastolic < 60) abnormalReason += '舒张压偏低；';
      
      const pulsePressure = systolic - diastolic;
      if (pulsePressure > 60) abnormalReason += '脉压差过大；';
      if (pulsePressure < 20) abnormalReason += '脉压差过小；';
      
      measurements.push({
        id: `meas-${dateStr}-${idx}`,
        deviceId: 'device-001',
        date: dateStr,
        time,
        arm: idx === 0 ? 'left' : 'right',
        posture: 'sitting',
        restMinutes: 5,
        systolic,
        diastolic,
        heartRate,
        notes: isAbnormal ? '感觉有些头晕' : '',
        isAbnormal,
        abnormalReason: abnormalReason || undefined,
        createdAt: `${dateStr}T${time}:00Z`,
      });
    });
  }
  
  return measurements;
};

export const mockMeasurements: Measurement[] = generateMockMeasurements();

export const mockSettings: Settings = {
  id: 'settings-001',
  nextVisitDate: '2026-07-05',
  systolicHigh: 140,
  systolicLow: 90,
  diastolicHigh: 90,
  diastolicLow: 60,
  calibrationIntervalDays: 180,
};

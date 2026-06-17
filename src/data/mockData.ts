import type { Cylinder, Order, BalloonType, InflationRecord, AbnormalRecord } from '@/types';

const gradientColors = [
  'from-blue-500 via-blue-600 to-indigo-700',
  'from-cyan-500 via-teal-600 to-emerald-700',
  'from-amber-500 via-orange-600 to-red-700',
  'from-violet-500 via-purple-600 to-fuchsia-700',
  'from-slate-500 via-slate-600 to-slate-800',
  'from-rose-500 via-pink-600 to-purple-700',
  'from-emerald-500 via-green-600 to-teal-700',
  'from-sky-500 via-blue-600 to-indigo-700',
];

export const mockCylinders: Cylinder[] = [
  {
    id: '1',
    cylinderNo: 'HP-2024-001',
    capacity: 40,
    pressure: 12.5,
    ratedPressure: 15,
    location: 'A区-01架',
    deposit: 500,
    inspectionDate: '2024-03-15',
    nextInspectionDate: '2025-03-15',
    status: 'normal',
    photoUrl: gradientColors[0],
    createdAt: '2024-01-10T08:00:00Z',
  },
  {
    id: '2',
    cylinderNo: 'HP-2024-002',
    capacity: 40,
    pressure: 8.2,
    ratedPressure: 15,
    location: 'A区-02架',
    deposit: 500,
    inspectionDate: '2024-05-20',
    nextInspectionDate: '2025-05-20',
    status: 'normal',
    photoUrl: gradientColors[1],
    createdAt: '2024-02-15T09:30:00Z',
  },
  {
    id: '3',
    cylinderNo: 'HP-2024-003',
    capacity: 40,
    pressure: 2.8,
    ratedPressure: 15,
    location: 'B区-01架',
    deposit: 500,
    inspectionDate: '2024-02-10',
    nextInspectionDate: '2025-02-10',
    status: 'low',
    photoUrl: gradientColors[2],
    createdAt: '2024-01-20T14:00:00Z',
  },
  {
    id: '4',
    cylinderNo: 'HP-2024-004',
    capacity: 50,
    pressure: 13.8,
    ratedPressure: 15,
    location: 'A区-03架',
    deposit: 600,
    inspectionDate: '2024-06-01',
    nextInspectionDate: '2025-06-01',
    status: 'normal',
    photoUrl: gradientColors[3],
    createdAt: '2024-03-05T10:00:00Z',
  },
  {
    id: '5',
    cylinderNo: 'HP-2023-005',
    capacity: 40,
    pressure: 10.5,
    ratedPressure: 15,
    location: 'B区-02架',
    deposit: 500,
    inspectionDate: '2023-06-15',
    nextInspectionDate: '2024-06-15',
    status: 'expired',
    photoUrl: gradientColors[4],
    createdAt: '2023-06-20T11:00:00Z',
  },
  {
    id: '6',
    cylinderNo: 'HP-2024-006',
    capacity: 40,
    pressure: 1.2,
    ratedPressure: 15,
    location: 'C区-待检区',
    deposit: 500,
    inspectionDate: '2024-04-10',
    nextInspectionDate: '2025-04-10',
    status: 'abnormal',
    photoUrl: gradientColors[5],
    createdAt: '2024-02-28T16:00:00Z',
  },
  {
    id: '7',
    cylinderNo: 'HP-2024-007',
    capacity: 50,
    pressure: 14.2,
    ratedPressure: 15,
    location: 'A区-04架',
    deposit: 600,
    inspectionDate: '2024-07-01',
    nextInspectionDate: '2025-07-01',
    status: 'normal',
    photoUrl: gradientColors[6],
    createdAt: '2024-04-12T09:00:00Z',
  },
  {
    id: '8',
    cylinderNo: 'HP-2024-008',
    capacity: 40,
    pressure: 3.5,
    ratedPressure: 15,
    location: 'B区-03架',
    deposit: 500,
    inspectionDate: '2024-03-25',
    nextInspectionDate: '2025-03-25',
    status: 'low',
    photoUrl: gradientColors[7],
    createdAt: '2024-01-30T13:00:00Z',
  },
];

export const mockOrders: Order[] = [
  { id: 'o1', orderNo: 'DD20240615001', customerName: '李小明生日派对', totalAmount: 1280, profit: 680, createdAt: '2024-06-15T10:00:00Z' },
  { id: 'o2', orderNo: 'DD20240616001', customerName: '王总公司年会', totalAmount: 3500, profit: 1800, createdAt: '2024-06-16T09:00:00Z' },
  { id: 'o3', orderNo: 'DD20240617001', customerName: '张小姐婚礼布置', totalAmount: 2680, profit: 1400, createdAt: '2024-06-17T14:00:00Z' },
  { id: 'o4', orderNo: 'DD20240618001', customerName: '宝宝百日宴', totalAmount: 980, profit: 520, createdAt: '2024-06-18T11:00:00Z' },
  { id: 'o5', orderNo: 'DD20240619001', customerName: '开业庆典气球', totalAmount: 4200, profit: 2200, createdAt: '2024-06-19T08:00:00Z' },
];

export const mockBalloonTypes: BalloonType[] = [
  { id: 'b1', name: '5寸小气球', size: '5寸', gasPerUnit: 0.8, unitPrice: 2, color: '#FF6B6B' },
  { id: 'b2', name: '10寸标准气球', size: '10寸', gasPerUnit: 2.5, unitPrice: 5, color: '#4ECDC4' },
  { id: 'b3', name: '12寸乳胶气球', size: '12寸', gasPerUnit: 4.2, unitPrice: 8, color: '#45B7D1' },
  { id: 'b4', name: '18寸铝箔气球', size: '18寸', gasPerUnit: 8.5, unitPrice: 25, color: '#96CEB4' },
  { id: 'b5', name: '36寸大气球', size: '36寸', gasPerUnit: 25, unitPrice: 60, color: '#FFEAA7' },
  { id: 'b6', name: '爱心气球', size: '12寸', gasPerUnit: 3.8, unitPrice: 10, color: '#FF8C94' },
  { id: 'b7', name: '数字气球', size: '40寸', gasPerUnit: 15, unitPrice: 45, color: '#DDA0DD' },
  { id: 'b8', name: '长条魔术气球', size: '260型', gasPerUnit: 1.5, unitPrice: 3, color: '#98D8C8' },
];

const generateInflationRecords = (): InflationRecord[] => {
  const records: InflationRecord[] = [];
  const operators = ['张师傅', '李师傅', '王师傅'];
  const now = new Date();
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    records.push({
      id: `ir${i + 1}`,
      cylinderId: String(Math.floor(Math.random() * 8) + 1),
      orderId: `o${Math.floor(Math.random() * 5) + 1}`,
      balloonTypeId: `b${Math.floor(Math.random() * 8) + 1}`,
      quantity: Math.floor(Math.random() * 50) + 5,
      gasUsed: Number((Math.random() * 20 + 2).toFixed(1)),
      operator: operators[Math.floor(Math.random() * operators.length)],
      createdAt: date.toISOString(),
    });
  }
  
  return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const mockInflationRecords = generateInflationRecords();

export const mockAbnormalRecords: AbnormalRecord[] = [
  {
    id: 'a1',
    cylinderId: '3',
    type: 'empty_return',
    description: '气瓶已空，归还仓库等待充气',
    reporter: '张师傅',
    createdAt: '2024-06-10T14:30:00Z',
  },
  {
    id: 'a2',
    cylinderId: '6',
    type: 'leak',
    description: '瓶身发现轻微漏气，已移至待检区',
    reporter: '李师傅',
    createdAt: '2024-06-12T10:15:00Z',
  },
  {
    id: 'a3',
    cylinderId: '2',
    type: 'valve',
    description: '阀门开关不顺畅，需要检修',
    reporter: '王师傅',
    createdAt: '2024-06-14T16:45:00Z',
  },
  {
    id: 'a4',
    cylinderId: '8',
    type: 'exchange',
    description: '客户换瓶，旧瓶归还',
    reporter: '张师傅',
    createdAt: '2024-06-16T11:00:00Z',
  },
  {
    id: 'a5',
    cylinderId: '3',
    type: 'exchange',
    description: '低压瓶更换为满瓶',
    reporter: '李师傅',
    createdAt: '2024-06-18T09:30:00Z',
  },
  {
    id: 'a6',
    cylinderId: '6',
    type: 'valve',
    description: '阀门密封圈老化，已更换',
    reporter: '王师傅',
    createdAt: '2024-06-19T14:00:00Z',
  },
];

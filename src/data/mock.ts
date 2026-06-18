import type { Device, FilterBatch, SeasonalSetting, AlertThresholds, ReplacementRecord, CleanRecord } from '../types';

export const mockDevices: Device[] = [
  {
    id: 'dev-001',
    room: '客厅',
    model: '米家空气净化器 4 Pro',
    area: 60,
    filterSpec: '米家 Pro-H 滤芯',
    purchaseDate: '2024-03-15',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20white%20air%20purifier%20in%20bright%20living%20room%20corner%20minimalist%20scandinavian&image_size=square_hd',
    lastCleanDate: '2026-04-10',
    expectedFilterDays: 180,
    currentFilterStartDate: '2026-02-01',
    pm25: 35,
    airQuality: 'good',
    odorLevel: 0,
  },
  {
    id: 'dev-002',
    room: '主卧室',
    model: 'Blueair 280i',
    area: 28,
    filterSpec: 'Blueair SmokeStop 复合型',
    purchaseDate: '2023-11-20',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elegant%20blueair%20air%20purifier%20in%20cozy%20bedroom%20near%20window%20warm%20light&image_size=square_hd',
    lastCleanDate: '2026-05-01',
    expectedFilterDays: 240,
    currentFilterStartDate: '2026-01-15',
    pm25: 12,
    airQuality: 'excellent',
    odorLevel: 0,
  },
  {
    id: 'dev-003',
    room: '儿童房',
    model: '352 X86C',
    area: 35,
    filterSpec: '352 X86 除醛加强版',
    purchaseDate: '2024-07-08',
    photo: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20air%20purifier%20in%20colorful%20kids%20room%20with%20toys%20soft%20colors&image_size=square_hd',
    lastCleanDate: '2026-03-20',
    expectedFilterDays: 210,
    currentFilterStartDate: '2026-05-20',
    pm25: 22,
    airQuality: 'excellent',
    odorLevel: 1,
  },
];

export const mockBatches: FilterBatch[] = [
  { id: 'bat-001', batchNo: 'MH-2026-0105', spec: '米家 Pro-H 滤芯', quantity: 1, purchaseDate: '2026-01-05', supplier: '京东自营' },
  { id: 'bat-002', batchNo: 'MH-2026-0312', spec: '米家 Pro-H 滤芯', quantity: 2, purchaseDate: '2026-03-12', supplier: '小米商城' },
  { id: 'bat-003', batchNo: 'BL-2025-1120', spec: 'Blueair SmokeStop 复合型', quantity: 0, purchaseDate: '2025-11-20', supplier: '天猫旗舰店' },
  { id: 'bat-004', batchNo: '352-2026-0228', spec: '352 X86 除醛加强版', quantity: 3, purchaseDate: '2026-02-28', supplier: '官方商城' },
];

export const mockSeasonal: SeasonalSetting[] = [
  { type: 'pet_shedding', enabled: true, startMonth: 3, endMonth: 5, consumptionFactor: 1.5 },
  { type: 'pollen', enabled: true, startMonth: 3, endMonth: 6, consumptionFactor: 1.3 },
];

export const mockThresholds: AlertThresholds = {
  filterExpiringDays: 15,
  safeStockPerSpec: 2,
  cleanReminderDays: 60,
  pm25AccelerateThreshold: 75,
  odorAccelerateLevel: 2,
};

export const mockReplacements: ReplacementRecord[] = [
  {
    id: 'rep-001',
    deviceId: 'dev-001',
    deviceName: '客厅-米家 4 Pro',
    oldFilterDays: 172,
    newFilterBatch: 'MH-2026-0105',
    newFilterSpec: '米家 Pro-H 滤芯',
    installer: '爸爸',
    remainingStock: 3,
    date: '2026-02-01',
    note: '春节前更换',
  },
  {
    id: 'rep-002',
    deviceId: 'dev-002',
    deviceName: '主卧室-Blueair 280i',
    oldFilterDays: 235,
    newFilterBatch: 'BL-2025-1120',
    newFilterSpec: 'Blueair SmokeStop 复合型',
    installer: '妈妈',
    remainingStock: 1,
    date: '2026-01-15',
  },
];

export const mockCleanRecords: CleanRecord[] = [
  { id: 'cln-001', deviceId: 'dev-001', date: '2026-04-10', operator: '爸爸', note: '擦拭进风口+清理传感器' },
  { id: 'cln-002', deviceId: 'dev-003', date: '2026-03-20', operator: '妈妈' },
];

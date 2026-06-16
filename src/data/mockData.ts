import { generateId } from '@/utils/id';
import { db } from '@/db';
import type {
  Furniture,
  DailyRecord,
  Incident,
  WeatherInfo,
  User,
  Reminder,
  FurnitureArea,
  FurnitureType,
  FurnitureMaterial,
  FurnitureStatus,
  DailyRecordStatus,
  IncidentType,
  IncidentSeverity,
  IncidentStatus,
  AlertType,
  AlertLevel,
  UserRole,
  ReminderType,
  CloseChecklist
} from '@/types';

const now = new Date();
const oneDay = 24 * 60 * 60 * 1000;
let isInitializing = false;
let isInitialized = false;

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date: Date): string {
  return date.toISOString();
}

function getDateDaysAgo(days: number): Date {
  return new Date(now.getTime() - days * oneDay);
}

function setTime(date: Date, hours: number, minutes: number): Date {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

const managerId = generateId('user');
const staffId = generateId('user');

export const mockUsers: User[] = [
  {
    id: managerId,
    username: '张店长',
    role: 'manager' as UserRole,
    avatar: undefined,
    isActive: true,
    createdAt: formatDateTime(getDateDaysAgo(30)),
    updatedAt: formatDateTime(getDateDaysAgo(30))
  },
  {
    id: staffId,
    username: '李店员',
    role: 'staff' as UserRole,
    avatar: undefined,
    isActive: true,
    createdAt: formatDateTime(getDateDaysAgo(25)),
    updatedAt: formatDateTime(getDateDaysAgo(25))
  }
];

const furnitureIds: string[] = [];

export const mockFurniture: Furniture[] = [];

const areaNames: Record<FurnitureArea, string> = {
  'outdoor-east': '东区',
  'outdoor-west': '西区',
  'outdoor-south': '南区',
  'outdoor-north': '北区'
};

const typeNames: Record<FurnitureType, string> = {
  chair: '椅子',
  table: '桌子',
  umbrella: '遮阳伞'
};

function createFurniture(
  type: FurnitureType,
  index: number,
  area: FurnitureArea,
  material: FurnitureMaterial,
  hasUmbrella: boolean,
  status: FurnitureStatus,
  notes?: string
): Furniture {
  const id = generateId('furniture');
  furnitureIds.push(id);
  const code = `${type.toUpperCase().charAt(0)}${String(index).padStart(3, '0')}`;
  const purchaseDate = formatDate(getDateDaysAgo(Math.floor(Math.random() * 365) + 30));
  
  return {
    id,
    code,
    name: `${areaNames[area]}${typeNames[type]}${index}`,
    area,
    type,
    material,
    hasUmbrella,
    storagePoint: `仓库-${areaNames[area]}`,
    photo: undefined,
    status,
    purchaseDate,
    notes,
    createdAt: formatDateTime(getDateDaysAgo(30)),
    updatedAt: formatDateTime(getDateDaysAgo(1))
  };
}

mockFurniture.push(
  createFurniture('chair', 1, 'outdoor-east', 'wood', false, 'normal'),
  createFurniture('chair', 2, 'outdoor-east', 'metal', false, 'normal'),
  createFurniture('chair', 3, 'outdoor-east', 'plastic', false, 'normal'),
  createFurniture('chair', 4, 'outdoor-west', 'rattan', false, 'normal'),
  createFurniture('chair', 5, 'outdoor-west', 'wood', false, 'repairing', '椅腿松动，正在维修'),
  createFurniture('chair', 6, 'outdoor-west', 'metal', false, 'normal'),
  createFurniture('chair', 7, 'outdoor-south', 'plastic', false, 'normal'),
  createFurniture('chair', 8, 'outdoor-south', 'rattan', false, 'normal'),
  createFurniture('chair', 9, 'outdoor-south', 'wood', false, 'lost', '上周三丢失，待确认'),
  createFurniture('chair', 10, 'outdoor-north', 'metal', false, 'normal'),
  createFurniture('chair', 11, 'outdoor-north', 'plastic', false, 'normal'),
  createFurniture('chair', 12, 'outdoor-north', 'rattan', false, 'repairing', '藤条断裂，正在维修'),
  
  createFurniture('table', 1, 'outdoor-east', 'wood', true, 'normal'),
  createFurniture('table', 2, 'outdoor-east', 'metal', false, 'normal'),
  createFurniture('table', 3, 'outdoor-west', 'wood', true, 'normal'),
  createFurniture('table', 4, 'outdoor-west', 'plastic', false, 'repairing', '桌面划痕严重，待修复'),
  createFurniture('table', 5, 'outdoor-south', 'metal', true, 'normal'),
  createFurniture('table', 6, 'outdoor-north', 'wood', false, 'normal'),
  
  createFurniture('umbrella', 1, 'outdoor-east', 'metal', false, 'normal'),
  createFurniture('umbrella', 2, 'outdoor-west', 'metal', false, 'repairing', '伞骨断裂，待更换')
);

const weatherData: Array<{
  condition: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainProbability: number;
  hasAlert: boolean;
  alertType?: AlertType;
  alertLevel?: AlertLevel;
}> = [
  { condition: '晴', temperature: 28, humidity: 60, windSpeed: 12, rainProbability: 10, hasAlert: false },
  { condition: '多云', temperature: 26, humidity: 65, windSpeed: 15, rainProbability: 20, hasAlert: false },
  { condition: '阴', temperature: 24, humidity: 75, windSpeed: 20, rainProbability: 40, hasAlert: false },
  { condition: '小雨', temperature: 22, humidity: 85, windSpeed: 25, rainProbability: 80, hasAlert: true, alertType: 'rain', alertLevel: 'blue' },
  { condition: '中雨', temperature: 20, humidity: 90, windSpeed: 35, rainProbability: 90, hasAlert: true, alertType: 'rain', alertLevel: 'yellow' },
  { condition: '多云转晴', temperature: 25, humidity: 70, windSpeed: 18, rainProbability: 30, hasAlert: false },
  { condition: '晴', temperature: 30, humidity: 55, windSpeed: 45, rainProbability: 5, hasAlert: true, alertType: 'wind', alertLevel: 'blue' }
];

export const mockWeatherInfo: WeatherInfo[] = weatherData.map((w, i) => {
  const date = getDateDaysAgo(6 - i);
  return {
    id: generateId('weather'),
    recordDate: formatDate(date),
    condition: w.condition,
    temperature: w.temperature,
    humidity: w.humidity,
    windSpeed: w.windSpeed,
    rainProbability: w.rainProbability,
    hasAlert: w.hasAlert,
    alertType: w.alertType,
    alertLevel: w.alertLevel,
    createdAt: formatDateTime(date)
  };
});

const dailyRecordIds: string[] = [];

export const mockDailyRecords: DailyRecord[] = [];

const openTimes = ['09:00', '09:15', '08:50', '09:30', '09:05', '09:20', '09:10'];
const closeTimes = ['21:00', '21:30', '20:45', '22:00', '21:15', '21:40', '21:20'];
const furnitureCounts = [16, 18, 14, 10, 8, 17, 19];
const statuses: DailyRecordStatus[] = ['completed', 'completed', 'completed', 'abnormal', 'abnormal', 'completed', 'completed'];
const notes = [
  undefined,
  undefined,
  undefined,
  '下雨提前收摊',
  '大风预警，提前收摊',
  undefined,
  '今日周末，延长营业时间'
];

for (let i = 0; i < 7; i++) {
  const date = getDateDaysAgo(6 - i);
  const id = generateId('daily');
  dailyRecordIds.push(id);
  
  const [openH, openM] = openTimes[i].split(':').map(Number);
  const [closeH, closeM] = closeTimes[i].split(':').map(Number);
  
  const availableFurniture = mockFurniture.filter(f => f.status !== 'lost').map(f => f.id);
  const selectedFurniture = availableFurniture.slice(0, furnitureCounts[i]);
  
  const closeChecklist: CloseChecklist = {
    wiped: statuses[i] !== 'abnormal',
    folded: statuses[i] !== 'abnormal',
    locked: true,
    covered: true,
    returned: statuses[i] !== 'abnormal'
  };
  
  mockDailyRecords.push({
    id,
    recordDate: formatDate(date),
    openUserId: i % 2 === 0 ? managerId : staffId,
    openTime: formatDateTime(setTime(date, openH, openM)),
    closeUserId: i % 2 === 0 ? staffId : managerId,
    closeTime: formatDateTime(setTime(date, closeH, closeM)),
    furnitureCount: furnitureCounts[i],
    furnitureIds: selectedFurniture,
    closeChecklist,
    status: statuses[i],
    weatherInfo: mockWeatherInfo[i],
    notes: notes[i],
    createdAt: formatDateTime(date),
    updatedAt: formatDateTime(setTime(date, closeH, closeM))
  });
}

export const mockIncidents: Incident[] = [];

const incidentData: Array<{
  furnitureIndex: number;
  dailyRecordIndex: number;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  status: IncidentStatus;
  resolution?: string;
  repairCost?: number;
  daysAgo: number;
}> = [
  {
    furnitureIndex: 4,
    dailyRecordIndex: 1,
    type: 'damage',
    severity: 'minor',
    description: '椅腿螺丝松动，摇晃明显',
    status: 'processing',
    daysAgo: 5
  },
  {
    furnitureIndex: 11,
    dailyRecordIndex: 2,
    type: 'damage',
    severity: 'moderate',
    description: '藤条断裂三根，需要重新编织',
    status: 'pending',
    daysAgo: 4
  },
  {
    furnitureIndex: 8,
    dailyRecordIndex: 2,
    type: 'loss',
    severity: 'severe',
    description: '收摊时发现椅子不在原位，周边搜索无果',
    status: 'pending',
    daysAgo: 4
  },
  {
    furnitureIndex: 15,
    dailyRecordIndex: 3,
    type: 'damage',
    severity: 'minor',
    description: '桌面被重物砸出划痕，约5cm长',
    status: 'resolved',
    resolution: '已使用专用修复剂处理，划痕已不明显',
    repairCost: 50,
    daysAgo: 3
  },
  {
    furnitureIndex: 19,
    dailyRecordIndex: 3,
    type: 'damage',
    severity: 'severe',
    description: '遮阳伞伞骨断裂两根，无法正常撑开',
    status: 'processing',
    resolution: '已联系供应商更换伞骨',
    repairCost: 200,
    daysAgo: 3
  },
  {
    furnitureIndex: 3,
    dailyRecordIndex: 4,
    type: 'loss',
    severity: 'moderate',
    description: '大风天气收摊匆忙，遗漏一把塑料椅在现场，次日已找回',
    status: 'resolved',
    resolution: '次日早晨在店门口找回，完好无损',
    daysAgo: 2
  },
  {
    furnitureIndex: 1,
    dailyRecordIndex: 5,
    type: 'damage',
    severity: 'minor',
    description: '椅子表面有轻微污渍，需要深度清洁',
    status: 'resolved',
    resolution: '已使用专业清洁剂清洗干净',
    repairCost: 10,
    daysAgo: 1
  },
  {
    furnitureIndex: 7,
    dailyRecordIndex: 5,
    type: 'loss',
    severity: 'moderate',
    description: '晚高峰后发现椅子丢失，监控显示被顾客误拿',
    status: 'pending',
    daysAgo: 1
  }
];

incidentData.forEach((data, index) => {
  const incidentDate = getDateDaysAgo(data.daysAgo);
  const reportTime = setTime(incidentDate, 20 + index, 30);
  const resolutionTime = data.status === 'resolved' ? setTime(incidentDate, 22, 0) : undefined;
  
  mockIncidents.push({
    id: generateId('incident'),
    furnitureId: furnitureIds[data.furnitureIndex],
    dailyRecordId: dailyRecordIds[data.dailyRecordIndex],
    type: data.type,
    severity: data.severity,
    description: data.description,
    photos: [],
    reporterId: index % 2 === 0 ? staffId : managerId,
    reportTime: formatDateTime(reportTime),
    status: data.status,
    handlerId: data.status !== 'pending' ? managerId : undefined,
    repairCost: data.repairCost,
    resolution: data.resolution,
    resolutionTime: resolutionTime ? formatDateTime(resolutionTime) : undefined,
    createdAt: formatDateTime(reportTime),
    updatedAt: formatDateTime(resolutionTime || reportTime)
  });
});

export const mockReminders: Reminder[] = [];

const reminderData: Array<{
  type: ReminderType;
  title: string;
  content: string;
  triggerDaysAgo: number;
  isRead: boolean;
  relatedIndex?: number;
}> = [
  {
    type: 'weather',
    title: '暴雨蓝色预警',
    content: '预计今日下午至夜间有小到中雨，请提前收回户外桌椅',
    triggerDaysAgo: 3,
    isRead: true,
    relatedIndex: 3
  },
  {
    type: 'weather',
    title: '大风预警',
    content: '今日风力较大，阵风可达6-7级，请注意加固遮阳伞',
    triggerDaysAgo: 2,
    isRead: true,
    relatedIndex: 4
  },
  {
    type: 'timer',
    title: '开摊提醒',
    content: '现在是09:00，请开始今日的外摆准备工作',
    triggerDaysAgo: 2,
    isRead: true
  },
  {
    type: 'patrol',
    title: '定时巡查',
    content: '请进行每小时一次的外摆区域巡查',
    triggerDaysAgo: 2,
    isRead: true
  },
  {
    type: 'custom',
    title: '设备维护',
    content: '本周需要对所有木质桌椅进行一次保养',
    triggerDaysAgo: 1,
    isRead: false
  },
  {
    type: 'weather',
    title: '大风蓝色预警',
    content: '今日午后有4-5级偏南风，阵风可达7级，请注意防范',
    triggerDaysAgo: 0,
    isRead: false,
    relatedIndex: 6
  },
  {
    type: 'timer',
    title: '收摊提醒',
    content: '现在是21:00，请准备开始收摊工作',
    triggerDaysAgo: 0,
    isRead: false
  },
  {
    type: 'patrol',
    title: '安全检查',
    content: '请检查所有桌椅是否稳固，遮阳伞是否固定牢靠',
    triggerDaysAgo: 0,
    isRead: false
  },
  {
    type: 'custom',
    title: '库存盘点',
    content: '请于今日下班前完成外摆物品的月度盘点',
    triggerDaysAgo: 0,
    isRead: false
  },
  {
    type: 'patrol',
    title: '雨天检查',
    content: '请检查遮盖物是否完好，确保桌椅不会被淋湿',
    triggerDaysAgo: 0,
    isRead: false
  }
];

reminderData.forEach((data, index) => {
  const triggerDate = getDateDaysAgo(data.triggerDaysAgo);
  const triggerTime = setTime(triggerDate, 9 + index, 0);
  
  mockReminders.push({
    id: generateId('reminder'),
    type: data.type,
    title: data.title,
    content: data.content,
    triggerTime: formatDateTime(triggerTime),
    isRead: data.isRead,
    relatedId: data.relatedIndex !== undefined ? mockWeatherInfo[data.relatedIndex].id : undefined,
    createdAt: formatDateTime(triggerTime)
  });
});

export async function initMockData(): Promise<void> {
  if (isInitialized) {
    return;
  }
  
  if (isInitializing) {
    return;
  }
  
  isInitializing = true;
  
  try {
    const [furnitureCount, usersCount, recordsCount, incidentsCount, weatherCount, remindersCount] = await Promise.all([
      db.furniture.count(),
      db.users.count(),
      db.dailyRecords.count(),
      db.incidents.count(),
      db.weatherInfo.count(),
      db.reminders.count()
    ]);

    const isEmpty = furnitureCount === 0 &&
      usersCount === 0 &&
      recordsCount === 0 &&
      incidentsCount === 0 &&
      weatherCount === 0 &&
      remindersCount === 0;

    if (!isEmpty) {
      console.log('数据库已存在数据，跳过Mock数据初始化');
      isInitialized = true;
      return;
    }

    console.log('开始初始化Mock数据...');

    await db.transaction('rw', [
      db.furniture,
      db.users,
      db.dailyRecords,
      db.incidents,
      db.weatherInfo,
      db.reminders
    ], async () => {
      await db.users.bulkAdd(mockUsers);
      await db.furniture.bulkAdd(mockFurniture);
      await db.weatherInfo.bulkAdd(mockWeatherInfo);
      await db.dailyRecords.bulkAdd(mockDailyRecords);
      await db.incidents.bulkAdd(mockIncidents);
      await db.reminders.bulkAdd(mockReminders);
    });

    console.log('Mock数据初始化完成');
    console.log(`- 用户: ${mockUsers.length} 条`);
    console.log(`- 桌椅档案: ${mockFurniture.length} 条`);
    console.log(`- 天气数据: ${mockWeatherInfo.length} 条`);
    console.log(`- 每日记录: ${mockDailyRecords.length} 条`);
    console.log(`- 事件记录: ${mockIncidents.length} 条`);
    console.log(`- 提醒数据: ${mockReminders.length} 条`);
    
    isInitialized = true;
  } catch (error) {
    console.error('初始化Mock数据失败:', error);
    isInitializing = false;
    throw error;
  }
}

import type { GardenBed, Volunteer, Schedule, CheckIn, Anomaly, Weather } from '../../shared/types.js';

const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const formatDateTime = (date: Date): string => date.toISOString();
const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};
const addHours = (date: Date, hours: number): Date => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hours);
  return newDate;
};

export const generateGardenBeds = (): GardenBed[] => [
  {
    id: 'gb-001',
    bedNumber: 'A-01',
    growerName: '张大伯',
    crop: '番茄',
    plantDate: formatDate(addDays(today, -45)),
    wateringFrequency: 2,
    shadeCondition: 'full_sun',
    status: 'mature',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ripe%20red%20tomatoes%20growing%20in%20garden%20bed%20with%20green%20leaves%20in%20morning%20sunlight&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -20)),
  },
  {
    id: 'gb-002',
    bedNumber: 'A-02',
    growerName: '李阿姨',
    crop: '黄瓜',
    plantDate: formatDate(addDays(today, -30)),
    wateringFrequency: 1,
    shadeCondition: 'partial_shade',
    status: 'growing',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cucumber%20plants%20climbing%20on%20trellis%20with%20green%20cucumbers%20hanging%20in%20garden&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -8)),
  },
  {
    id: 'gb-003',
    bedNumber: 'A-03',
    growerName: '王大爷',
    crop: '生菜',
    plantDate: formatDate(addDays(today, -25)),
    wateringFrequency: 1,
    shadeCondition: 'full_shade',
    status: 'harvesting',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20green%20lettuce%20growing%20in%20raised%20garden%20bed%20ready%20for%20harvest&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -12)),
  },
  {
    id: 'gb-004',
    bedNumber: 'B-01',
    growerName: '陈大妈',
    crop: '辣椒',
    plantDate: formatDate(addDays(today, -50)),
    wateringFrequency: 2,
    shadeCondition: 'full_sun',
    status: 'mature',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20and%20green%20chili%20peppers%20growing%20on%20plant%20in%20garden&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -36)),
  },
  {
    id: 'gb-005',
    bedNumber: 'B-02',
    growerName: '刘叔叔',
    crop: '茄子',
    plantDate: formatDate(addDays(today, -15)),
    wateringFrequency: 2,
    shadeCondition: 'partial_shade',
    status: 'seedling',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=young%20eggplant%20seedlings%20in%20garden%20bed%20with%20purple%20flowers%20starting&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -6)),
  },
  {
    id: 'gb-006',
    bedNumber: 'B-03',
    growerName: '赵奶奶',
    crop: '白菜',
    plantDate: formatDate(addDays(today, -40)),
    wateringFrequency: 1,
    shadeCondition: 'partial_shade',
    status: 'growing',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=chinese%20cabbage%20growing%20in%20neat%20rows%20in%20vegetable%20garden&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -10)),
  },
  {
    id: 'gb-007',
    bedNumber: 'C-01',
    growerName: '孙大哥',
    crop: '萝卜',
    plantDate: formatDate(addDays(today, -35)),
    wateringFrequency: 2,
    shadeCondition: 'full_sun',
    status: 'growing',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=carrot%20tops%20growing%20in%20garden%20soil%20with%20green%20leaves&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -48)),
  },
  {
    id: 'gb-008',
    bedNumber: 'C-02',
    growerName: '周大姐',
    crop: '草莓',
    plantDate: formatDate(addDays(today, -80)),
    wateringFrequency: 1,
    shadeCondition: 'partial_shade',
    status: 'harvesting',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=ripe%20red%20strawberries%20growing%20on%20plant%20with%20white%20flowers%20in%20garden&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -5)),
  },
  {
    id: 'gb-009',
    bedNumber: 'C-03',
    growerName: '吴小弟',
    crop: '玉米',
    plantDate: formatDate(addDays(today, -60)),
    wateringFrequency: 2,
    shadeCondition: 'full_sun',
    status: 'mature',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tall%20corn%20stalks%20growing%20in%20garden%20with%20corncobs%20forming&image_size=square',
    lastWateredAt: formatDateTime(addHours(today, -24)),
  },
];

export const generateVolunteers = (): Volunteer[] => [
  {
    id: 'vol-001',
    name: '林小明',
    phone: '138****1234',
    email: 'linxiaoming@example.com',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lin',
    totalWaterings: 45,
    joinDate: formatDate(addDays(today, -90)),
  },
  {
    id: 'vol-002',
    name: '王小红',
    phone: '139****5678',
    email: 'wangxiaohong@example.com',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wang',
    totalWaterings: 38,
    joinDate: formatDate(addDays(today, -75)),
  },
  {
    id: 'vol-003',
    name: '张小强',
    phone: '137****9012',
    email: 'zhangxiaoqiang@example.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang',
    totalWaterings: 52,
    joinDate: formatDate(addDays(today, -120)),
  },
  {
    id: 'vol-004',
    name: '李美丽',
    phone: '136****3456',
    email: 'limeili@example.com',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Li',
    totalWaterings: 28,
    joinDate: formatDate(addDays(today, -60)),
  },
  {
    id: 'vol-005',
    name: '陈大勇',
    phone: '135****7890',
    email: 'chendayong@example.com',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chen',
    totalWaterings: 61,
    joinDate: formatDate(addDays(today, -150)),
  },
  {
    id: 'vol-006',
    name: '刘芳芳',
    phone: '134****2345',
    email: 'liufangfang@example.com',
    role: 'volunteer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Liu',
    totalWaterings: 33,
    joinDate: formatDate(addDays(today, -80)),
  },
];

export const generateSchedules = (): Schedule[] => {
  const schedules: Schedule[] = [];
  const timeSlots: ('morning' | 'afternoon' | 'evening')[] = ['morning', 'afternoon', 'evening'];
  const bedIds = ['gb-001', 'gb-002', 'gb-003', 'gb-004', 'gb-005', 'gb-006', 'gb-007', 'gb-008', 'gb-009'];
  const volunteerIds = ['vol-001', 'vol-002', 'vol-003', 'vol-004', 'vol-005', 'vol-006'];
  
  let scheduleId = 1;
  
  for (let dayOffset = -3; dayOffset <= 4; dayOffset++) {
    const date = formatDate(addDays(today, dayOffset));
    
    bedIds.forEach((bedId, bedIndex) => {
      if (bedIndex % 2 === 0 || dayOffset >= 0) {
        timeSlots.forEach((slot, slotIndex) => {
          if ((bedIndex + slotIndex + dayOffset) % 3 === 0) {
            const isPast = dayOffset < 0;
            const isToday = dayOffset === 0;
            const isFuture = dayOffset > 0;
            
            let status: Schedule['status'] = 'unclaimed';
            let volunteerId: string | undefined;
            
            if (isPast) {
              status = 'completed';
              volunteerId = volunteerIds[(scheduleId + bedIndex) % volunteerIds.length];
            } else if (isToday) {
              if (slotIndex === 0) {
                status = 'completed';
                volunteerId = volunteerIds[(scheduleId + 1) % volunteerIds.length];
              } else if (slotIndex === 1) {
                status = 'claimed';
                volunteerId = volunteerIds[(scheduleId + 2) % volunteerIds.length];
              } else {
                status = Math.random() > 0.5 ? 'claimed' : 'unclaimed';
                if (status === 'claimed') {
                  volunteerId = volunteerIds[(scheduleId + 3) % volunteerIds.length];
                }
              }
            } else if (isFuture) {
              if (Math.random() > 0.4) {
                status = 'claimed';
                volunteerId = volunteerIds[scheduleId % volunteerIds.length];
              }
            }
            
            schedules.push({
              id: `sch-${String(scheduleId).padStart(3, '0')}`,
              gardenBedId: bedId,
              volunteerId,
              scheduledDate: date,
              timeSlot: slot,
              status,
            });
            
            scheduleId++;
          }
        });
      }
    });
  }
  
  return schedules;
};

export const generateCheckIns = (): CheckIn[] => {
  const checkIns: CheckIn[] = [];
  const bedIds = ['gb-001', 'gb-002', 'gb-003', 'gb-004', 'gb-005', 'gb-006', 'gb-007', 'gb-008', 'gb-009'];
  const volunteerIds = ['vol-001', 'vol-002', 'vol-003', 'vol-004', 'vol-005', 'vol-006'];
  
  for (let i = 1; i <= 30; i++) {
    const bedIndex = (i - 1) % bedIds.length;
    const volunteerIndex = (i + 2) % volunteerIds.length;
    const hoursAgo = 2 + i * 5;
    const checkInTime = addHours(today, -hoursAgo);
    
    const hasPests = i % 7 === 0;
    const hasWeeds = i % 3 === 0;
    const weedLevels: ('none' | 'mild' | 'moderate' | 'severe')[] = ['none', 'mild', 'moderate', 'severe'];
    
    checkIns.push({
      id: `chk-${String(i).padStart(3, '0')}`,
      gardenBedId: bedIds[bedIndex],
      volunteerId: volunteerIds[volunteerIndex],
      scheduleId: `sch-${String(((i - 1) % 20) + 1).padStart(3, '0')}`,
      checkInTime: formatDateTime(checkInTime),
      createdAt: formatDateTime(checkInTime),
      waterAmount: 10 + Math.floor(Math.random() * 20),
      soilMoisture: 50 + Math.floor(Math.random() * 40),
      hasPests,
      pestDetails: hasPests ? (i % 14 === 0 ? '发现蚜虫，数量较多' : '少量白粉虱') : '',
      hasWeeds,
      weedLevel: hasWeeds ? weedLevels[Math.floor(i / 3) % 4] : 'none',
      harvestedAmount: i % 5 === 0 ? Math.floor(Math.random() * 5) + 1 : 0,
      notes: i % 4 === 0 ? '作物生长良好，颜色翠绿' : undefined,
    });
  }
  
  return checkIns;
};

export const generateAnomalies = (): Anomaly[] => {
  const anomalies: Anomaly[] = [];
  
  anomalies.push({
    id: 'anm-001',
    checkInId: 'chk-007',
    gardenBedId: 'gb-007',
    type: 'missed_watering',
    severity: 'warning',
    message: '菜畦C-01（萝卜）已超过48小时未浇水，请尽快安排',
    resolved: false,
    createdAt: formatDateTime(addHours(today, -2)),
  });
  
  anomalies.push({
    id: 'anm-002',
    checkInId: 'chk-014',
    gardenBedId: 'gb-005',
    type: 'pest_infestation',
    severity: 'warning',
    message: '菜畦B-02（茄子）发现蚜虫虫害，需要及时处理',
    resolved: false,
    createdAt: formatDateTime(addHours(today, -8)),
  });
  
  anomalies.push({
    id: 'anm-003',
    checkInId: 'chk-021',
    gardenBedId: 'gb-004',
    type: 'duplicate_watering',
    severity: 'info',
    message: '菜畦B-01（辣椒）4小时内被浇水2次，请注意水量',
    resolved: true,
    resolvedAt: formatDateTime(addHours(today, -12)),
    resolvedBy: 'vol-003',
    createdAt: formatDateTime(addHours(today, -24)),
  });
  
  anomalies.push({
    id: 'anm-004',
    checkInId: 'chk-028',
    gardenBedId: 'gb-001',
    type: 'excessive_weeds',
    severity: 'info',
    message: '菜畦A-01（番茄）杂草情况为中等，建议清理',
    resolved: true,
    resolvedAt: formatDateTime(addHours(today, -36)),
    resolvedBy: 'vol-001',
    createdAt: formatDateTime(addHours(today, -48)),
  });
  
  return anomalies;
};

export const generateWeather = (): Weather => ({
  condition: 'sunny',
  temperature: 28,
  consecutiveHotDays: 0,
  humidity: 65,
  forecast: '今日晴朗，适合浇水，注意避开中午高温时段',
});

export const generateWaterUsageData = (): { date: string; amount: number }[] => {
  const data: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = formatDate(addDays(today, -i));
    data.push({
      date,
      amount: 30 + Math.floor(Math.random() * 40),
    });
  }
  return data;
};

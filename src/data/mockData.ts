import { addDays, formatISO, subDays, setHours, setMinutes } from 'date-fns';
import type { Display, Reservation, TimeSlot } from '../types';

const displayPhotos = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sleek%2027%20inch%20computer%20monitor%20on%20clean%20white%20desk%2C%20product%20photography%2C%20soft%20lighting&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%2032%20inch%20ultrawide%20monitor%20display%2C%20professional%20product%20shot%2C%20dark%20background&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=compact%2024%20inch%20business%20monitor%2C%20thin%20bezel%2C%20minimalist%20design%2C%20office%20setting&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=high%20end%2027%20inch%204K%20monitor%20with%20USB%20C%20dock%2C%20studio%20lighting%2C%20clean%20minimal&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to?prompt=ergonomic%2032%20inch%20monitor%20with%20height%20adjustable%20stand%2C%20professional%20photo%2C%20neutral%20tones&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dual%20screen%20setup%2027%20inch%20monitors%2C%20clean%20modern%20workspace%2C%20top%20view%20flat%20lay&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=budget%2024%20inch%20office%20monitor%2C%20simple%20clean%20design%2C%20product%20photo%20on%20white&image_size=square_hd',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=premium%2027%20inch%20creator%20monitor%20color%20accurate%2C%20designer%20desk%20background%2C%20warm%20light&image_size=square_hd',
];

const now = new Date();

const baseDisplays: Omit<Display, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 'd1',
    code: 'MON-001',
    size: 27,
    interfaces: ['HDMI', 'DP', 'Type-C'],
    location: '3楼设备柜 A-01',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'HDMI线', quantity: 1 },
      { name: 'Type-C转接头', quantity: 1 },
    ],
    status: 'available',
    photoUrl: displayPhotos[0],
    missingAccessories: [],
    damageCount: 0,
  },
  {
    id: 'd2',
    code: 'MON-002',
    size: 32,
    interfaces: ['HDMI', 'DP'],
    location: '3楼设备柜 A-02',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'DP线', quantity: 1 },
    ],
    status: 'available',
    photoUrl: displayPhotos[1],
    missingAccessories: [],
    damageCount: 2,
    notes: '屏幕左下角有轻微划痕',
  },
  {
    id: 'd3',
    code: 'MON-003',
    size: 24,
    interfaces: ['HDMI', 'VGA'],
    location: '3楼设备柜 A-03',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'HDMI线', quantity: 1 },
      { name: 'VGA转接头', quantity: 1 },
    ],
    status: 'available',
    photoUrl: displayPhotos[2],
    missingAccessories: ['VGA转接头'],
    damageCount: 1,
  },
  {
    id: 'd4',
    code: 'MON-004',
    size: 27,
    interfaces: ['HDMI', 'DP', 'Type-C'],
    location: '3楼设备柜 B-01',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'HDMI线', quantity: 1 },
      { name: 'DP线', quantity: 1 },
      { name: 'Type-C转接头', quantity: 1 },
    ],
    status: 'available',
    photoUrl: displayPhotos[3],
    missingAccessories: [],
    damageCount: 0,
  },
  {
    id: 'd5',
    code: 'MON-005',
    size: 32,
    interfaces: ['HDMI', 'DP', 'Type-C', 'VGA'],
    location: '3楼设备柜 B-02',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'HDMI线', quantity: 1 },
      { name: 'Type-C转接头', quantity: 1 },
      { name: 'VGA转接头', quantity: 1 },
    ],
    status: 'available',
    photoUrl: displayPhotos[4],
    missingAccessories: [],
    damageCount: 3,
    notes: '支架调节旋钮松动',
  },
  {
    id: 'd6',
    code: 'MON-006',
    size: 27,
    interfaces: ['HDMI', 'DP'],
    location: '3楼设备柜 B-03',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'DP线', quantity: 1 },
      { name: 'HDMI转DP转接头', quantity: 1 },
    ],
    status: 'maintenance',
    photoUrl: displayPhotos[5],
    missingAccessories: ['HDMI转DP转接头'],
    damageCount: 5,
    notes: '显示屏不亮，已送修',
  },
  {
    id: 'd7',
    code: 'MON-007',
    size: 24,
    interfaces: ['HDMI', 'DVI'],
    location: '5楼设备柜 C-01',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'HDMI线', quantity: 1 },
    ],
    status: 'available',
    photoUrl: displayPhotos[6],
    missingAccessories: [],
    damageCount: 0,
  },
  {
    id: 'd8',
    code: 'MON-008',
    size: 27,
    interfaces: ['HDMI', 'DP', 'Type-C'],
    location: '5楼设备柜 C-02',
    accessories: [
      { name: '电源线', quantity: 1 },
      { name: 'HDMI线', quantity: 1 },
      { name: 'Type-C线', quantity: 1 },
    ],
    status: 'available',
    photoUrl: displayPhotos[7],
    missingAccessories: [],
    damageCount: 1,
  },
];

export const mockDisplays: Display[] = baseDisplays.map((d) => ({
  ...d,
  createdAt: formatISO(subDays(now, 60 + Math.floor(Math.random() * 100))),
  updatedAt: formatISO(subDays(now, Math.floor(Math.random() * 20))),
}));

const users = [
  { name: '张伟', dept: '研发部' },
  { name: '李娜', dept: '产品部' },
  { name: '王磊', dept: '设计部' },
  { name: '刘洋', dept: '市场部' },
  { name: '陈静', dept: '销售部' },
  { name: '杨帆', dept: '研发部' },
  { name: '赵丽', dept: '人力资源部' },
  { name: '孙强', dept: '财务部' },
  { name: '周敏', dept: '行政部' },
  { name: '吴鹏', dept: '客户服务部' },
];

const purposes = [
  '远程会议',
  '产品评审会',
  '设计方案评审',
  '客户演示',
  '培训会议',
  '代码评审',
  '项目周会',
  '数据分析',
];

const workstations = [
  '3F-A01',
  '3F-A05',
  '3F-B12',
  '3F-C08',
  '5F-A03',
  '5F-B07',
  '5F-C11',
  '会议室301',
  '会议室502',
];

const timeSlots: TimeSlot[] = ['morning', 'afternoon', 'allday'];

function generatePastReservations(): Reservation[] {
  const reservations: Reservation[] = [];
  let idCounter = 1;

  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 28) + 1;
    const useDate = subDays(now, daysAgo);
    const user = users[Math.floor(Math.random() * users.length)];
    const displayId = `d${Math.floor(Math.random() * 8) + 1}`;
    const ts = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    const hasScratch = Math.random() < 0.15;
    const missingCable = Math.random() < 0.1;
    const missingAdapter = Math.random() < 0.1;
    const wrongLocation = Math.random() < 0.12;

    const missingOnReturn: string[] = [];
    if (missingCable) missingOnReturn.push('电源线');
    if (missingAdapter) missingOnReturn.push('Type-C转接头');

    reservations.push({
      id: `r${idCounter++}`,
      displayId,
      userName: user.name,
      department: user.dept,
      useDate: formatISO(useDate, { representation: 'date' }),
      timeSlot: ts,
      workstation: workstations[Math.floor(Math.random() * workstations.length)],
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      status: 'returned',
      borrowTime: formatISO(setMinutes(setHours(useDate, 9), 0)),
      returnTime: formatISO(setMinutes(setHours(useDate, 18), 0)),
      missingAccessoriesOnReturn: missingOnReturn.length > 0 ? missingOnReturn : undefined,
      hasScratch,
      inCorrectLocation: !wrongLocation,
      returnNotes: hasScratch ? '发现屏幕有新划痕' : missingCable ? '归还时缺少电源线' : undefined,
      createdAt: formatISO(subDays(useDate, 1)),
    });
  }

  return reservations;
}

function generateActiveReservations(): Reservation[] {
  const reservations: Reservation[] = [];
  let idCounter = 100;

  const today = formatISO(now, { representation: 'date' });
  const tomorrow = formatISO(addDays(now, 1), { representation: 'date' });
  const dayAfter = formatISO(addDays(now, 2), { representation: 'date' });

  reservations.push({
    id: `r${idCounter++}`,
    displayId: 'd1',
    userName: '张伟',
    department: '研发部',
    useDate: today,
    timeSlot: 'morning',
    workstation: '3F-A01',
    purpose: '远程会议',
    status: 'using',
    borrowTime: formatISO(setMinutes(setHours(now, 9), 15)),
    createdAt: formatISO(subDays(now, 1)),
  });

  reservations.push({
    id: `r${idCounter++}`,
    displayId: 'd4',
    userName: '李娜',
    department: '产品部',
    useDate: today,
    timeSlot: 'allday',
    workstation: '会议室301',
    purpose: '产品评审会',
    status: 'using',
    borrowTime: formatISO(setMinutes(setHours(now, 9), 0)),
    createdAt: formatISO(subDays(now, 2)),
  });

  reservations.push({
    id: `r${idCounter++}`,
    displayId: 'd7',
    userName: '王磊',
    department: '设计部',
    useDate: tomorrow,
    timeSlot: 'afternoon',
    workstation: '5F-B07',
    purpose: '设计方案评审',
    status: 'reserved',
    createdAt: formatISO(now),
  });

  reservations.push({
    id: `r${idCounter++}`,
    displayId: 'd2',
    userName: '刘洋',
    department: '市场部',
    useDate: dayAfter,
    timeSlot: 'allday',
    workstation: '会议室502',
    purpose: '客户演示',
    status: 'reserved',
    createdAt: formatISO(subDays(now, 1)),
  });

  reservations.push({
    id: `r${idCounter++}`,
    displayId: 'd8',
    userName: '陈静',
    department: '销售部',
    useDate: tomorrow,
    timeSlot: 'morning',
    workstation: '3F-C08',
    purpose: '培训会议',
    status: 'reserved',
    createdAt: formatISO(subDays(now, 1)),
  });

  return reservations;
}

export const mockReservations: Reservation[] = [
  ...generatePastReservations(),
  ...generateActiveReservations(),
];

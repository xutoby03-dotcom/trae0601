import { FamilyMember, Cat, LitterBox, CleanRecord, LitterType } from '../types';
import { generateId } from '../lib/utils';

const now = new Date();
const iso = (daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0) => {
  const d = new Date(now.getTime() - daysAgo * 86400000 - hoursAgo * 3600000 - minutesAgo * 60000);
  return d.toISOString();
};

export const initialMembers: FamilyMember[] = [
  { id: 'm1', name: '爸爸', avatar: '👨', color: '#6B8E7A' },
  { id: 'm2', name: '妈妈', avatar: '👩', color: '#C48E9F' },
  { id: 'm3', name: '小明', avatar: '🧑', color: '#8BA4B8' },
  { id: 'm4', name: '小红', avatar: '👧', color: '#D4A373' },
];

export const initialCats: Cat[] = [
  { id: 'c1', name: '橘子', avatar: '🐱' },
  { id: 'c2', name: '煤球', avatar: '🐈‍⬛' },
  { id: 'c3', name: '年糕', avatar: '🐈' },
];

const litterPhotos: Record<LitterType, string> = {
  '豆腐砂': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20litter%20box%20with%20tofu%20litter%20in%20bathroom%20corner%20warm%20lighting%20cozy%20home&image_size=square',
  '膨润土': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bentonite%20cat%20litter%20box%20clean%20tidy%20minimal%20home%20interior%20soft%20natural%20light&image_size=square',
  '混合砂': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=mixed%20cat%20litter%20box%20in%20living%20room%20corner%20pastel%20aesthetic%20warm%20cozy%20style&image_size=square',
  '水晶砂': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=silica%20gel%20crystal%20cat%20litter%20box%20modern%20bathroom%20bright%20clean%20scandinavian%20style&image_size=square',
  '松木砂': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pine%20wood%20cat%20litter%20box%20natural%20eco%20friendly%20japanese%20style%20home%20warm%20wooden%20interior&image_size=square',
  '纸砂': 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=paper%20pellet%20cat%20litter%20box%20cozy%20bedroom%20corner%20soft%20warm%20lighting%20minimalist&image_size=square',
};

export const initialLitterBoxes: LitterBox[] = [
  {
    id: 'lb1',
    name: '主卫盆',
    location: '主人卫生间',
    litterType: '豆腐砂',
    capacity: 12,
    photo: litterPhotos['豆腐砂'],
    lastFullChange: iso(7, 2),
    fullChangeIntervalDays: 14,
    cleanIntervalHours: 12,
    catIds: ['c1', 'c2'],
  },
  {
    id: 'lb2',
    name: '阳台盆',
    location: '客厅阳台',
    litterType: '膨润土',
    capacity: 15,
    photo: litterPhotos['膨润土'],
    lastFullChange: iso(3, 5),
    fullChangeIntervalDays: 10,
    cleanIntervalHours: 8,
    catIds: ['c2', 'c3'],
  },
  {
    id: 'lb3',
    name: '书房盆',
    location: '书房角落',
    litterType: '混合砂',
    capacity: 10,
    photo: litterPhotos['混合砂'],
    lastFullChange: iso(12, 8),
    fullChangeIntervalDays: 14,
    cleanIntervalHours: 16,
    catIds: ['c1'],
  },
  {
    id: 'lb4',
    name: '客卫盆',
    location: '客人卫生间',
    litterType: '松木砂',
    capacity: 12,
    photo: litterPhotos['松木砂'],
    lastFullChange: iso(1, 3),
    fullChangeIntervalDays: 21,
    cleanIntervalHours: 24,
    catIds: ['c3'],
  },
];

const members = ['m1', 'm2', 'm3', 'm4'];
const boxes = ['lb1', 'lb2', 'lb3', 'lb4'];
const clumps: CleanRecord['clumpLevel'][] = ['少', '中', '多'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateInitialRecords = (): CleanRecord[] => {
  const records: CleanRecord[] = [];

  for (let day = 0; day < 30; day++) {
    const recordsPerDay = 4 + Math.floor(Math.random() * 4);
    for (let i = 0; i < recordsPerDay; i++) {
      const boxId = pick(boxes);
      const hoursAgoToday = Math.random() * 24;
      const isFullChange = Math.random() < 0.05;

      records.push({
        id: generateId(),
        litterBoxId: boxId,
        memberId: pick(members),
        cleanTime: iso(day, hoursAgoToday + i * 2),
        smellLevel: (Math.floor(Math.random() * 5) + 1) as 1 | 2 | 3 | 4 | 5,
        clumpLevel: pick(clumps),
        addedLitter: isFullChange ? true : Math.random() < 0.3,
        addedAmount: isFullChange ? 0 : Math.floor(Math.random() * 3) * 200 + 200,
        isFullChange,
        note: isFullChange ? '整盆更换完毕，盆体已清洗' : undefined,
      });
    }
  }

  records.push(
    {
      id: generateId(),
      litterBoxId: 'lb2',
      memberId: 'm1',
      cleanTime: iso(0, 14),
      smellLevel: 4,
      clumpLevel: '多',
      addedLitter: false,
      addedAmount: 0,
      isFullChange: false,
    },
    {
      id: generateId(),
      litterBoxId: 'lb2',
      memberId: 'm3',
      cleanTime: iso(0, 22),
      smellLevel: 4,
      clumpLevel: '中',
      addedLitter: true,
      addedAmount: 200,
      isFullChange: false,
    },
    {
      id: generateId(),
      litterBoxId: 'lb2',
      memberId: 'm2',
      cleanTime: iso(0, 6),
      smellLevel: 5,
      clumpLevel: '多',
      addedLitter: false,
      addedAmount: 0,
      isFullChange: false,
    }
  );

  return records.sort((a, b) => new Date(b.cleanTime).getTime() - new Date(a.cleanTime).getTime());
};

export const initialCurrentMemberId = 'm1';

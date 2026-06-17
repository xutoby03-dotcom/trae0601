import type { Umbrella, ClaimApplication, ShareRecord, ScrapRecord } from '@/types';
import { createPlaceholderUmbrellaSVG, createHandlePlaceholderSVG } from './imageUtils';
import { STORAGE_PERIOD_DAYS } from './constants';

const generateId = (prefix: string, num: number): string => `${prefix}-${String(num).padStart(3, '0')}`;

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const getRandomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const getRandomDate = (daysAgo: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  date.setHours(Math.floor(Math.random() * 12) + 8);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

const COLORS = [
  { name: '黑色', hex: '#1a1a1a' },
  { name: '黑色', hex: '#1a1a1a' },
  { name: '黑色', hex: '#1a1a1a' },
  { name: '深蓝', hex: '#1e3a5f' },
  { name: '深蓝', hex: '#1e3a5f' },
  { name: '浅蓝', hex: '#4A90D9' },
  { name: '红色', hex: '#DC2626' },
  { name: '粉色', hex: '#EC4899' },
  { name: '紫色', hex: '#8B5CF6' },
  { name: '绿色', hex: '#10B981' },
  { name: '灰色', hex: '#6B7280' },
  { name: '花色', hex: '#8B5CF6' },
];

const BRANDS = ['天堂伞', '天堂伞', '蕉下', '小米', '名创优品', '无印良品', '优衣库', '其他'];

const BUILDINGS = ['教学楼A', '教学楼A', '教学楼B', '图书馆', '图书馆', '食堂', '宿舍楼1', '宿舍楼2', '体育馆'];

const AREAS: Record<string, string[]> = {
  '教学楼A': ['一楼大厅', '二楼走廊', '三楼教室', '四楼自习室'],
  '教学楼B': ['一楼大厅', '二楼走廊', '三楼教室', '四楼多媒体'],
  '图书馆': ['一楼大厅', '二楼借阅区', '三楼阅览区', '四楼电子阅览'],
  '食堂': ['一楼餐厅', '二楼餐厅', '门口区域', '取餐区'],
  '宿舍楼1': ['一楼大厅', '二楼走廊', '三楼走廊', '四楼走廊'],
  '宿舍楼2': ['一楼大厅', '二楼走廊', '三楼走廊', '四楼走廊'],
  '体育馆': ['主馆入口', '篮球场', '羽毛球馆', '健身房'],
};

const FEATURES = ['纯色', '纯色', '纯色', '格子', '条纹', '波点', '印花', '卡通', 'LOGO', '长柄', '折叠', '弯钩', '直柄', '自动伞', '手动伞'];

const STORAGE_CELLS = ['A-01', 'A-02', 'A-03', 'A-04', 'A-05', 'B-01', 'B-02', 'B-03', 'B-04', 'B-05', 'C-01', 'C-02', 'C-03'];

const DESCRIPTIONS = [
  '伞面有轻微磨损',
  '伞骨有一根轻微弯曲',
  '九成新，使用次数少',
  '伞柄有防滑套',
  '伞面印有品牌logo',
  '折叠伞，携带方便',
  '长柄伞，防风设计',
  '伞边缘有反光条',
  '伞面有污渍，可清洗',
  '骨架完好，功能正常',
];

export const generateMockUmbrellas = (count: number = 25): Umbrella[] => {
  const umbrellas: Umbrella[] = [];
  
  for (let i = 0; i < count; i++) {
    const color = getRandomItem(COLORS);
    const building = getRandomItem(BUILDINGS);
    const area = getRandomItem(AREAS[building]);
    const foundTime = getRandomDate(20);
    const features = getRandomItems(FEATURES, Math.floor(Math.random() * 3) + 1);
    
    let status: Umbrella['status'] = 'pending';
    const rand = Math.random();
    if (rand > 0.75) status = 'claimed';
    else if (rand > 0.65) status = 'shared';
    else if (rand > 0.6) status = 'scrapped';
    
    umbrellas.push({
      id: generateId('umb', i + 1),
      color: color.name,
      colorHex: color.hex,
      brand: getRandomItem(BRANDS),
      features,
      description: getRandomItem(DESCRIPTIONS),
      canopyPhoto: createPlaceholderUmbrellaSVG(color.hex),
      handlePhoto: createHandlePlaceholderSVG('#555555'),
      foundLocation: { building, area },
      foundTime,
      storageCell: getRandomItem(STORAGE_CELLS),
      status,
      storagePeriodDays: STORAGE_PERIOD_DAYS,
      createdAt: foundTime,
      updatedAt: foundTime,
    });
  }
  
  return umbrellas;
};

export const generateMockClaims = (umbrellas: Umbrella[]): ClaimApplication[] => {
  const claims: ClaimApplication[] = [];
  const pendingUmbrellas = umbrellas.filter(u => u.status === 'pending').slice(0, 5);
  
  const classes = ['高一(1)班', '高一(3)班', '高二(2)班', '高二(5)班', '高三(1)班', '大三(2)班', '大四(1)班'];
  
  pendingUmbrellas.forEach((umbrella, index) => {
    claims.push({
      id: generateId('claim', index + 1),
      umbrellaId: umbrella.id,
      applicantClass: getRandomItem(classes),
      phoneLastFour: String(Math.floor(1000 + Math.random() * 9000)),
      ownershipProof: `这把伞是我${getRandomItem(['上周', '前几天', '昨天'])}在${umbrella.foundLocation.building}丢的，${umbrella.features.join('、')}，${getRandomItem(['伞面有个小划痕', '伞柄有我的名字缩写', '是我生日时朋友送的', '伞骨有一根是歪的'])}`,
      status: Math.random() > 0.5 ? 'pending' : 'approved',
      createdAt: getRandomDate(5),
    });
  });
  
  return claims;
};

export const generateMockShareRecords = (umbrellas: Umbrella[]): ShareRecord[] => {
  const records: ShareRecord[] = [];
  const sharedUmbrellas = umbrellas.filter(u => u.status === 'shared').slice(0, 3);
  
  const names = ['张三', '李四', '王五', '赵六', '孙七'];
  const classes = ['高一(1)班', '高二(3)班', '高三(2)班', '大二(1)班', '大三(4)班'];
  const buildings = ['教学楼A', '教学楼B', '图书馆', '食堂', '宿舍楼1'];
  const remarks = ['急用一下，明天还', '下雨天没带伞', '临时借用', null, null];
  
  sharedUmbrellas.forEach((umbrella, index) => {
    const isReturned = Math.random() > 0.4;
    const borrowTime = getRandomDate(7);
    records.push({
      id: generateId('share', index + 1),
      umbrellaId: umbrella.id,
      borrowerName: getRandomItem(names),
      borrowerClass: getRandomItem(classes),
      borrowerPhone: `138****${String(Math.floor(1000 + Math.random() * 9000))}`,
      borrowLocation: getRandomItem(buildings),
      borrowTime,
      returnLocation: isReturned ? getRandomItem(buildings) : null,
      returnTime: isReturned ? getRandomDate(3) : null,
      remark: getRandomItem(remarks),
      status: isReturned ? 'returned' : 'borrowed',
    });
  });
  
  return records;
};

export const generateMockScrapRecords = (umbrellas: Umbrella[]): ScrapRecord[] => {
  const records: ScrapRecord[] = [];
  const scrappedUmbrellas = umbrellas.filter(u => u.status === 'scrapped');
  
  const reasons = ['破损严重', '破损严重', '遗失', '其他', '破损严重'];
  const operators = ['管理员小王', '李师傅', '张同学'];
  const remarks = ['伞骨全部断裂，无法修复', '伞面有多处破洞', '存放期间遗失', null, null];
  
  scrappedUmbrellas.forEach((umbrella, index) => {
    const scrapTime = getRandomDate(10);
    records.push({
      id: generateId('scrap', index + 1),
      umbrellaId: umbrella.id,
      reason: getRandomItem(reasons),
      operator: getRandomItem(operators),
      remark: getRandomItem(remarks),
      scrapTime,
    });
  });
  
  return records;
};

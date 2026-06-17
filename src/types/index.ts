export interface Box {
  id: string;
  code: string;
  location: string;
  labelColor: string;
  capacity: number;
  moisturePackDate: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClothingStatus = 'in_box' | 'taken_out' | 'pending';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all';

export type ClothingCategory = 
  | 'coat' 
  | 'top' 
  | 'pants' 
  | 'dress' 
  | 'skirt'
  | 'underwear' 
  | 'accessory' 
  | 'shoes'
  | 'other';

export interface Clothing {
  id: string;
  boxId?: string;
  name: string;
  owner: string;
  size: string;
  season: Season;
  category: ClothingCategory;
  isWashed: boolean;
  isVacuumPacked: boolean;
  status: ClothingStatus;
  photo?: string;
  lastWornDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ReminderType = 'moisture_pack' | 'donation';

export interface Reminder {
  id: string;
  type: ReminderType;
  relatedId: string;
  relatedType: 'box' | 'clothing';
  title: string;
  description: string;
  date: string;
  isRead: boolean;
  level: 'info' | 'warning' | 'danger';
}

export type Owner = '爸爸' | '妈妈' | '孩子' | '其他';

export const OWNERS: Owner[] = ['爸爸', '妈妈', '孩子', '其他'];

export const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: '春季' },
  { value: 'summer', label: '夏季' },
  { value: 'autumn', label: '秋季' },
  { value: 'winter', label: '冬季' },
  { value: 'all', label: '四季' },
];

export const CATEGORIES: { value: ClothingCategory; label: string }[] = [
  { value: 'coat', label: '外套' },
  { value: 'top', label: '上衣' },
  { value: 'pants', label: '裤子' },
  { value: 'dress', label: '连衣裙' },
  { value: 'skirt', label: '裙子' },
  { value: 'underwear', label: '内衣' },
  { value: 'accessory', label: '配饰' },
  { value: 'shoes', label: '鞋子' },
  { value: 'other', label: '其他' },
];

export const LABEL_COLORS = [
  { value: '#E8998D', name: '珊瑚橙' },
  { value: '#9CAF88', name: '鼠尾草绿' },
  { value: '#A8D0DB', name: '雾霾蓝' },
  { value: '#D4A574', name: '浅棕色' },
  { value: '#B8A9C9', name: '薰衣草紫' },
  { value: '#F2C94C', name: '柠檬黄' },
];

export const SCENARIOS = [
  { value: 'spring_trip', label: '春游', categories: ['coat', 'top', 'pants'], season: 'spring' as Season },
  { value: 'school', label: '上学', categories: ['top', 'pants', 'dress', 'skirt', 'shoes'], season: 'all' as Season },
  { value: 'sports', label: '运动', categories: ['top', 'pants', 'shoes'], season: 'all' as Season },
  { value: 'formal', label: '正式', categories: ['coat', 'top', 'pants', 'dress', 'shoes'], season: 'all' as Season },
  { value: 'beach', label: '海边', categories: ['top', 'dress', 'shoes', 'accessory'], season: 'summer' as Season },
  { value: 'ski', label: '滑雪', categories: ['coat', 'top', 'pants', 'accessory'], season: 'winter' as Season },
];

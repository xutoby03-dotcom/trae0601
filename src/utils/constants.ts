import type { ColorOption, BuildingOption } from '@/types';

export const COLOR_OPTIONS: ColorOption[] = [
  { name: '黑色', hex: '#1a1a1a' },
  { name: '深蓝', hex: '#1e3a5f' },
  { name: '浅蓝', hex: '#4A90D9' },
  { name: '红色', hex: '#DC2626' },
  { name: '粉色', hex: '#EC4899' },
  { name: '紫色', hex: '#8B5CF6' },
  { name: '绿色', hex: '#10B981' },
  { name: '黄色', hex: '#F59E0B' },
  { name: '橙色', hex: '#FF8C42' },
  { name: '灰色', hex: '#6B7280' },
  { name: '白色', hex: '#F9FAFB' },
  { name: '花色', hex: '#8B5CF6' },
];

export const BUILDING_OPTIONS: BuildingOption[] = [
  { name: '教学楼A', areas: ['一楼大厅', '二楼走廊', '三楼教室', '四楼自习室', '五楼实验室'] },
  { name: '教学楼B', areas: ['一楼大厅', '二楼走廊', '三楼教室', '四楼多媒体', '五楼机房'] },
  { name: '图书馆', areas: ['一楼大厅', '二楼借阅区', '三楼阅览区', '四楼电子阅览', '五楼研修室'] },
  { name: '食堂', areas: ['一楼餐厅', '二楼餐厅', '三楼清真', '门口区域', '取餐区'] },
  { name: '宿舍楼1', areas: ['一楼大厅', '二楼走廊', '三楼走廊', '四楼走廊', '五楼走廊'] },
  { name: '宿舍楼2', areas: ['一楼大厅', '二楼走廊', '三楼走廊', '四楼走廊', '五楼走廊'] },
  { name: '体育馆', areas: ['主馆入口', '篮球场', '羽毛球馆', '健身房', '游泳馆'] },
  { name: '行政楼', areas: ['一楼大厅', '二楼办公区', '三楼会议室', '四楼人事处', '五楼校长室'] },
];

export const BUILDINGS = BUILDING_OPTIONS.map(b => b.name);

export const SCRAP_REASONS = ['破损严重', '遗失', '其他'];

export const STORAGE_CELLS = [
  'A-01', 'A-02', 'A-03', 'A-04', 'A-05',
  'B-01', 'B-02', 'B-03', 'B-04', 'B-05',
  'C-01', 'C-02', 'C-03', 'C-04', 'C-05',
];

export const FEATURE_OPTIONS = [
  '纯色', '格子', '条纹', '波点', '印花', '卡通', 'LOGO', '长柄',
  '折叠', '弯钩', '直柄', '自动伞', '手动伞', '透明伞', '反光边',
];

export const UMBRELLA_BRANDS = [
  '天堂伞', '蕉下', '蕉下', '小米', '名创优品', '无印良品',
  '优衣库', '耐克', '阿迪达斯', '安踏', '李宁', '其他',
];

export const STORAGE_PERIOD_DAYS = 15;
export const EXPIRING_WARNING_DAYS = 3;

import { Area, FamilyMember, ClothingTypeOption } from '../types';

export const AREAS: Area[] = [
  {
    id: 'south-balcony',
    name: '南阳台',
    description: '阳光充足，适合晾晒',
    gradientStart: '#FFF7E6',
    gradientEnd: '#FFE4B5',
    icon: '☀️'
  },
  {
    id: 'north-balcony',
    name: '北阳台',
    description: '阴凉通风，适合阴干',
    gradientStart: '#E6F3FF',
    gradientEnd: '#B5D8FF',
    icon: '💨'
  },
  {
    id: 'master-balcony',
    name: '主卧阳台',
    description: '私密空间，内衣专属',
    gradientStart: '#F5F0FF',
    gradientEnd: '#E0D0FF',
    icon: '🛏️'
  }
];

export const FAMILY_MEMBERS: FamilyMember[] = [
  { id: 'dad', name: '爸爸', avatar: '👨', color: '#4A90D9' },
  { id: 'mom', name: '妈妈', avatar: '👩', color: '#F5A623' },
  { id: 'xiaoming', name: '小明', avatar: '👦', color: '#7ED321' },
  { id: 'xiaohong', name: '小红', avatar: '👧', color: '#D94A90' }
];

export const CLOTHING_TYPES: ClothingTypeOption[] = [
  { value: 'top', label: '上衣', icon: '👕' },
  { value: 'pants', label: '裤子', icon: '👖' },
  { value: 'underwear', label: '内衣', icon: '🩲' },
  { value: 'bedding', label: '床品', icon: '🛏️' },
  { value: 'other', label: '其他', icon: '🧦' }
];

export const EXPECTED_DURATION_OPTIONS = [
  { value: 2, label: '2小时（夏季薄衣）' },
  { value: 4, label: '4小时（春秋常规）' },
  { value: 6, label: '6小时（厚衣物）' },
  { value: 8, label: '8小时（牛仔/床品）' },
  { value: 12, label: '12小时（冬季厚衣）' },
  { value: 24, label: '24小时（阴干）' },
];

export const STORAGE_KEYS = {
  RECORDS: 'clothes_records',
  AREAS: 'areas',
  MEMBERS: 'family_members',
  REMINDERS: 'reminders',
  WEATHER: 'current_weather',
};

export const WEATHER_CONDITIONS = {
  sunny: { icon: '☀️', label: '晴天', color: 'text-yellow-500' },
  cloudy: { icon: '⛅', label: '多云', color: 'text-gray-500' },
  rainy: { icon: '🌧️', label: '下雨', color: 'text-blue-500' },
  foggy: { icon: '🌫️', label: '起雾', color: 'text-gray-400' },
  night: { icon: '🌙', label: '夜间', color: 'text-purple-500' },
};

import type { ItineraryType, EventType, ExpenseCategory, EquipmentCategory } from '../types';

export const formatTime = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (isoString: string): string => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const itineraryTypeConfig: Record<ItineraryType, { label: string; color: string; icon: string }> = {
  meetup: { label: '集合点', color: 'bg-forest-500', icon: 'flag' },
  supply: { label: '补给点', color: 'bg-blue-500', icon: 'shopping-cart' },
  fuel: { label: '加油点', color: 'bg-warm-500', icon: 'fuel' },
  camp: { label: '营地', color: 'bg-forest-700', icon: 'tent' },
  scenic: { label: '景点', color: 'bg-purple-500', icon: 'camera' },
};

export const eventTypeConfig: Record<EventType, { label: string; color: string }> = {
  delay: { label: '掉队/延误', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  detour: { label: '临时改线', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  breakdown: { label: '车辆故障', color: 'bg-red-100 text-red-800 border-red-300' },
  accident: { label: '事故', color: 'bg-red-200 text-red-900 border-red-400' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-800 border-gray-300' },
};

export const expenseCategoryConfig: Record<ExpenseCategory, { label: string; color: string }> = {
  fuel: { label: '油费', color: 'bg-warm-100 text-warm-700' },
  toll: { label: '高速费', color: 'bg-blue-100 text-blue-700' },
  parking: { label: '停车费', color: 'bg-purple-100 text-purple-700' },
  food: { label: '餐饮', color: 'bg-green-100 text-green-700' },
  supply: { label: '物资', color: 'bg-forest-100 text-forest-700' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-700' },
};

export const equipmentCategoryConfig: Record<EquipmentCategory, { label: string; color: string }> = {
  cooking: { label: '厨炊', color: 'bg-warm-100 text-warm-700' },
  sleeping: { label: '寝具', color: 'bg-blue-100 text-blue-700' },
  safety: { label: '安全', color: 'bg-red-100 text-red-700' },
  entertainment: { label: '娱乐', color: 'bg-purple-100 text-purple-700' },
  other: { label: '其他', color: 'bg-gray-100 text-gray-700' },
};

export const cn = (...classes: (string | false | null | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

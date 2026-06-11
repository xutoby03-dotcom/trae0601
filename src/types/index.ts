export type EquipmentCategory = 'tent' | 'sleep' | 'cooking' | 'lighting' | 'firstaid' | 'entertainment';

export type EquipmentStatus = 'unassigned' | 'packed' | 'in_car' | 'at_risk';

export interface Trip {
  id: string;
  location: string;
  peopleCount: number;
  days: number;
  weather: string;
  vehicle: string;
  meetingTime: string;
  createdAt: string;
}

export interface Person {
  id: string;
  tripId: string;
  name: string;
  avatarColor: string;
}

export interface Equipment {
  id: string;
  tripId: string;
  name: string;
  category: EquipmentCategory;
  weightGrams: number;
  volumeLiters: number;
  responsiblePersonId: string | null;
  bagName: string | null;
  status: EquipmentStatus;
  confirmedAtCamp: boolean;
  forgetCount: number;
  notes: string;
}

export const CATEGORY_META: Record<EquipmentCategory, { label: string; emoji: string; color: string }> = {
  tent: { label: '帐篷', emoji: '⛺', color: 'bg-forest-100 text-forest-700' },
  sleep: { label: '睡眠', emoji: '🛏️', color: 'bg-indigo-100 text-indigo-700' },
  cooking: { label: '烹饪', emoji: '🍳', color: 'bg-warmorange-100 text-warmorange-700' },
  lighting: { label: '照明', emoji: '💡', color: 'bg-yellow-100 text-yellow-700' },
  firstaid: { label: '急救', emoji: '🩹', color: 'bg-red-100 text-red-700' },
  entertainment: { label: '娱乐', emoji: '🎮', color: 'bg-purple-100 text-purple-700' },
};

export const STATUS_META: Record<EquipmentStatus, { label: string; emoji: string; color: string; bgColor: string }> = {
  unassigned: { label: '未分配', emoji: '📋', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
  packed: { label: '已打包', emoji: '✅', color: 'text-forest-600', bgColor: 'bg-forest-50 border-forest-200' },
  in_car: { label: '已装车', emoji: '🚗', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  at_risk: { label: '遗漏风险', emoji: '⚠️', color: 'text-warmorange-600', bgColor: 'bg-warmorange-50 border-warmorange-200' },
};

export const AVATAR_COLORS = [
  '#428336', '#E67E22', '#3B82F6', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F59E0B', '#10B981',
  '#EF4444', '#6366F1',
];

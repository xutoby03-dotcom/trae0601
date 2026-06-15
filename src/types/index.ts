export type AllergyType = 'nuts' | 'dairy' | 'seafood' | 'eggs' | 'wheat' | 'soy' | 'other';

export type AllergySeverity = 'mild' | 'moderate' | 'severe';

export interface AllergyTag {
  id: string;
  type: AllergyType;
  name: string;
  severity: AllergySeverity;
  icon: string;
}

export interface Student {
  id: string;
  name: string;
  className: string;
  grade: string;
  studentNo: string;
  photo?: string;
  allergies: AllergyTag[];
  guardianName: string;
  guardianPhone: string;
  guardianConfirmed: boolean;
  medicalCertificateUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type DishCategory = 'staple' | 'main' | 'side' | 'soup' | 'fruit';

export interface MenuItem {
  id: string;
  name: string;
  category: DishCategory;
  ingredients: string[];
  allergies: AllergyType[];
  replacementId?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface DailyMenu {
  date: string;
  breakfast: MenuItem[];
  lunch: MenuItem[];
  dinner: MenuItem[];
}

export type PrepStatus = 'pending' | 'preparing' | 'ready' | 'picked';

export interface PrepItem {
  id: string;
  date: string;
  mealType: MealType;
  studentId: string;
  studentName: string;
  className: string;
  originalDish: string;
  replacementDish: string;
  allergies: AllergyType[];
  qrCode: string;
  status: PrepStatus;
}

export type PickupStatus = 'picked' | 'not_picked' | 'wrong_pick' | 'leave';

export interface WrongPickDetail {
  actualTakerName: string;
  wrongQrTail: string;
  handleNotes: string;
}

export interface PickupRecord {
  id: string;
  date: string;
  mealType: MealType;
  studentId: string;
  prepItemId: string;
  status: PickupStatus;
  pickedBy?: 'student' | 'teacher';
  pickedByName?: string;
  pickedAt?: string;
  notes?: string;
  wrongPickDetail?: WrongPickDetail;
}

export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  totalReplacements: number;
  notPickedCount: number;
  wrongPickCount: number;
  dailyData: { date: string; replacements: number; notPicked: number }[];
  allergyRanking: { type: AllergyType; name: string; count: number }[];
  notPickedList: { studentId: string; studentName: string; className: string; count: number }[];
}

export const ALLERGY_META: Record<AllergyType, { name: string; icon: string; highRisk: boolean }> = {
  nuts: { name: '坚果', icon: '🌰', highRisk: true },
  dairy: { name: '乳制品', icon: '🥛', highRisk: true },
  seafood: { name: '海鲜', icon: '🦐', highRisk: true },
  eggs: { name: '鸡蛋', icon: '🥚', highRisk: false },
  wheat: { name: '小麦', icon: '🌾', highRisk: false },
  soy: { name: '大豆', icon: '🫘', highRisk: false },
  other: { name: '其他', icon: '⚠️', highRisk: false },
};

export const MEAL_TYPE_META: Record<MealType, { name: string; icon: string }> = {
  breakfast: { name: '早餐', icon: '🌅' },
  lunch: { name: '午餐', icon: '☀️' },
  dinner: { name: '晚餐', icon: '🌙' },
};

export const DISH_CATEGORY_META: Record<DishCategory, { name: string; icon: string }> = {
  staple: { name: '主食', icon: '🍚' },
  main: { name: '主菜', icon: '🍖' },
  side: { name: '配菜', icon: '🥗' },
  soup: { name: '汤品', icon: '🍲' },
  fruit: { name: '水果', icon: '🍎' },
};

export const PICKUP_STATUS_META: Record<PickupStatus, { name: string; className: string }> = {
  picked: { name: '已领取', className: 'bg-primary-100 text-primary-700' },
  not_picked: { name: '未领取', className: 'bg-warning-100 text-warning-700' },
  wrong_pick: { name: '错领', className: 'bg-danger-100 text-danger-700' },
  leave: { name: '请假', className: 'bg-slate-100 text-slate-600' },
};

export const PREP_STATUS_META: Record<PrepStatus, { name: string; className: string }> = {
  pending: { name: '待备餐', className: 'bg-slate-100 text-slate-600' },
  preparing: { name: '制作中', className: 'bg-warning-100 text-warning-700' },
  ready: { name: '已就绪', className: 'bg-info-100 text-info-700' },
  picked: { name: '已领取', className: 'bg-primary-100 text-primary-700' },
};

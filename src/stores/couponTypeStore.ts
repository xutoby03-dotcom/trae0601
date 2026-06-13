import { create } from 'zustand';
import type { CouponType, CouponTypeCategory } from '@/types';
import { mockCouponTypes } from '@/data/mockData';
import { generateId } from '@/utils';
import { getFromStorage, setToStorage } from '@/hooks/useLocalStorage';

const STORAGE_KEY = 'birthday_coupon_types';

interface CouponTypeState {
  couponTypes: CouponType[];
  addCouponType: (coupon: Omit<CouponType, 'id' | 'createdAt'>) => void;
  updateCouponType: (id: string, coupon: Partial<CouponType>) => void;
  deleteCouponType: (id: string) => void;
  getCouponTypeById: (id: string) => CouponType | undefined;
}

const initialCouponTypes = (): CouponType[] => {
  const stored = getFromStorage<CouponType[] | null>(STORAGE_KEY, null);
  if (stored && stored.length > 0) return stored;
  return mockCouponTypes;
};

export const useCouponTypeStore = create<CouponTypeState>((set, get) => ({
  couponTypes: initialCouponTypes(),

  addCouponType: (coupon) => {
    const newCoupon: CouponType = {
      ...coupon,
      id: generateId('ct'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    const newList = [...get().couponTypes, newCoupon];
    set({ couponTypes: newList });
    setToStorage(STORAGE_KEY, newList);
  },

  updateCouponType: (id, coupon) => {
    const newList = get().couponTypes.map((c) =>
      c.id === id ? { ...c, ...coupon } : c
    );
    set({ couponTypes: newList });
    setToStorage(STORAGE_KEY, newList);
  },

  deleteCouponType: (id) => {
    const newList = get().couponTypes.filter((c) => c.id !== id);
    set({ couponTypes: newList });
    setToStorage(STORAGE_KEY, newList);
  },

  getCouponTypeById: (id) => {
    return get().couponTypes.find((c) => c.id === id);
  },
}));

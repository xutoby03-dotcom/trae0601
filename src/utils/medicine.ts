import type { Medicine, MedicineStatus, MedicineCategory } from '@/types';
import { ESSENTIAL_CATEGORIES } from '@/types';

export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.round((d2.getTime() - d1.getTime()) / oneDay);
}

export function isExpiringSoon(expiryDate: string): boolean {
  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return new Date(expiryDate) < oneMonthLater;
}

export function getOpenExpiryDate(openDate: string, days: number): Date {
  return new Date(new Date(openDate).getTime() + days * 24 * 60 * 60 * 1000);
}

export function getMedicineStatus(medicine: Medicine): MedicineStatus {
  const now = new Date();
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  
  if (new Date(medicine.expiryDate) < now) {
    return { status: 'expired', label: '已过期', color: 'red' };
  }
  
  if (new Date(medicine.expiryDate) < oneMonthLater) {
    return { status: 'expiring', label: '临期', color: 'orange' };
  }
  
  if (medicine.openDate && medicine.openExpiryDays) {
    const openExpiryDate = getOpenExpiryDate(medicine.openDate, medicine.openExpiryDays);
    
    if (openExpiryDate < now) {
      return { status: 'open_expired', label: '开封已过期', color: 'red' };
    }
    
    if (openExpiryDate < oneMonthLater) {
      return { status: 'open_expiring', label: '开封临期', color: 'orange' };
    }
    
    return { status: 'opened', label: '已开封', color: 'blue' };
  }
  
  return { status: 'normal', label: '正常', color: 'green' };
}

export function getMissingCategories(medicines: Medicine[]): MedicineCategory[] {
  const existingCategories = new Set(medicines.map(m => m.category));
  return ESSENTIAL_CATEGORIES.filter(cat => !existingCategories.has(cat));
}

export function getDaysUntilExpiry(dateStr: string): number {
  return daysBetween(new Date(), new Date(dateStr));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export async function compressImage(file: File, maxSize: number = 800): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const DEFAULT_OPEN_EXPIRY_DAYS: Record<string, number> = {
  '滴眼液': 30,
  '眼药水': 30,
  '糖浆': 30,
  '口服液': 30,
  '软膏': 90,
  '乳膏': 90,
  '片剂': 180,
  '胶囊': 180,
  '颗粒': 180,
};

export function suggestOpenExpiryDays(specification: string): number {
  for (const [key, days] of Object.entries(DEFAULT_OPEN_EXPIRY_DAYS)) {
    if (specification.includes(key)) {
      return days;
    }
  }
  return 180;
}

import type { Seasoning } from '@/types';

export function getDaysRemaining(seasoning: Seasoning): number {
  const expiryDate = new Date(seasoning.openDate);
  expiryDate.setDate(expiryDate.getDate() + seasoning.shelfLifeDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiryDate.setHours(0, 0, 0, 0);
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getSeasoningStatus(seasoning: Seasoning): 'fresh' | 'soon' | 'expired' {
  const daysRemaining = getDaysRemaining(seasoning);
  if (daysRemaining <= 0) return 'expired';
  if (daysRemaining <= 7) return 'soon';
  return 'fresh';
}

export function needsRestock(seasoning: Seasoning): boolean {
  if (seasoning.initialAmount === 0) return false;
  const ratio = seasoning.currentAmount / seasoning.initialAmount;
  return ratio <= seasoning.restockThreshold;
}

export function getRemainingRatio(seasoning: Seasoning): number {
  if (seasoning.initialAmount === 0) return 0;
  return seasoning.currentAmount / seasoning.initialAmount;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayString(): string {
  return formatDate(new Date().toISOString());
}

export function compressImage(file: File, maxWidth = 400, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

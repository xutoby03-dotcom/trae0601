import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function getTimeDiffHours(iso: string): number {
  const created = new Date(iso).getTime();
  return (Date.now() - created) / (1000 * 60 * 60);
}

export function getTimeRemaining(iso: string, limitHours = 48): { expired: boolean; text: string } {
  const hours = getTimeDiffHours(iso);
  if (hours >= limitHours) {
    return { expired: true, text: `已超期 ${Math.floor(hours - limitHours)} 小时` };
  }
  const remaining = limitHours - hours;
  if (remaining < 1) {
    return { expired: false, text: `还剩 ${Math.floor(remaining * 60)} 分钟` };
  }
  return { expired: false, text: `还剩 ${Math.floor(remaining)} 小时` };
}

export const COURIER_OPTIONS = [
  '顺丰', '京东', '圆通', '中通', '申通', '韵达', '极兔', '德邦', '邮政', '其他',
] as const;

export const SIZE_OPTIONS: { value: 'S' | 'M' | 'L' | 'XL'; label: string }[] = [
  { value: 'S', label: '小号 S' },
  { value: 'M', label: '中号 M' },
  { value: 'L', label: '大号 L' },
  { value: 'XL', label: '特大号 XL' },
];

export const COMPANY_COLORS: Record<string, string> = {
  '顺丰': '#000000',
  '京东': '#e1251b',
  '圆通': '#84c146',
  '中通': '#005bac',
  '申通': '#ff5722',
  '韵达': '#005eb8',
  '极兔': '#ef4136',
  '德邦': '#da0000',
  '邮政': '#00753a',
  '其他': '#64748b',
};

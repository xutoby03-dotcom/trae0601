import { STATUS_OPTIONS, FIRE_EXIT_LOCATIONS } from './constants';
import type { StrollerStatus } from '@/types';

export function generateId(): string {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getStatusConfig(status: StrollerStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
}

export function getBadgeClass(status: StrollerStatus): string {
  return getStatusConfig(status).badge;
}

export function isFireExitLocation(location: string): boolean {
  return FIRE_EXIT_LOCATIONS.includes(location);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

export function formatDateTimeForInput(dateStr?: string): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

export function daysBetween(fromStr: string, toStr: string = new Date().toISOString()): number {
  const from = new Date(fromStr).getTime();
  const to = new Date(toStr).getTime();
  return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 30) return `${days}天前`;
  return formatDate(dateStr);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function sortStrollersByPriority<T extends { isFireExit: boolean; status: StrollerStatus; updatedAt: string }>(
  list: T[]
): T[] {
  const getPriority = (item: T): number => {
    if (item.isFireExit && item.status === 'blocking') return 0;
    if (item.isFireExit) return 1;
    if (item.status === 'blocking') return 2;
    if (item.status === 'pending') return 3;
    if (item.status === 'normal') return 4;
    return 5;
  };

  return [...list].sort((a, b) => {
    const prioA = getPriority(a);
    const prioB = getPriority(b);
    if (prioA !== prioB) return prioA - prioB;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}

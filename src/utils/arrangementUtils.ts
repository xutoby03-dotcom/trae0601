import { SnackAssignment, User } from '../types';

const SNACK_LIST = [
  { emoji: '🍿', name: '薯片' },
  { emoji: '🥤', name: '饮料' },
  { emoji: '🍰', name: '甜品' },
  { emoji: '🍓', name: '水果' },
];

export function getNextFriday(): Date {
  const now = new Date();
  const result = new Date(now);
  const dayOfWeek = now.getDay();
  const diff = (5 - dayOfWeek + 7) % 7 || 7;
  result.setDate(now.getDate() + diff);
  result.setHours(20, 0, 0, 0);
  return result;
}

export function formatDateTime(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d}T${h}:${min}`;
}

export function formatDisplayDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const w = weekdays[date.getDay()];
  const h = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${m}月${d}日 ${w} ${h}:${min}`;
}

export function assignSnacks(users: User[]): SnackAssignment[] {
  const shuffled = [...users].sort(() => Math.random() - 0.5);
  return SNACK_LIST.map((s, i) => {
    const owner = shuffled[i % shuffled.length];
    return {
      snack: `${s.emoji} ${s.name}`,
      owner: owner.name,
      ownerId: owner.id,
    };
  });
}

export function reassignSnack(
  currentSnacks: SnackAssignment[],
  snackIndex: number,
  users: User[]
): SnackAssignment[] {
  const availableUsers = users.filter(
    u => !currentSnacks.some((s, i) => i !== snackIndex && s.ownerId === u.id)
  );
  if (availableUsers.length === 0) return currentSnacks;
  const newOwner = availableUsers[Math.floor(Math.random() * availableUsers.length)];
  const result = [...currentSnacks];
  result[snackIndex] = { ...result[snackIndex], owner: newOwner.name, ownerId: newOwner.id };
  return result;
}

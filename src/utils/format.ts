import { format, parseISO } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'yyyy年MM月dd日', { locale: zhCN });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'MM月dd日 HH:mm', { locale: zhCN });
  } catch {
    return dateString;
  }
}

export function formatTime(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm');
  } catch {
    return dateString;
  }
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name.charAt(0).toUpperCase();
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-primary-100 text-primary-600',
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-pink-100 text-pink-600',
    'bg-amber-100 text-amber-600',
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function formatPhone(phone: string): string {
  if (!phone || phone.length < 11) return phone;
  return `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}`;
}

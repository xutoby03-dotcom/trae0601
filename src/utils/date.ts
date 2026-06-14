import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import type { Dayjs } from 'dayjs';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export type DateLike = string | Date | Dayjs | undefined | null;

const toDayjs = (date: DateLike): Dayjs | null => {
  if (!date) return null;
  return dayjs(date as any);
};

export const formatDate = (date: DateLike, format: string = 'YYYY-MM-DD'): string => {
  const d = toDayjs(date);
  if (!d || !d.isValid()) return '-';
  return d.format(format);
};

export const formatDateTime = (date: DateLike, format: string = 'YYYY-MM-DD HH:mm'): string => {
  const d = toDayjs(date);
  if (!d || !d.isValid()) return '-';
  return d.format(format);
};

export const formatTime = (date: DateLike, format: string = 'HH:mm'): string => {
  const d = toDayjs(date);
  if (!d || !d.isValid()) return '-';
  return d.format(format);
};

export const fromNow = (date: DateLike): string => {
  const d = toDayjs(date);
  if (!d || !d.isValid()) return '-';
  return d.fromNow();
};

export const isExpired = (date: DateLike): boolean => {
  const d = toDayjs(date);
  if (!d || !d.isValid()) return false;
  return d.isBefore(dayjs());
};

export { dayjs };
export default dayjs;

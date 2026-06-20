export function formatDuration(seconds: number): string {
  const absSeconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(absSeconds / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = absSeconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDurationChinese(seconds: number): string {
  const absSeconds = Math.max(0, Math.floor(seconds));
  const h = Math.floor(absSeconds / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = absSeconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}小时`);
  if (m > 0) parts.push(`${m}分`);
  if (s > 0 || parts.length === 0) parts.push(`${s}秒`);

  return parts.join('');
}

export function getTimeColor(remaining: number, total: number): string {
  if (total <= 0) return 'text-gray-500';

  const ratio = Math.max(0, Math.min(1, remaining / total));

  if (ratio > 0.6) return 'text-green-500';
  if (ratio > 0.35) return 'text-yellow-500';
  if (ratio > 0.15) return 'text-orange-500';
  return 'text-red-500';
}

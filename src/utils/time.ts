export function formatDateTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function relativeTime(ts: number): string {
  const now = Date.now();
  const diff = now - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return '刚刚';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}小时前`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}天前`;
  const mon = Math.floor(day / 30);
  if (mon < 12) return `${mon}个月前`;
  return `${Math.floor(mon / 12)}年前`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${Math.round(minutes)}分钟`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h < 24) return m > 0 ? `${h}小时${m}分` : `${h}小时`;
  const d = Math.floor(h / 24);
  const rh = h % 24;
  return rh > 0 ? `${d}天${rh}小时` : `${d}天`;
}

export function durationMinutes(start: number, end: number): number {
  return Math.max(0, (end - start) / 60000);
}

export function monthKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
}

export function todayEndOfDay(): number {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function daysAgoStart(n: number): number {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

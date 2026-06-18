export function formatTime(date: Date | string | undefined): string {
  if (!date) return "--:--";
  const d = typeof date === "string" ? new Date(date) : date;
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return "--";
  const d = typeof date === "string" ? new Date(date) : date;
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${month}/${day} ${formatTime(d)}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}小时${m}分钟` : `${h}小时`;
}

export function getWaitDuration(start: Date | string): string {
  const s = typeof start === "string" ? new Date(start) : start;
  const diff = Date.now() - s.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `等待 ${minutes} 分钟`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `等待 ${h}小时${m}分钟`;
}

export function getRemainingTime(target: Date | string): {
  text: string;
  isOverdue: boolean;
  minutes: number;
} {
  const t = typeof target === "string" ? new Date(target) : target;
  const diff = t.getTime() - Date.now();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 0) {
    const absMin = Math.abs(minutes);
    if (absMin < 60)
      return { text: `超时 ${absMin} 分钟`, isOverdue: true, minutes };
    const h = Math.floor(absMin / 60);
    const m = absMin % 60;
    return { text: `超时 ${h}小时${m}分钟`, isOverdue: true, minutes };
  }
  if (minutes < 60)
    return { text: `剩余 ${minutes} 分钟`, isOverdue: false, minutes };
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return { text: `剩余 ${h}小时${m}分钟`, isOverdue: false, minutes };
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

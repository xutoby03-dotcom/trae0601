export function formatDate(
  input: string | Date,
  pattern: string = "YYYY-MM-DD HH:mm"
): string {
  const date = typeof input === "string" ? new Date(input) : input;

  if (isNaN(date.getTime())) {
    return "";
  }

  const pad = (n: number, len: number = 2) => String(n).padStart(len, "0");

  const map: Record<string, string> = {
    YYYY: String(date.getFullYear()),
    MM: pad(date.getMonth() + 1),
    DD: pad(date.getDate()),
    HH: pad(date.getHours()),
    mm: pad(date.getMinutes()),
    ss: pad(date.getSeconds()),
  };

  return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, (match) => map[match]);
}

export function diffInDays(a: string | Date, b: string | Date): number {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;

  const msPerDay = 1000 * 60 * 60 * 24;
  const utc1 = Date.UTC(da.getFullYear(), da.getMonth(), da.getDate());
  const utc2 = Date.UTC(db.getFullYear(), db.getMonth(), db.getDate());

  return Math.round((utc1 - utc2) / msPerDay);
}

export function relativeTime(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return formatDate(date);
  }

  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(day / 365);

  if (sec < 60) return `${sec}秒前`;
  if (min < 60) return `${min}分钟前`;
  if (hour < 24) return `${hour}小时前`;
  if (day < 7) return `${day}天前`;
  if (day < 30) return `${Math.floor(day / 7)}周前`;
  if (month < 12) return `${month}个月前`;
  return `${year}年前`;
}

export function isToday(input: string | Date): boolean {
  return diffInDays(new Date(), input) === 0;
}

export function isYesterday(input: string | Date): boolean {
  return diffInDays(new Date(), input) === 1;
}

export function getStartOfMonth(input: string | Date): Date {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function getEndOfMonth(input: string | Date): Date {
  const d = typeof input === "string" ? new Date(input) : input;
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

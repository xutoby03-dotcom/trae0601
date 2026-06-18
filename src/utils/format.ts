export function formatDate(iso: string | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateTime(iso: string | undefined): string {
  if (!iso) return "-";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${h}:${mi}`;
}

export function formatRelative(iso: string | undefined): string {
  if (!iso) return "-";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  const hour = Math.floor(diff / 3600000);
  const day = Math.floor(diff / 86400000);
  if (diff < 0) return `${Math.abs(day)}天后`;
  if (min < 1) return "刚刚";
  if (min < 60) return `${min}分钟前`;
  if (hour < 24) return `${hour}小时前`;
  if (day < 30) return `${day}天前`;
  return formatDate(iso);
}

export function formatDuration(startIso: string, endIso?: string): string {
  const start = new Date(startIso).getTime();
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const diff = Math.max(0, end - start);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  if (days > 0) return `${days}天${remainHours}小时`;
  if (hours > 0) return `${hours}小时${mins}分`;
  return `${mins}分钟`;
}

export function calcDryingProgress(startIso: string): number {
  const hours = (Date.now() - new Date(startIso).getTime()) / 3600000;
  const target = 24;
  return Math.min(100, Math.round((hours / target) * 100));
}

export function formatCurrency(n: number | undefined): string {
  if (n === undefined) return "-";
  return `¥${n.toFixed(0)}`;
}

export function priorityLabel(p: 1 | 2 | 3): string {
  return ["", "高", "中", "低"][p] || "中";
}

export function priorityColor(p: 1 | 2 | 3): string {
  return ["", "text-red-600 bg-red-100", "text-amber-700 bg-amber-100", "text-forest-700 bg-forest-100"][p] || "";
}

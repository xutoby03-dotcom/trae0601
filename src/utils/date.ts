export const formatDateTime = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const getTimeRemaining = (expireIso: string): string => {
  const now = new Date().getTime();
  const exp = new Date(expireIso).getTime();
  const diff = exp - now;

  if (diff <= 0) return "已到期";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;

  if (days > 0) return `${days}天${remainHours}小时`;
  return `${hours}小时`;
};

export const getInputDateTimeLocal = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const nowDateTimeLocal = (): string => {
  return getInputDateTimeLocal(new Date().toISOString());
};

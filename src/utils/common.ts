export const generateId = (prefix = 'id'): string => {
  const radix = 36;
  const rnd = Math.random().toString(radix).slice(2, 10);
  const t = Date.now().toString(radix).slice(-6);
  return `${prefix}-${t}${rnd}`;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const formatDateTime = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const todayStr = (): string => new Date().toISOString().slice(0, 10);

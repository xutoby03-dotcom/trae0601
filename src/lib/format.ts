export const formatDateTime = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatDate = (iso?: string) => {
  if (!iso) return '-';
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const formatDuration = (input: string | number, end?: string) => {
  if (typeof input === 'number') {
    const min = input;
    if (min < 60) return `${min}分钟`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m ? `${h}小时${m}分钟` : `${h}小时`;
  }
  if (!end) return '进行中';
  const ms = new Date(end).getTime() - new Date(input).getTime();
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min}分钟`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}小时${m}分钟` : `${h}小时`;
};

export const formatWaitTime = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.max(0, Math.round(ms / 60000));
  if (min < 60) return `${min}分钟`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${m}m` : `${h}h`;
};

export const getWaitMinutes = (startTime: string | Date) => {
  const now = new Date().getTime();
  const start = new Date(startTime).getTime();
  return Math.floor((now - start) / 60000);
};

export const getWaitTimeColor = (minutes: number) => {
  if (minutes >= 120) return 'text-red-600';
  if (minutes >= 60) return 'text-orange-600';
  if (minutes >= 30) return 'text-yellow-600';
  return 'text-green-600';
};

export const getStockProgressColor = (percent: number) => {
  if (percent <= 30) return 'bg-red-500';
  if (percent <= 60) return 'bg-orange-500';
  return 'bg-green-500';
};

export const getStockTextColor = (percent: number) => {
  if (percent <= 30) return 'text-red-600';
  if (percent <= 60) return 'text-orange-600';
  return 'text-green-600';
};

export const getTodayDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

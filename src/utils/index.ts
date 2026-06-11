export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateDisplay = (dateStr: string): string => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}年${month}月${day}日`;
};

export const getTodayStr = (): string => {
  return formatDate(new Date().toISOString());
};

export const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const speciesLabel: Record<string, string> = {
  dog: '狗狗',
  cat: '猫咪',
  other: '其他',
};

export const statusLabel: Record<string, string> = {
  pending: '待开始',
  active: '进行中',
  completed: '已结束',
};

export const statusColor: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-slate-100 text-slate-600',
};

export const checkInItemTypeLabel: Record<string, string> = {
  feeding: '喂食',
  medication: '喂药',
  walking: '遛弯',
  other: '其他',
};

export const checkInItemTypeIcon: Record<string, string> = {
  feeding: '🍚',
  medication: '💊',
  walking: '🐾',
  other: '📝',
};

export const handleFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

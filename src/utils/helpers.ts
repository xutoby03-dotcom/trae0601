export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (dateStr === todayStr) return '今天';
  if (dateStr === tomorrowStr) return '明天';

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[date.getDay()];

  return `${month}月${day}日 ${weekday}`;
};

export const formatTime = (isoStr: string): string => {
  const date = new Date(isoStr);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export const formatDateTime = (isoStr: string): string => {
  const date = new Date(isoStr);
  return `${formatDate(isoStr.split('T')[0])} ${formatTime(isoStr)}`;
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending': '待执行',
    'in-progress': '进行中',
    'completed': '已完成',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    'pending': 'bg-gray-100 text-gray-600',
    'in-progress': 'bg-orange-100 text-orange-600',
    'completed': 'bg-green-100 text-green-600',
  };
  return colors[status] || 'bg-gray-100 text-gray-600';
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const cn = (...args: (string | false | null | undefined)[]): string => {
  return args.filter(Boolean).join(' ');
};

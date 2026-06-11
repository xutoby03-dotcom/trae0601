export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRiskLevelText = (level: string): string => {
  const map: Record<string, string> = {
    low: '低风险',
    medium: '中风险',
    high: '高风险',
    critical: '极高风险',
  };
  return map[level] || level;
};

export const getRiskLevelColor = (level: string): string => {
  const map: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-100 text-amber-700 border-amber-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    critical: 'bg-red-100 text-red-700 border-red-200',
  };
  return map[level] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getExceptionStatusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待分派',
    assigned: '已分派',
    processing: '处理中',
    resolved: '已解决',
  };
  return map[status] || status;
};

export const getExceptionStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-red-100 text-red-700 border-red-200',
    assigned: 'bg-blue-100 text-blue-700 border-blue-200',
    processing: 'bg-amber-100 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getAssigneeTypeText = (type: string): string => {
  const map: Record<string, string> = {
    maintenance: '物业维修',
    security: '安保复查',
  };
  return map[type] || type;
};

export const calcMinutesDiff = (time1: string, time2: string): number => {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  return Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
};

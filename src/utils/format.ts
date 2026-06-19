export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateTimeString: string): string => {
  const date = new Date(dateTimeString);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (num: number): string => {
  return num.toLocaleString('zh-CN');
};

export const formatPercent = (num: number): string => {
  return `${num.toFixed(1)}%`;
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    normal: 'bg-success-100 text-success-600',
    pending_review: 'bg-warning-100 text-warning-600',
    off_shelf: 'bg-danger-100 text-danger-600',
    scrapped: 'bg-gray-100 text-gray-600',
    pending: 'bg-warning-100 text-warning-600',
    processing: 'bg-primary-100 text-primary-600',
    completed: 'bg-success-100 text-success-600',
    qualified: 'bg-success-100 text-success-600',
    unqualified: 'bg-danger-100 text-danger-600',
    minor: 'bg-success-100 text-success-600',
    moderate: 'bg-warning-100 text-warning-600',
    severe: 'bg-danger-100 text-danger-600',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-600';
};

export const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};

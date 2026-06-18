export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateShort = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatWeight = (kg: number): string => {
  return `${kg.toFixed(1)} kg`;
};

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

export const formatPhone = (phone: string): string => {
  return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1****$3');
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    normal: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    full: 'bg-orange-100 text-orange-800',
    exception: 'bg-red-100 text-red-800',
    pending: 'bg-gray-100 text-gray-800',
    sorting: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    handling: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status: string): string => {
  const texts: Record<string, string> = {
    normal: '正常',
    warning: '容量预警',
    full: '满箱',
    exception: '异常',
    pending: '待分拣',
    sorting: '分拣中',
    completed: '已完成',
    handling: '处理中',
    resolved: '已解决',
    scheduled: '待清运',
  };
  return texts[status] || status;
};

export const getCategoryText = (category: string): string => {
  const texts: Record<string, string> = {
    donatable: '可捐赠',
    recyclable: '可再生',
    damaged: '破损报废',
    needs_cleaning: '需清洗',
  };
  return texts[category] || category;
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    donatable: 'bg-emerald-500',
    recyclable: 'bg-blue-500',
    damaged: 'bg-red-500',
    needs_cleaning: 'bg-yellow-500',
  };
  return colors[category] || 'bg-gray-500';
};

export const getExceptionTypeText = (type: string): string => {
  const texts: Record<string, string> = {
    full: '满箱',
    moisture: '潮湿',
    odor: '异味',
    damage: '损坏',
  };
  return texts[type] || type;
};

export const getSeverityText = (severity: string): string => {
  const texts: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急',
  };
  return texts[severity] || severity;
};

export const getSeverityColor = (severity: string): string => {
  const colors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };
  return colors[severity] || 'bg-gray-100 text-gray-800';
};

import { Material, Delivery, AfterSale, MaterialStatus } from '@/types';

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const getDaysDiff = (dateStr1: string, dateStr2: string): number => {
  const date1 = new Date(dateStr1);
  const date2 = new Date(dateStr2);
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isDelayed = (expectedDate: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedDate);
  expected.setHours(0, 0, 0, 0);
  return expected < today;
};

export const getDelayDays = (expectedDate: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedDate);
  expected.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - expected.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculateReceivedQuantity = (
  materialId: string,
  deliveries: Delivery[]
): number => {
  return deliveries
    .filter((d) => d.materialId === materialId)
    .reduce((sum, d) => sum + d.receivedQuantity, 0);
};

export const calculateDamagedQuantity = (
  materialId: string,
  deliveries: Delivery[]
): number => {
  return deliveries
    .filter((d) => d.materialId === materialId)
    .reduce((sum, d) => sum + d.damagedQuantity, 0);
};

export const getMaterialStatus = (
  material: Material,
  deliveries: Delivery[]
): MaterialStatus => {
  const received = calculateReceivedQuantity(material.id, deliveries);
  
  if (received >= material.orderQuantity) {
    return 'complete';
  }
  
  if (received > 0) {
    return 'partial';
  }
  
  if (isDelayed(material.expectedDate)) {
    return 'delayed';
  }
  
  return 'pending';
};

export const getStatusText = (status: MaterialStatus): string => {
  const statusMap: Record<MaterialStatus, string> = {
    pending: '待到货',
    partial: '部分到货',
    complete: '已齐套',
    delayed: '已延期',
  };
  return statusMap[status];
};

export const getStatusColor = (status: MaterialStatus): string => {
  const colorMap: Record<MaterialStatus, string> = {
    pending: 'bg-gray-100 text-gray-600',
    partial: 'bg-amber-100 text-amber-700',
    complete: 'bg-emerald-100 text-emerald-700',
    delayed: 'bg-red-100 text-red-700',
  };
  return colorMap[status];
};

export const getAfterSaleTypeText = (type: string): string => {
  const typeMap: Record<string, string> = {
    missing: '缺件',
    wrong: '错发',
    damaged: '破损',
  };
  return typeMap[type] || type;
};

export const getAfterSaleSeverityText = (severity: string): string => {
  const severityMap: Record<string, string> = {
    low: '轻微',
    medium: '中等',
    high: '严重',
  };
  return severityMap[severity] || severity;
};

export const getAfterSaleStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
  };
  return statusMap[status] || status;
};

export const getAfterSaleStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'bg-red-100 text-red-700',
    processing: 'bg-amber-100 text-amber-700',
    resolved: 'bg-emerald-100 text-emerald-700',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-600';
};

export const getAfterSaleTypeColor = (type: string): string => {
  const colorMap: Record<string, string> = {
    missing: 'bg-blue-100 text-blue-700',
    wrong: 'bg-purple-100 text-purple-700',
    damaged: 'bg-red-100 text-red-700',
  };
  return colorMap[type] || 'bg-gray-100 text-gray-600';
};

export const getSeverityColor = (severity: string): string => {
  const colorMap: Record<string, string> = {
    low: 'bg-emerald-100 text-emerald-700',
    medium: 'bg-amber-100 text-amber-700',
    high: 'bg-red-100 text-red-700',
  };
  return colorMap[severity] || 'bg-gray-100 text-gray-600';
};

export const defaultRooms = [
  '客厅',
  '主卧',
  '次卧',
  '厨房',
  '卫生间',
  '阳台',
  '玄关',
  '书房',
];

export const defaultCategories = [
  '瓷砖',
  '灯具',
  '五金',
  '板材',
  '涂料',
  '卫浴',
  '门窗',
  '其他',
];

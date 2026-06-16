import type { FeelLevel, ProblemType, ProductionStatus } from '../types';

export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function getFeelColor(level: FeelLevel): string {
  switch (level) {
    case 1:
      return 'text-red-600 bg-red-50 border-red-200';
    case 2:
      return 'text-green-600 bg-green-50 border-green-200';
    case 3:
      return 'text-orange-600 bg-orange-50 border-orange-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getProblemTypeColor(type: ProblemType): string {
  switch (type) {
    case 'pattern':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'fabric':
      return 'text-purple-600 bg-purple-50 border-purple-200';
    case 'workmanship':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'comfort':
      return 'text-rose-600 bg-rose-50 border-rose-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getProductionStatusLabel(status: ProductionStatus): string {
  switch (status) {
    case 'pending':
      return '待审核';
    case 'approved':
      return '已通过';
    case 'rejected':
      return '已驳回';
    default:
      return status;
  }
}

export function getProductionStatusColor(status: ProductionStatus): string {
  switch (status) {
    case 'pending':
      return 'text-yellow-700 bg-yellow-50 border-yellow-300';
    case 'approved':
      return 'text-green-700 bg-green-50 border-green-300';
    case 'rejected':
      return 'text-red-700 bg-red-50 border-red-300';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

import { format, formatDistanceToNow, differenceInHours } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { StarterStatus, StorageType, AnomalyType, OdorDescription } from '@/types';

export function formatDateTime(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'yyyy-MM-dd', { locale: zhCN });
}

export function formatTimeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { locale: zhCN, addSuffix: true });
}

export function formatHourDiff(date1: string, date2: string): string {
  const hours = differenceInHours(new Date(date1), new Date(date2));
  return `${hours}小时`;
}

export function getStatusLabel(status: StarterStatus): string {
  const labels: Record<StarterStatus, string> = {
    [StarterStatus.HEALTHY]: '合格',
    [StarterStatus.LOCKED]: '锁定',
    [StarterStatus.COLD]: '冷藏',
    [StarterStatus.ARCHIVED]: '已归档'
  };
  return labels[status];
}

export function getStatusColor(status: StarterStatus): string {
  const colors: Record<StarterStatus, string> = {
    [StarterStatus.HEALTHY]: '#52C41A',
    [StarterStatus.LOCKED]: '#F5222D',
    [StarterStatus.COLD]: '#1890FF',
    [StarterStatus.ARCHIVED]: '#8C8C8C'
  };
  return colors[status];
}

export function getStorageLabel(type: StorageType): string {
  const labels: Record<StorageType, string> = {
    [StorageType.ROOM_TEMP]: '常温',
    [StorageType.REFRIGERATED]: '冷藏'
  };
  return labels[type];
}

export function getAnomalyLabel(type: AnomalyType): string {
  const labels: Record<AnomalyType, string> = {
    [AnomalyType.COLLAPSE]: '塌陷',
    [AnomalyType.ODOR]: '异味',
    [AnomalyType.MOLD]: '发霉'
  };
  return labels[type];
}

export function getAnomalyColor(type: AnomalyType): string {
  const colors: Record<AnomalyType, string> = {
    [AnomalyType.COLLAPSE]: '#FA8C16',
    [AnomalyType.ODOR]: '#F5222D',
    [AnomalyType.MOLD]: '#722ED1'
  };
  return colors[type];
}

export function getOdorLabel(odor: OdorDescription): string {
  const labels: Record<OdorDescription, string> = {
    fruity: '果香',
    vinegar: '醋酸',
    alcohol: '酒精',
    bready: '面包香',
    putrid: '腐臭',
    cheesy: '奶酪'
  };
  return labels[odor];
}

export function getWaterRatioDisplay(ratio: number): string {
  return `${ratio}:1`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

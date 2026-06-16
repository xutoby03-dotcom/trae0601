import { Droplets, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import StatusBadge from './StatusBadge';
import type { WashingPool } from '../types';

const statusIconColors: Record<string, string> = {
  IDLE: 'text-green-500 bg-green-50',
  OCCUPIED: 'text-red-500 bg-red-50',
  CLEANING_PENDING: 'text-orange-500 bg-orange-50',
  PAUSED: 'text-gray-500 bg-gray-50',
  MAINTENANCE: 'text-purple-500 bg-purple-50',
};

interface PoolCardProps {
  pool: WashingPool;
  onClick?: () => void;
}

function formatLastCleaned(date?: Date): string {
  if (!date) return '暂无记录';
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return '刚刚';
}

export default function PoolCard({ pool, onClick }: PoolCardProps) {
  const iconColorClass = statusIconColors[pool.status] || statusIconColors.IDLE;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-sm transition-all duration-300',
        'hover:shadow-lg hover:-translate-y-1 hover:border-primary-200',
        onClick && 'cursor-pointer',
      )}
    >
      <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br from-primary-50 to-transparent opacity-50 transition-opacity duration-300 group-hover:opacity-80" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110', iconColorClass)}>
            <Droplets className="h-6 w-6" />
          </div>
          <StatusBadge status={pool.status} />
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover:text-primary-600">
            {pool.name}
          </h3>
          <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            <span>{pool.location}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1 border-t border-gray-100 pt-3 text-xs text-gray-400">
          <Clock className="h-3.5 w-3.5" />
          <span>最后清洁：{formatLastCleaned(pool.lastCleanedAt)}</span>
        </div>
      </div>
    </div>
  );
}

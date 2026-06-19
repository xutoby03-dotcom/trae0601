import { Droplets, Users, MapPin, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pitcher } from '../types';
import { useStore } from '../store/useStore';
import { ProgressBar } from './ProgressBar';
import {
  getFilterStatus,
  getStatusLabel,
  getStatusColor,
} from '../utils/calculations';
import { cn } from '../lib/utils';

interface PitcherCardProps {
  pitcher: Pitcher;
  className?: string;
}

export function PitcherCard({ pitcher, className }: PitcherCardProps) {
  const navigate = useNavigate();
  const getFilterLifePercent = useStore((state) => state.getFilterLifePercent);
  const getFilterDaysLeft = useStore((state) => state.getFilterDaysLeft);
  const getStock = useStore((state) => state.getStock);
  const getUnresolvedAlerts = useStore((state) => state.getUnresolvedAlerts);

  const lifePercent = getFilterLifePercent(pitcher.id);
  const daysLeft = getFilterDaysLeft(pitcher.id);
  const status = getFilterStatus(lifePercent);
  const stock = getStock(pitcher.filterModel);
  const alerts = getUnresolvedAlerts().filter((a) => a.pitcherId === pitcher.id);
  const isStockZeroAndExpired = status === 'expired' && stock === 0;

  const handleClick = () => {
    navigate(`/pitchers/${pitcher.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100',
        'transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        isStockZeroAndExpired && 'ring-2 ring-red-400',
        className
      )}
    >
      <div className="relative h-40 bg-gradient-to-br from-sky-50 to-blue-100 overflow-hidden">
        <img
          src={pitcher.photo}
          alt={pitcher.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <span
            className={cn(
              'px-2.5 py-1 rounded-full text-xs font-semibold',
              isStockZeroAndExpired
                ? 'bg-red-500 text-white'
                : status === 'warning'
                ? 'bg-amber-500 text-white'
                : status === 'expired'
                ? 'bg-red-500 text-white'
                : 'bg-emerald-500 text-white'
            )}
          >
            {isStockZeroAndExpired ? '急需换芯' : getStatusLabel(status)}
          </span>
        </div>
        {alerts.length > 0 && (
          <div className="absolute top-3 left-3">
            <div className="w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {alerts.length}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-gray-800 text-lg">{pitcher.name}</h3>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <Droplets className="w-4 h-4" />
            {pitcher.capacity}L
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {pitcher.userCount}人
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {pitcher.location}
          </span>
        </div>

        <ProgressBar
          percent={lifePercent}
          status={status}
          showLabel={false}
          height="h-2"
        />

        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-gray-500">
            剩余 <span className={cn('font-semibold', getStatusColor(status))}>{daysLeft}天</span>
          </span>
          <span className={cn('font-medium',
            stock === 0 ? 'text-red-600' : stock <= 1 ? 'text-amber-600' : 'text-emerald-600'
          )}>
            库存 {stock} 个
          </span>
        </div>

        {isStockZeroAndExpired && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <span className="text-xs text-red-600 font-medium">
              滤芯已过期且库存为零，请立即购买！
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

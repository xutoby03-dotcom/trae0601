import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Clock, AlertTriangle, ChefHat, Package } from 'lucide-react';
import type { Pot } from '../types';
import { SoupLevelGauge } from './ui';
import { StatusBadge, LevelBadge } from './badges';
import { usePotStore } from '../store/usePotStore';
import { cn } from '../lib/utils';

interface PotCardProps {
  pot: Pot;
}

export default function PotCard({ pot }: PotCardProps) {
  const navigate = useNavigate();
  const { getMonthlySpiceMap, pots } = usePotStore();
  const monthlySpiceMap = useMemo(() => getMonthlySpiceMap(), [pots]);
  const monthlySpiceCount = monthlySpiceMap[pot.id] || 0;

  const isDanger = pot.status === 'danger';
  const isWarning = pot.status === 'warning';

  return (
    <div
      className={cn(
        'bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer group',
        isDanger && 'border-red-300 ring-2 ring-red-100',
        isWarning && 'border-amber-300',
        !isDanger && !isWarning && 'border-stone-200'
      )}
      onClick={() => navigate(`/pot/${pot.id}`)}
    >
      <div
        className={cn(
          'px-4 py-3 flex items-center justify-between',
          isDanger && 'bg-gradient-to-r from-red-600 to-red-500',
          isWarning && 'bg-gradient-to-r from-amber-500 to-amber-400',
          !isDanger && !isWarning && 'bg-gradient-to-r from-braised-red-700 to-braised-red-600'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">{pot.name.replace('号卤锅', '')}</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{pot.name}</h3>
            <p className="text-white/80 text-xs">
              连续使用 <span className="font-mono">{pot.continuousUseHours}h</span>
            </p>
          </div>
        </div>
        <StatusBadge status={pot.status} size="sm" />
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <SoupLevelGauge level={pot.soupLevel} size={90} strokeWidth={8} />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 w-10">盐度</span>
              <LevelBadge level={pot.salinity} type="salinity" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 w-10">汤色</span>
              <LevelBadge level={pot.color} type="color" />
            </div>
            {pot.needSkim && (
              <div className="flex items-center gap-1.5 text-amber-600">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">需撇油</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1.5">
              <ChefHat className="w-3.5 h-3.5" />
              <span>今日卤过</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {pot.todayItems.map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 bg-braised-red-50 text-braised-red-700 text-xs rounded-full font-medium"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1 text-stone-500 text-xs">
              <Package className="w-3.5 h-3.5" />
              <span>本月香料 {monthlySpiceCount} 包</span>
            </div>
            <div className="flex items-center gap-1 text-stone-500 text-xs">
              <Clock className="w-3.5 h-3.5" />
              <span>{pot.productionBatches.length} 批出品</span>
            </div>
          </div>
        </div>
      </div>

      {isDanger && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-red-600 text-xs">
            {pot.soupLevel < 30 && '液位过低 '}
            {pot.continuousUseHours >= 72 && '连续使用超时 '}
            {pot.complaints.filter(c => {
              const t = new Date(c.timestamp).getTime();
              return Date.now() - t < 24 * 60 * 60 * 1000;
            }).length >= 2 && '客诉集中'}
          </span>
        </div>
      )}
    </div>
  );
}

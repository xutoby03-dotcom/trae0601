import { useState, useEffect } from 'react';
import { Clock, MapPin, Thermometer, Package } from 'lucide-react';
import type { Batch, Equipment } from '@/types';
import { getRemainingTime, isWithinNextHours } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface UpcomingBatchesProps {
  batches: Batch[];
  equipments: Equipment[];
}

export default function UpcomingBatches({ batches, equipments }: UpcomingBatchesProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getEquipment = (equipmentId: string) =>
    equipments.find((eq) => eq.id === equipmentId);

  const upcomingBatches = batches
    .filter((batch) => batch.status === 'fermenting' && isWithinNextHours(batch.expectOutTime, 2))
    .sort((a, b) => {
      const timeA = getRemainingTime(a.expectOutTime).totalMinutes;
      const timeB = getRemainingTime(b.expectOutTime).totalMinutes;
      return timeA - timeB;
    });

  if (upcomingBatches.length === 0) {
    return (
      <div className="card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
        <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
          即将出箱
          <span className="ml-2 text-xs text-gray-400 font-normal">2小时内</span>
        </h3>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-600 font-medium">暂无即将出箱的批次</p>
          <p className="text-sm text-gray-400 mt-1">所有批次还在发酵中</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">
        即将出箱
        <span className="ml-2 text-xs text-gray-400 font-normal">2小时内</span>
        <span className="ml-2 px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">
          {upcomingBatches.length}
        </span>
      </h3>

      <div className="space-y-3">
        {upcomingBatches.map((batch, index) => {
          const equipment = getEquipment(batch.equipmentId);
          const remaining = getRemainingTime(batch.expectOutTime);
          const isUrgent = remaining.totalMinutes < 30;

          return (
            <div
              key={batch.id}
              className={cn(
                'rounded-lg p-4 border transition-all duration-300 animate-stagger animate-fadeInUp',
                isUrgent
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-gray-50 border-gray-100 hover:border-gray-200'
              )}
              style={{ '--stagger': index } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-display font-semibold text-gray-900">
                      {batch.recipe}
                    </h4>
                    {isUrgent && (
                      <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full animate-pulse">
                        即将完成
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{equipment?.code || batch.equipmentId}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>第 {batch.layer} 层</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Thermometer className="w-3.5 h-3.5" />
                      <span>{batch.weight}kg</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-gray-400 text-xs mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>剩余时间</span>
                  </div>
                  <div
                    className={cn(
                      'font-mono font-bold tracking-tight',
                      isUrgent ? 'text-primary-600 text-4xl' : 'text-gray-700 text-3xl'
                    )}
                  >
                    {String(remaining.hours).padStart(2, '0')}:
                    {String(remaining.minutes).padStart(2, '0')}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">时:分</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-1000',
                      isUrgent ? 'bg-primary-500' : 'bg-primary-400'
                    )}
                    style={{
                      width: `${Math.min(100, Math.max(0, 100 - (remaining.totalMinutes / 120) * 100))}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

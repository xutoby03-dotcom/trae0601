import { useState, useEffect } from 'react';
import { Thermometer, Clock, MapPin, AlertTriangle } from 'lucide-react';
import type { Batch, Equipment, AbnormalLog } from '@/types';
import { formatDateTime, getRemainingTime } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';
import StatusBadge from '@/components/common/StatusBadge';

interface BatchCardProps {
  batch: Batch;
  equipment?: Equipment;
  abnormalLogs?: AbnormalLog[];
  stagger?: number;
}

export default function BatchCard({ batch, equipment, abnormalLogs, stagger = 0 }: BatchCardProps) {
  const [remaining, setRemaining] = useState(getRemainingTime(batch.expectOutTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(getRemainingTime(batch.expectOutTime));
    }, 1000);
    return () => clearInterval(timer);
  }, [batch.expectOutTime]);

  const hasAbnormal = abnormalLogs?.some(
    (log) => log.batchIds.includes(batch.id) && log.status === 'pending'
  );

  return (
    <div
      className={cn(
        'card relative overflow-hidden animate-fadeInUp animate-stagger',
        hasAbnormal && 'border-2 border-status-danger animate-pulseRed'
      )}
      style={{ '--stagger': stagger } as React.CSSProperties}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-gray-900">{batch.recipe}</h3>
          <p className="text-sm text-gray-500">{equipment?.code || '未知设备'}</p>
        </div>
        <StatusBadge status={hasAbnormal ? 'abnormal' : batch.status}>
          {hasAbnormal && <AlertTriangle className="w-3 h-3 mr-1" />}
          {hasAbnormal ? '温度异常' : undefined}
        </StatusBadge>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-cold-500" />
          <div>
            <p className="data-label">重量</p>
            <p className="font-mono font-medium">{batch.weight}kg</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-cold-500" />
          <div>
            <p className="data-label">目标温度</p>
            <p className="font-mono font-medium">{batch.targetTemp}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="data-label">入箱时间</p>
            <p className="text-sm font-medium">{formatDateTime(batch.inTime)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <div>
            <p className="data-label">预计出箱</p>
            <p className="text-sm font-medium">{formatDateTime(batch.expectOutTime)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <div>
            <p className="data-label">所在层</p>
            <p className="font-mono font-medium">第 {batch.layer} 层</p>
          </div>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <p className="data-label">剩余发酵时间</p>
          <div className="font-mono text-2xl font-bold text-primary-600">
            {String(remaining.hours).padStart(2, '0')}:{String(remaining.minutes).padStart(2, '0')}
            <span className="text-sm font-normal text-gray-500 ml-1">时:分</span>
          </div>
        </div>
      </div>
    </div>
  );
}

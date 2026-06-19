import { Battery, MapPin, Calendar } from 'lucide-react';
import { useAppStore } from '@/store';
import { getBatteryLifeMonths } from '@/constants';
import { formatDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface BatteryItem {
  id: string;
  location: string;
  model: string;
  days: number;
  level: 'ok' | 'warning' | 'danger';
  nextDate: string;
  progressPercent: number;
}

export default function BatteryReminder() {
  const { devices, getBatteryStatus } = useAppStore();

  const batteryList: BatteryItem[] = devices.map((device) => {
    const status = getBatteryStatus(device);
    const lifeDays = getBatteryLifeMonths(device.battery_type) * 30;
    const usedDays = Math.max(0, lifeDays - status.days);
    const progressPercent = Math.min(100, Math.max(0, (usedDays / lifeDays) * 100));

    return {
      id: device.id,
      location: device.location,
      model: device.model,
      days: status.days,
      level: status.level,
      nextDate: status.nextDate,
      progressPercent,
    };
  });

  const sortedList = batteryList
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const levelColors = {
    ok: {
      text: 'text-success-600',
      bg: 'bg-success-500',
      track: 'bg-success-100',
      chip: 'bg-success-50 text-success-600',
    },
    warning: {
      text: 'text-warning-600',
      bg: 'bg-warning-500',
      track: 'bg-warning-100',
      chip: 'bg-warning-50 text-warning-600',
    },
    danger: {
      text: 'text-danger-600',
      bg: 'bg-danger-500',
      track: 'bg-danger-100',
      chip: 'bg-danger-50 text-danger-600',
    },
  };

  return (
    <div className="card p-5 animate-fade-in-up delay-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title">
          <Battery className="w-5 h-5 text-warning-500" />
          电池更换提醒
        </h3>
      </div>

      {sortedList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-gray-400">暂无设备数据</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedList.map((item, index) => {
            const colors = levelColors[item.level];

            return (
              <div
                key={item.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${(index + 1) * 75}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.location}</p>
                      <p className="text-xs text-gray-400 truncate">{item.model}</p>
                    </div>
                  </div>
                  <span className={cn('tag text-xs shrink-0 ml-2', colors.chip)}>
                    {item.days > 0 ? `${item.days}天` : '已过期'}
                  </span>
                </div>

                <div className="ml-5.5">
                  <div className={cn('h-2 rounded-full overflow-hidden', colors.track)}>
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-700',
                        colors.bg,
                        item.level === 'danger' && 'animate-pulse-slow',
                      )}
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className={cn('font-medium', colors.text)}>
                      {item.days > 0 ? '剩余天数' : '请尽快更换'}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar className="w-3 h-3" />
                      {formatDate(item.nextDate)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

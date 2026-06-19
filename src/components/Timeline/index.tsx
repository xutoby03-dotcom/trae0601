import { CloudRain, CheckCircle2, Clock } from 'lucide-react';
import { formatDate } from '../../utils/date';
import type { RainEvent } from '../../types';
import StatusBadge from '../StatusBadge';

interface TimelineProps {
  events: RainEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-[22px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary-300 via-primary-200 to-transparent" />

      <div className="space-y-4">
        {sortedEvents.map((event, index) => (
          <div key={event.id} className="relative flex gap-4 animate-slide-up" style={{ animationDelay: `${index * 80}ms` }}>
            <div
              className={`relative z-10 w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-transform hover:scale-110 ${
                event.allChecked
                  ? 'bg-gradient-to-br from-success-400 to-success-600'
                  : 'bg-gradient-to-br from-primary-400 to-primary-600'
              }`}
            >
              {event.allChecked ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <CloudRain className="w-5 h-5 text-white" />
              )}
            </div>

            <div className="flex-1 bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg text-gray-800">
                    {formatDate(event.date)}
                  </span>
                  <StatusBadge type="rain" value={event.intensity} />
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.duration}</span>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                {event.allChecked ? (
                  <span className="text-sm text-success-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    所有区域已检查
                  </span>
                ) : (
                  <span className="text-sm text-warning-600 font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    待完成检查
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import type { Reminder, ReminderType } from '@/types';
import { Card } from '@/components/ui';
import { useReminderStore } from '@/stores/useReminderStore';
import { CloudRain, Clock, AlertCircle, MessageSquare, Bell, Check } from 'lucide-react';
import { formatRelative } from '@/utils/date';
import { cn } from '@/utils/cn';

interface ReminderCardProps {
  reminder: Reminder;
  onClick?: () => void;
}

const typeConfig: Record<ReminderType, { icon: typeof CloudRain; label: string; color: string }> = {
  weather: {
    icon: CloudRain,
    label: '天气预警',
    color: 'bg-danger/10 text-danger',
  },
  timer: {
    icon: Clock,
    label: '定时提醒',
    color: 'bg-warning/10 text-warning',
  },
  patrol: {
    icon: AlertCircle,
    label: '巡查提醒',
    color: 'bg-info/10 text-info',
  },
  custom: {
    icon: MessageSquare,
    label: '自定义',
    color: 'bg-secondary/10 text-secondary-500',
  },
};

export default function ReminderCard({ reminder, onClick }: ReminderCardProps) {
  const { markAsRead, loading } = useReminderStore();
  const config = typeConfig[reminder.type];
  const Icon = config.icon;

  const handleMarkAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!reminder.isRead) {
      await markAsRead(reminder.id);
    }
  };

  return (
    <Card
      className={cn(
        'cursor-pointer p-4 transition-all duration-200 hover:shadow-md',
        !reminder.isRead && 'border-primary-300 bg-primary-50/30'
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
          config.color
        )}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                'text-xs font-medium',
                config.color.replace('bg-', 'text-').replace('/10', '')
              )}>
                {config.label}
              </span>
              {!reminder.isRead && (
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
                </span>
              )}
            </div>
            <span className="flex-shrink-0 text-xs text-gray-400">
              {formatRelative(reminder.triggerTime)}
            </span>
          </div>
          <h4 className={cn(
            'mt-1 font-medium',
            !reminder.isRead ? 'text-gray-900' : 'text-gray-600'
          )}>
            {reminder.title}
          </h4>
          <p className={cn(
            'mt-1 line-clamp-2 text-sm',
            !reminder.isRead ? 'text-gray-600' : 'text-gray-400'
          )}>
            {reminder.content}
          </p>
        </div>
        {!reminder.isRead && (
          <button
            onClick={handleMarkAsRead}
            disabled={loading}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            title="标记为已读"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}

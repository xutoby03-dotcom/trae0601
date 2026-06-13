import { AlertTriangle, Bell, CheckCircle2 } from 'lucide-react';
import { Reminder } from '../types';
import { formatDateDisplay } from '../utils/dateUtils';

interface ReminderCardProps {
  reminders: Reminder[];
  urgency: 'urgent' | 'warning' | 'normal';
  title: string;
}

const urgencyConfig = {
  urgent: {
    borderColor: 'border-danger-500',
    bgColor: 'bg-danger-50',
    icon: AlertTriangle,
    iconColor: 'text-danger-500',
    badgeClass: 'badge-danger',
  },
  warning: {
    borderColor: 'border-warning-500',
    bgColor: 'bg-warning-50',
    icon: Bell,
    iconColor: 'text-warning-500',
    badgeClass: 'badge-warning',
  },
  normal: {
    borderColor: 'border-success-500',
    bgColor: 'bg-success-50',
    icon: CheckCircle2,
    iconColor: 'text-success-500',
    badgeClass: 'badge-success',
  },
};

export default function ReminderCard({ reminders, urgency, title }: ReminderCardProps) {
  const config = urgencyConfig[urgency];
  const Icon = config.icon;

  if (reminders.length === 0) {
    return (
      <div className={`card-border ${config.borderColor} ${config.bgColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-xl ${config.iconColor} bg-white`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <span className={`ml-auto ${config.badgeClass}`}>0</span>
        </div>
        <p className="text-sm text-gray-500 text-center py-4">暂无{title === '紧急' ? '紧急' : title === '临期' ? '临期' : ''}提醒</p>
      </div>
    );
  }

  return (
    <div className={`card-border ${config.borderColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-xl ${config.iconColor} ${config.bgColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className={`ml-auto ${config.badgeClass}`}>{reminders.length}</span>
      </div>
      <div className="space-y-3">
        {reminders.map((reminder) => (
          <div
            key={reminder.deviceId}
            className="p-3 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{reminder.location}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  型号：{reminder.filterModel}
                </p>
              </div>
              <div className="text-right ml-3">
                <p className={`font-bold ${reminder.remainingDays < 0 ? 'text-danger-500' : config.iconColor}`}>
                  {reminder.remainingDays < 0 
                    ? `已过期 ${Math.abs(reminder.remainingDays)} 天` 
                    : `剩余 ${reminder.remainingDays} 天`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {formatDateDisplay(reminder.expectedExpireDate)} 到期
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

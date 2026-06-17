import { Bell, Baby, Snowflake, AlertTriangle, CalendarClock } from 'lucide-react';
import { Reminder, REMINDER_TYPE_LABELS, REMINDER_TYPE_COLORS } from '@/types';
import { formatDate, getRelativeTimeString } from '@/utils/date';
import { useReminderStore } from '@/store/useReminderStore';

interface ReminderBadgeProps {
  reminder: Reminder;
  onDismiss?: () => void;
  showDismiss?: boolean;
}

export default function ReminderBadge({ reminder, onDismiss, showDismiss = true }: ReminderBadgeProps) {
  const { dismissReminder } = useReminderStore();

  const iconMap = {
    child_growth: Baby,
    winter_clothing: Snowflake,
    seat_expiry: AlertTriangle,
    recheck: CalendarClock,
  };

  const Icon = iconMap[reminder.type];

  const handleDismiss = () => {
    dismissReminder(reminder.id);
    onDismiss?.();
  };

  return (
    <div className={`p-4 rounded-xl animate-fade-in-up animate-slide-in-right ${
      REMINDER_TYPE_COLORS[reminder.type].split(' ')[0]
    }`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          REMINDER_TYPE_COLORS[reminder.type].replace('text-', 'bg-').replace('-700', '-200')
        }`}>
          <Icon className={`w-5 h-5 ${REMINDER_TYPE_COLORS[reminder.type].split(' ')[1]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${REMINDER_TYPE_COLORS[reminder.type].split(' ')[1]}`}>
                  {REMINDER_TYPE_LABELS[reminder.type]}
                </span>
                <span className="text-xs text-gray-500">
                  {getRelativeTimeString(reminder.date)}
                </span>
              </div>
              <h4 className="font-medium text-gray-900 mt-0.5">{reminder.title}</h4>
            </div>
            {showDismiss && (
              <button
                onClick={handleDismiss}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                忽略
              </button>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1">{reminder.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            <Bell className="w-3 h-3 inline mr-1" />
            提醒日期: {formatDate(reminder.date)}
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, Bell, Check } from 'lucide-react';

export const ReminderBanner: React.FC = () => {
  const { reminders, markReminderAsRead, markAllRemindersAsRead } = useStore();
  const [showAll, setShowAll] = useState(false);

  const unreadReminders = reminders.filter(r => !r.isRead);
  const hasReminders = unreadReminders.length > 0;

  if (!hasReminders) return null;

  const topReminder = unreadReminders[0];

  const getReminderStyle = (type: string) => {
    switch (type) {
      case 'weather':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'timeout':
        return 'bg-gradient-to-r from-red-500 to-orange-500 text-white';
      case 'night':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'weather':
        return '🌧️';
      case 'timeout':
        return '⏰';
      case 'night':
        return '🌙';
      default:
        return '📢';
    }
  };

  return (
    <div className="w-full space-y-2">
      <div
        className={`w-full rounded-xl p-4 ${getReminderStyle(topReminder.type)} shadow-lg animate-pulse-slow cursor-pointer transition-all hover:shadow-xl`}
        onClick={() => setShowAll(!showAll)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getReminderIcon(topReminder.type)}</span>
            <div>
              <div className="flex items-center gap-2">
                <Bell size={16} className="animate-bounce" />
                <span className="font-semibold">
                  {unreadReminders.length > 1 ? `${unreadReminders.length} 条新提醒` : '新提醒'}
                </span>
              </div>
              <p className="text-sm opacity-90 mt-1 max-w-2xl truncate">
                {topReminder.message}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                markReminderAsRead(topReminder.id);
              }}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all"
            >
              <Check size={18} />
            </button>
            {unreadReminders.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  markAllRemindersAsRead();
                }}
                className="px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 text-sm transition-all"
              >
                全部已读
              </button>
            )}
          </div>
        </div>
      </div>

      {showAll && unreadReminders.length > 1 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          {unreadReminders.slice(1).map((reminder) => (
            <div
              key={reminder.id}
              className="p-4 border-b border-gray-100 last:border-b-0 flex items-start justify-between gap-3 hover:bg-gray-50 transition-all"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{getReminderIcon(reminder.type)}</span>
                <div>
                  <p className="text-gray-700 text-sm">{reminder.message}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(reminder.triggeredAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => markReminderAsRead(reminder.id)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

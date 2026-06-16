import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
} from 'lucide-react';
import { ReminderCard } from './ReminderCard';
import type { OvertimeReminder } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';
import { formatDateTime } from '../../utils/time';

export const ReminderPanel = () => {
  const getPendingReminders = useBadgeStore((s) => s.getPendingReminders);
  const getHandledReminders = useBadgeStore((s) => s.getHandledReminders);
  const updateOvertimeStatus = useBadgeStore((s) => s.updateOvertimeStatus);

  const [showHandled, setShowHandled] = useState(false);
  const [, setTick] = useState(0);

  const pendingReminders = getPendingReminders();
  const handledReminders = getHandledReminders();

  useEffect(() => {
    updateOvertimeStatus();
    const interval = setInterval(() => {
      updateOvertimeStatus();
      setTick((t) => t + 1);
    }, 15000);
    return () => clearInterval(interval);
  }, [updateOvertimeStatus]);

  return (
    <div className="card overflow-hidden">
      <div className="bg-danger/5 px-5 py-4 border-b border-danger/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell size={20} className="text-danger" />
              {pendingReminders.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingReminders.length}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-800">超时提醒</h3>
              <p className="text-xs text-neutral-500">
                系统自动提醒前台和接待人
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingReminders.length > 0 && (
              <span className="tag-danger">
                <AlertTriangle size={12} className="mr-1" />
                {pendingReminders.length} 条待处理
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 max-h-[500px] overflow-y-auto scrollbar-thin space-y-3">
        {pendingReminders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} className="text-success" />
            </div>
            <p className="text-sm text-neutral-600 font-medium">暂无超时提醒</p>
            <p className="text-xs text-neutral-400 mt-1">所有访客工牌均按时归还</p>
          </div>
        ) : (
          pendingReminders
            .sort((a, b) => new Date(b.overtimeAt).getTime() - new Date(a.overtimeAt).getTime())
            .map((reminder) => (
              <ReminderCard key={reminder.id} reminder={reminder} />
            ))
        )}

        {handledReminders.length > 0 && (
          <div className="pt-3 border-t border-neutral-100">
            <button
              onClick={() => setShowHandled(!showHandled)}
              className="w-full flex items-center justify-between text-sm text-neutral-500 hover:text-neutral-700 py-2 group"
            >
              <span className="flex items-center gap-2">
                <History size={14} />
                已处理记录 ({handledReminders.length})
              </span>
              {showHandled ? (
                <ChevronUp size={16} className="group-hover:-translate-y-0.5 transition-transform" />
              ) : (
                <ChevronDown size={16} className="group-hover:translate-y-0.5 transition-transform" />
              )}
            </button>

            {showHandled && (
              <div className="mt-3 space-y-2">
                {handledReminders
                  .sort((a, b) => new Date(b.overtimeAt).getTime() - new Date(a.overtimeAt).getTime())
                  .slice(0, 10)
                  .map((reminder) => (
                    <div
                      key={reminder.id}
                      className="p-3 bg-neutral-50 rounded-lg border border-neutral-100 opacity-75"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="w-5 h-8 rounded text-white text-[10px] font-bold flex items-center justify-center shrink-0"
                          style={{ backgroundColor: reminder.badgeColorHex }}
                        >
                          {reminder.badgeNumber.slice(-2)}
                        </span>
                        <span className="text-sm font-medium text-neutral-700">
                          {reminder.visitorName}
                        </span>
                        <span className="tag-success text-[10px]">已处理</span>
                        <div className="flex-1" />
                        <span className="text-[11px] text-neutral-400 font-mono">
                          {formatDateTime(reminder.handledAt || '')}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-3 ml-7">
                        <span>{reminder.visitorCompany}</span>
                        <span>接待：{reminder.hostName}</span>
                        {reminder.handledNote && (
                          <span className="text-neutral-600">「{reminder.handledNote}」</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

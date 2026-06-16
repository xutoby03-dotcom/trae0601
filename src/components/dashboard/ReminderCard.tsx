import { useState } from 'react';
import {
  AlertTriangle,
  User,
  Building2,
  Phone,
  UserCheck,
  Clock,
  CreditCard,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import type { OvertimeReminder } from '../../types';
import { useBadgeStore } from '../../store/useBadgeStore';
import { formatTime, formatDateTime, getCountdown } from '../../utils/time';

interface ReminderCardProps {
  reminder: OvertimeReminder;
}

export const ReminderCard = ({ reminder }: ReminderCardProps) => {
  const handleReminder = useBadgeStore((s) => s.handleReminder);
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const handleMarkHandled = () => {
    if (showNoteInput) {
      handleReminder(reminder.id, note.trim() || undefined);
      setNote('');
      setShowNoteInput(false);
    } else {
      setShowNoteInput(true);
    }
  };

  const handleQuickHandle = () => {
    handleReminder(reminder.id);
  };

  return (
    <div className="card p-4 border-l-4 border-l-danger bg-danger/5 animate-fade-in">
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-14 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm"
          style={{ backgroundColor: reminder.badgeColorHex }}
        >
          {reminder.badgeNumber}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-danger shrink-0" />
            <h4 className="font-semibold text-neutral-800 truncate">
              {reminder.visitorName}
            </h4>
            <span className="tag-danger shrink-0">超时未归还</span>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mb-3">
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Building2 size={12} className="text-neutral-400 shrink-0" />
              <span className="truncate">{reminder.visitorCompany}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <UserCheck size={12} className="text-neutral-400 shrink-0" />
              <span className="truncate">接待：{reminder.hostName}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Phone size={12} className="text-neutral-400 shrink-0" />
              <span className="font-mono">{reminder.visitorPhone}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600">
              <CreditCard size={12} className="text-neutral-400 shrink-0" />
              <span>{reminder.badgeColor} {reminder.badgeNumber}</span>
            </div>
            <div className="flex items-center gap-1.5 text-neutral-600 col-span-2">
              <Clock size={12} className="text-neutral-400 shrink-0" />
              <span>
                预计离开 {formatTime(reminder.expectedLeaveTime)} · 
                <span className="text-danger font-medium ml-1">
                  {getCountdown(reminder.expectedLeaveTime)}
                </span>
              </span>
            </div>
          </div>

          <div className="text-xs text-neutral-500 mb-3 flex items-center gap-1.5">
            <AlertTriangle size={11} className="text-warning" />
            提醒已同步发送至前台和接待人 {reminder.hostName}
          </div>

          {showNoteInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="填写处理说明（如：已电话联系、访客稍后归还等）"
                className="input-base text-sm py-1.5"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleMarkHandled} className="btn-success text-xs py-1 px-3">
                  <CheckCircle2 size={14} className="mr-1" />
                  确认已处理
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    setNote('');
                  }}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <button onClick={handleMarkHandled} className="btn-success text-xs py-1.5 px-3">
                <MessageSquare size={14} className="mr-1" />
                登记处理
              </button>
              <button onClick={handleQuickHandle} className="btn-secondary text-xs py-1.5 px-3">
                <CheckCircle2 size={14} className="mr-1" />
                快速标记
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

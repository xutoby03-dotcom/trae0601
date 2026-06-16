import { useState, useEffect } from 'react';
import { 
  Bell, 
  Clock, 
  Phone,
  Check,
  XCircle,
  MessageSquare,
  Star
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import Avatar from '../../components/Avatar';
import { REMINDER_TYPE_LABELS, REMINDER_TYPE_COLORS } from '../../../shared/constants';
import { formatDateTime, formatPhone } from '../../utils/format';
import type { Reminder } from '../../../shared/types';

export default function RemindersPage() {
  const { 
    reminders, 
    reminderCount,
    guests,
    sessions,
    loading, 
    fetchReminders, 
    fetchReminderCount,
    fetchGuests,
    fetchSessions,
    confirmGuest,
    markNoShow,
    markFeedbackFollowedUp,
    feedbackList,
    fetchFeedback
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'all' | 'unconfirmed' | 'no_show' | 'follow_up'>('all');

  useEffect(() => {
    fetchReminders();
    fetchReminderCount();
    fetchGuests();
    fetchSessions();
    fetchFeedback();
  }, [fetchReminders, fetchReminderCount, fetchGuests, fetchSessions, fetchFeedback]);

  const filteredReminders = activeTab === 'all' 
    ? reminders 
    : reminders.filter(r => r.type === activeTab);

  const getGuest = (guestId: string) => guests.find(g => g.id === guestId);
  const getSession = (sessionId: string) => sessions.find(s => s.id === sessionId);
  const getFeedback = (guestId: string) => feedbackList.find(f => f.guestId === guestId);

  const handleConfirm = async (guestId: string) => {
    try {
      await confirmGuest(guestId);
      fetchReminders();
      fetchReminderCount();
    } catch (error) {
      console.error('Failed to confirm guest:', error);
    }
  };

  const handleNoShow = async (guestId: string) => {
    const reason = window.prompt('请输入爽约原因：');
    if (reason !== null) {
      try {
        await markNoShow(guestId, reason || '未说明原因');
        fetchReminders();
        fetchReminderCount();
      } catch (error) {
        console.error('Failed to mark no show:', error);
      }
    }
  };

  const handleFollowUp = async (feedbackId: string) => {
    try {
      await markFeedbackFollowedUp(feedbackId);
      fetchReminders();
      fetchReminderCount();
    } catch (error) {
      console.error('Failed to mark follow up:', error);
    }
  };

  const tabs = [
    { key: 'all' as const, label: '全部', count: reminderCount.total },
    { key: 'unconfirmed' as const, label: '未确认', count: reminderCount.unconfirmed },
    { key: 'no_show' as const, label: '临时爽约', count: reminderCount.no_show },
    { key: 'follow_up' as const, label: '待回访', count: reminderCount.follow_up },
  ];

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">未确认</p>
              <p className="text-3xl font-semibold text-amber-600 mt-1">{reminderCount.unconfirmed}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <Clock className="text-amber-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">临时爽约</p>
              <p className="text-3xl font-semibold text-red-500 mt-1">{reminderCount.no_show}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">待回访</p>
              <p className="text-3xl font-semibold text-blue-600 mt-1">{reminderCount.follow_up}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        
        <div className="stat-card bg-gradient-to-br from-primary-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brown-500">待处理总计</p>
              <p className="text-3xl font-semibold text-primary-600 mt-1">{reminderCount.total}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Bell className="text-primary-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* 筛选标签 */}
      <div className="card">
        <div className="flex items-center gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${activeTab === tab.key
                  ? 'bg-primary-500 text-white shadow-md'
                  : 'bg-warm-50 text-brown-600 hover:bg-warm-100'
                }
              `}
            >
              {tab.label}
              <span className={`
                ml-2 px-2 py-0.5 rounded-full text-xs
                ${activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-white text-brown-500'
                }
              `}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 提醒列表 */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-brown-500">加载中...</div>
        ) : filteredReminders.length === 0 ? (
          <div className="card py-12 text-center">
            <Bell size={48} className="mx-auto mb-3 text-warm-300" />
            <p className="text-brown-500">暂无待处理的提醒</p>
            <p className="text-sm text-brown-400 mt-1">所有事项都已处理完毕</p>
          </div>
        ) : (
          filteredReminders.map((reminder) => {
            const guest = getGuest(reminder.guestId);
            const session = getSession(reminder.sessionId);
            const feedback = getFeedback(reminder.guestId);
            
            if (!guest) return null;

            return (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                guest={guest}
                sessionName={session?.name || '未知场次'}
                feedback={feedback}
                onConfirm={() => handleConfirm(guest.id)}
                onNoShow={() => handleNoShow(guest.id)}
                onFollowUp={() => feedback && handleFollowUp(feedback.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

interface ReminderCardProps {
  reminder: Reminder;
  guest: { id: string; name: string; phone: string; isVIP: boolean; headcount: number };
  sessionName: string;
  feedback?: { id: string; comment: string };
  onConfirm?: () => void;
  onNoShow?: () => void;
  onFollowUp?: () => void;
}

function ReminderCard({ 
  reminder, 
  guest, 
  sessionName, 
  feedback,
  onConfirm, 
  onNoShow,
  onFollowUp 
}: ReminderCardProps) {
  const typeColor = REMINDER_TYPE_COLORS[reminder.type] || 'bg-gray-500';
  const typeLabel = REMINDER_TYPE_LABELS[reminder.type] || reminder.type;

  const getTypeIcon = () => {
    switch (reminder.type) {
      case 'unconfirmed':
        return <Clock size={20} />;
      case 'no_show':
        return <XCircle size={20} />;
      case 'follow_up':
        return <MessageSquare size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <div className="card hover:shadow-medium transition-all">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${typeColor} text-white flex items-center justify-center flex-shrink-0`}>
          {getTypeIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <Avatar name={guest.name} size="sm" />
            <h4 className="font-medium text-brown-800">{guest.name}</h4>
            {guest.isVIP && (
              <span className="flex items-center gap-1 text-xs text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                <Star size={12} fill="currentColor" />
                VIP
              </span>
            )}
            <span className="badge bg-warm-100 text-brown-600">
              {typeLabel}
            </span>
          </div>
          
          <p className="mt-2 text-sm text-brown-600">{reminder.message}</p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-brown-500">
            <span className="flex items-center gap-1">
              <Phone size={14} />
              {formatPhone(guest.phone)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {sessionName}
            </span>
            <span>{guest.headcount}人</span>
          </div>
          
          {feedback?.comment && (
            <div className="mt-3 p-3 bg-warm-50 rounded-xl">
              <p className="text-sm text-brown-600">
                <span className="font-medium">反馈：</span>
                {feedback.comment}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {reminder.type === 'unconfirmed' && (
            <>
              <button
                onClick={onConfirm}
                className="flex items-center gap-1.5 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 transition-colors"
              >
                <Check size={16} />
                确认参加
              </button>
              <button
                onClick={onNoShow}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                <XCircle size={16} />
                标记爽约
              </button>
            </>
          )}
          
          {reminder.type === 'no_show' && (
            <div className="text-right">
              <span className="text-xs text-brown-400">
                {formatDateTime(reminder.createdAt)}
              </span>
            </div>
          )}
          
          {reminder.type === 'follow_up' && (
            <button
              onClick={onFollowUp}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              <Check size={16} />
              标记已回访
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

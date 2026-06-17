import { Link } from 'react-router-dom';
import { 
  Bell, 
  ArrowLeft, 
  X, 
  Check, 
  Trash2,
  AlertTriangle,
  AlertCircle,
  Snowflake,
  Baby,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useReminderStore } from '@/store/useReminderStore';
import { useState } from 'react';
import { ReminderType, REMINDER_TYPE_LABELS, REMINDER_TYPE_COLORS } from '@/types';
import { formatDate, getRelativeTimeString } from '@/utils/date';
import { getReminderSeverity } from '@/utils/reminder';

type FilterType = 'all' | ReminderType;

export default function ReminderCenter() {
  const { reminders, dismissReminder, deleteReminder, getActiveReminders } = useReminderStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showDismissed, setShowDismissed] = useState(false);

  const filteredReminders = reminders.filter(reminder => {
    if (!showDismissed && reminder.dismissed) return false;
    if (filter === 'all') return true;
    return reminder.type === filter;
  });

  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (a.dismissed && !b.dismissed) return 1;
    if (!a.dismissed && b.dismissed) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const activeCount = getActiveReminders().length;

  const typeConfig: Record<ReminderType, { icon: any; color: string }> = {
    seat_expiry: { icon: AlertTriangle, color: 'text-red-500' },
    recheck: { icon: RefreshCw, color: 'text-amber-500' },
    child_growth: { icon: Baby, color: 'text-blue-500' },
    winter_clothing: { icon: Snowflake, color: 'text-cyan-500' },
  };

  const severityConfig = {
    info: { bg: 'bg-blue-50', border: 'border-blue-200', label: '信息', color: 'text-blue-700' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', label: '警告', color: 'text-amber-700' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', label: '危险', color: 'text-red-700' },
  };

  const filterOptions: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'seat_expiry', label: '座椅到期' },
    { key: 'recheck', label: '复查提醒' },
    { key: 'child_growth', label: '孩子成长' },
    { key: 'winter_clothing', label: '冬季厚衣' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-secondary-500">提醒中心</h1>
            <p className="text-gray-500 mt-1">
              共 {reminders.length} 条提醒，{activeCount} 条未处理
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showDismissed}
            onChange={(e) => setShowDismissed(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-600">显示已关闭的提醒</span>
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {filterOptions.map(option => (
          <button
            key={option.key}
            onClick={() => setFilter(option.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === option.key
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.key === 'all' ? option.label : REMINDER_TYPE_LABELS[option.key]}
          </button>
        ))}
      </div>

      {sortedReminders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {showDismissed ? '暂无提醒记录' : '暂无未处理的提醒'}
          </h3>
          <p className="text-gray-500 mb-4">
            {showDismissed 
              ? '系统会在需要时自动生成安全提醒'
              : filter === 'all' 
                ? '所有提醒都已处理，继续保持！' 
                : `暂无${REMINDER_TYPE_LABELS[filter]}类型的提醒`
            }
          </p>
          {!showDismissed && (
            <button
              onClick={() => setShowDismissed(true)}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium"
            >
              查看历史提醒
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedReminders.map((reminder, index) => {
            const TypeIcon = typeConfig[reminder.type].icon;
            const severity = getReminderSeverity(reminder);
            const severityStyle = severityConfig[severity];
            const isOverdue = !reminder.dismissed && new Date(reminder.date) < new Date();

            return (
              <div
                key={reminder.id}
                className={`card p-4 animate-fade-in-up ${
                  reminder.dismissed ? 'opacity-60' : ''
                } ${severityStyle.bg} ${severityStyle.border} border-l-4`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    reminder.dismissed ? 'bg-gray-200' : REMINDER_TYPE_COLORS[reminder.type]
                  }`}>
                    <TypeIcon className={`w-5 h-5 ${
                      reminder.dismissed ? 'text-gray-500' : ''
                    }`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className={`font-semibold ${
                            reminder.dismissed ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {reminder.title}
                          </h3>
                          <span className={`badge ${
                            reminder.dismissed 
                              ? 'bg-gray-100 text-gray-500' 
                              : severityStyle.bg + ' ' + severityStyle.color
                          } border border-opacity-50`}>
                            {reminder.dismissed ? '已关闭' : severityStyle.label}
                          </span>
                          {isOverdue && !reminder.dismissed && (
                            <span className="badge bg-red-100 text-red-700">
                              <Clock className="w-3 h-3 mr-1" />
                              已逾期
                            </span>
                          )}
                        </div>
                        <span className={`badge ${
                          reminder.dismissed 
                            ? 'bg-gray-100 text-gray-400' 
                            : REMINDER_TYPE_COLORS[reminder.type]
                        } mb-2`}>
                          {REMINDER_TYPE_LABELS[reminder.type]}
                        </span>
                        <p className={`text-sm ${
                          reminder.dismissed ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {reminder.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 border-opacity-50">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          提醒日期: {formatDate(reminder.date)}
                          {isOverdue && !reminder.dismissed && ` (${getRelativeTimeString(reminder.date)})`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {!reminder.dismissed && (
                          <>
                            {reminder.type === 'recheck' && (
                              <Link
                                to="/inspection"
                                className="btn-primary text-sm py-1.5 px-3"
                              >
                                立即复查
                              </Link>
                            )}
                            {reminder.type === 'seat_expiry' && (
                              <Link
                                to="/seats"
                                className="btn-primary text-sm py-1.5 px-3"
                              >
                                查看座椅
                              </Link>
                            )}
                            <button
                              onClick={() => dismissReminder(reminder.id)}
                              className="btn-outline text-sm py-1.5 px-3"
                              title="关闭提醒"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              关闭
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除提醒"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeCount > 0 && (
        <div className="card p-4 bg-primary-50 border border-primary-100">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-primary-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-primary-700">
                您有 <span className="font-semibold">{activeCount}</span> 条未处理的安全提醒，
                建议及时处理以确保孩子的乘车安全。
              </p>
            </div>
            <button
              onClick={() => {
                getActiveReminders().forEach(r => dismissReminder(r.id));
              }}
              className="btn-outline text-sm py-1.5 px-3"
            >
              <X className="w-3 h-3 mr-1" />
              全部关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

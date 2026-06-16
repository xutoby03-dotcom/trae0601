import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Clock, Droplets, Package, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ReminderType, ReminderFilter } from '../types';
import { formatDisplayDate } from '../utils/storage';
import Card, { CardHeader, CardTitle, CardContent } from '../components/Card';
import AlertBanner from '../components/AlertBanner';

const Reminders: React.FC = () => {
  const navigate = useNavigate();
  const { reminders, braces, init, initialized, resolveReminder } = useStore();

  const [filter, setFilter] = useState<ReminderFilter>('all');
  const [showResolved, setShowResolved] = useState(false);

  useEffect(() => {
    if (!initialized) {
      init();
    }
  }, [init, initialized]);

  const filterOptions: { value: ReminderFilter; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: '全部', icon: <AlertTriangle size={16} /> },
    { value: 'missed_wear', label: '漏戴', icon: <Clock size={16} /> },
    { value: 'overdue_clean', label: '清洁', icon: <Droplets size={16} /> },
    { value: 'lost_box', label: '丢失', icon: <XCircle size={16} /> },
    { value: 'low_stock', label: '库存', icon: <Package size={16} /> },
  ];

  const getReminderIcon = (type: ReminderType) => {
    const icons = {
      missed_wear: <Clock className="text-accent-yellow" size={24} />,
      overdue_clean: <Droplets className="text-accent-coral" size={24} />,
      lost_box: <XCircle className="text-accent-coral" size={24} />,
      low_stock: <Package className="text-accent-yellow" size={24} />,
    };
    return icons[type];
  };

  const getReminderColor = (type: ReminderType) => {
    const colors = {
      missed_wear: 'border-l-accent-yellow bg-accent-yellow/5',
      overdue_clean: 'border-l-accent-coral bg-accent-coral/5',
      lost_box: 'border-l-accent-coral bg-accent-coral/5',
      low_stock: 'border-l-accent-yellow bg-accent-yellow/5',
    };
    return colors[type];
  };

  const getReminderTypeLabel = (type: ReminderType) => {
    const labels = {
      missed_wear: '漏戴提醒',
      overdue_clean: '清洁提醒',
      lost_box: '丢失提醒',
      low_stock: '库存提醒',
    };
    return labels[type];
  };

  const filteredReminders = reminders
    .filter(r => filter === 'all' || r.type === filter)
    .filter(r => showResolved || !r.isResolved)
    .sort((a, b) => {
      if (a.isResolved !== b.isResolved) return a.isResolved ? 1 : -1;
      return new Date(b.triggerDate).getTime() - new Date(a.triggerDate).getTime();
    });

  const unresolvedCount = reminders.filter(r => !r.isResolved).length;
  const filteredUnresolvedCount = filteredReminders.filter(r => !r.isResolved).length;

  const handleResolve = (id: string) => {
    resolveReminder(id);
  };

  const handleQuickAction = (reminder: typeof reminders[0]) => {
    if (reminder.type === 'missed_wear') {
      navigate('/records');
    } else if (reminder.type === 'overdue_clean') {
      navigate('/records');
    } else if (reminder.type === 'lost_box') {
      navigate('/records');
    } else if (reminder.type === 'low_stock') {
      navigate('/checkup');
    }
    resolveReminder(reminder.id);
  };

  const getBracesName = (bracesId: string) => {
    return braces.find(b => b.id === bracesId)?.name || '未知';
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-pulse text-primary text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-warm-gray transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold font-display text-warm-dark">提醒中心 🔔</h1>
          <p className="text-gray-500 mt-1">
            {unresolvedCount > 0 ? `有 ${unresolvedCount} 条待处理提醒` : '暂无待处理提醒'}
          </p>
        </div>
      </div>

      {unresolvedCount > 0 && (
        <AlertBanner
          type="warning"
          title={`您有 ${unresolvedCount} 条待处理提醒`}
          description="及时处理可以避免牙套护理问题"
        />
      )}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        {filterOptions.map(option => {
          const count = reminders.filter(r =>
            (filter === option.value || option.value === 'all') && !r.isResolved && (option.value === 'all' || r.type === option.value)
          ).length;
          const isActive = filter === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                isActive
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-warm-gray'
              }`}
            >
              {option.icon}
              <span className="text-sm font-medium">{option.label}</span>
              {count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-white/20' : 'bg-warm-gray'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium text-warm-dark">
          {filteredReminders.length > 0
            ? `${showResolved ? '全部' : '待处理'}提醒 (${filteredReminders.length})`
            : '暂无提醒'}
        </h3>
        {reminders.some(r => r.isResolved) && (
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-1 text-sm text-primary font-medium"
          >
            {showResolved ? (
              <>
                隐藏已处理 <ChevronUp size={16} />
              </>
            ) : (
              <>
                显示已处理 <ChevronDown size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {filteredReminders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold font-display mb-2">太棒了！</h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? '暂无任何提醒，继续保持良好的护理习惯！'
                : `暂无${filterOptions.find(f => f.value === filter)?.label}相关提醒`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map(reminder => (
          <div
            key={reminder.id}
            className={`relative p-4 rounded-xl border-l-4 transition-all ${
              getReminderColor(reminder.type)
            } ${reminder.isResolved ? 'opacity-60' : 'animate-slide-up'}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-2 rounded-full bg-white shadow-sm">
                {getReminderIcon(reminder.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-warm-dark">{reminder.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white shadow-sm text-gray-500">
                        {getReminderTypeLabel(reminder.type)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{reminder.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{getBracesName(reminder.bracesId)}</span>
                      <span>{formatDisplayDate(reminder.triggerDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 ml-16">
                {!reminder.isResolved ? (
                  <>
                    <button
                      onClick={() => handleQuickAction(reminder)}
                      className="btn-primary py-2 px-4 text-sm flex-1"
                    >
                      去处理
                    </button>
                    <button
                      onClick={() => handleResolve(reminder.id)}
                      className="btn-secondary py-2 px-4 text-sm"
                    >
                      <Check size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-gray-400 flex items-center gap-1">
                    <Check size={14} className="text-primary" />
                    已处理于 {reminder.resolvedAt && formatDisplayDate(reminder.resolvedAt)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {reminders.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-5xl mb-4">✨</div>
            <h3 className="text-xl font-bold font-display mb-2">一切正常！</h3>
            <p className="text-gray-500 mb-4">目前没有任何提醒，继续保持！</p>
            <button
              onClick={() => navigate('/records')}
              className="btn-primary"
            >
              去记录今天的情况
            </button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Reminders;

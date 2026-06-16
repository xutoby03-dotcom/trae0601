import { useState, useEffect } from 'react';
import { ReminderCard } from '@/components/reminders';
import { Button, Card, CardContent, Empty, useToast } from '@/components/ui';
import { useReminderStore } from '@/stores/useReminderStore';
import type { Reminder } from '@/types';
import { Bell, Settings, CheckCheck, List, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/cn';

type TabType = 'all' | 'unread' | 'read';

const tabs = [
  { value: 'all' as const, label: '全部', icon: List },
  { value: 'unread' as const, label: '未读', icon: EyeOff },
  { value: 'read' as const, label: '已读', icon: Eye },
];

export default function Reminders() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const { reminders, unreadCount, loading, fetchReminders, markAllAsRead } = useReminderStore();
  const { showToast } = useToast();

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const filteredReminders = reminders.filter((reminder) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !reminder.isRead;
    if (activeTab === 'read') return reminder.isRead;
    return true;
  });

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      showToast.success('已全部标记为已读');
    } catch (error) {
      showToast.error('操作失败');
    }
  };

  const handleReminderClick = (reminder: Reminder) => {
    showToast.info(`查看提醒: ${reminder.title}`);
  };

  const handleGoToSettings = () => {
    showToast.info('跳转到提醒设置页面');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">提醒中心</h1>
          <p className="mt-1 text-gray-500">查看和管理所有提醒通知</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGoToSettings}
          icon={<Settings className="h-4 w-4" />}
        >
          提醒设置
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              const count = tab.value === 'unread' ? unreadCount :
                tab.value === 'read' ? reminders.filter(r => r.isRead).length :
                reminders.length;

              return (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-b-2 border-primary-500 text-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Bell className="h-4 w-4" />
              <span>共 {filteredReminders.length} 条提醒</span>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                loading={loading}
                icon={<CheckCheck className="h-4 w-4" />}
              >
                全部已读
              </Button>
            )}
          </div>

          <div className="p-4">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : filteredReminders.length === 0 ? (
              <Empty
                icon={<Bell className="h-12 w-12 text-gray-300" />}
                title="暂无提醒"
                description={
                  activeTab === 'unread'
                    ? '您没有未读提醒'
                    : activeTab === 'read'
                    ? '您没有已读提醒'
                    : '暂无任何提醒通知'
                }
              />
            ) : (
              <div className="space-y-3">
                {filteredReminders.map((reminder) => (
                  <ReminderCard
                    key={reminder.id}
                    reminder={reminder}
                    onClick={() => handleReminderClick(reminder)}
                  />
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

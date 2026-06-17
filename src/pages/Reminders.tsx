import { useState } from 'react';
import { Bell, Droplets, Gift, Check, Trash2 } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import ReminderCard from '@/components/shared/ReminderCard';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import type { ReminderType } from '@/types';

type TabType = 'all' | 'moisture_pack' | 'donation';

export default function Reminders() {
  const { reminders, markReminderRead, clothes, boxes } = useStore();
  const [activeTab, setActiveTab] = useState<TabType>('all');

  const filteredReminders = reminders.filter(r => {
    if (activeTab === 'all') return true;
    return r.type === activeTab;
  });

  const moistureCount = reminders.filter(r => r.type === 'moisture_pack').length;
  const donationCount = reminders.filter(r => r.type === 'donation').length;

  const tabs = [
    { value: 'all' as const, label: '全部', icon: Bell, count: reminders.length },
    { value: 'moisture_pack' as const, label: '防潮包', icon: Droplets, count: moistureCount },
    { value: 'donation' as const, label: '捐赠候选', icon: Gift, count: donationCount },
  ];

  const handleReminderClick = (reminder: typeof reminders[0]) => {
    markReminderRead(reminder.id);
  };

  const getRelatedItem = (reminder: typeof reminders[0]) => {
    if (reminder.relatedType === 'box') {
      return boxes.find(b => b.id === reminder.relatedId);
    }
    return clothes.find(c => c.id === reminder.relatedId);
  };

  return (
    <Layout title="智能提醒">
      <div className="space-y-4">
        <div className="flex bg-warm-100 rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.value
                  ? 'bg-white text-sage-600 shadow-sm'
                  : 'text-warm-500 hover:text-warm-700'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {tab.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.value ? 'bg-sage-100 text-sage-600' : 'bg-warm-200 text-warm-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredReminders.length > 0 ? (
          <div className="space-y-3">
            {filteredReminders.map((reminder, index) => (
              <div 
                key={reminder.id} 
                onClick={() => handleReminderClick(reminder)}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ReminderCard reminder={reminder} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Bell}
            title="暂无提醒"
            description="所有物品状态良好，继续保持！"
          />
        )}

        {reminders.length > 0 && (
          <div className="card p-4 mt-6">
            <h4 className="font-medium text-warm-700 mb-3">小提示</h4>
            <ul className="space-y-2 text-sm text-warm-500">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 mt-1.5 flex-shrink-0" />
                防潮包建议每 3 个月更换一次，以保持最佳吸湿效果
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 flex-shrink-0" />
                长期未穿的衣物可以考虑捐赠，让闲置物品发挥更大价值
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-coral-400 mt-1.5 flex-shrink-0" />
                换季时提前取出衣物，检查是否需要清洗或晾晒
              </li>
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}

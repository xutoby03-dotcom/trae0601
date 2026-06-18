import { useWedding } from '../context/WeddingContext';
import { TabKey } from '../types';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: '婚礼看板', icon: '📊' },
  { key: 'guests', label: '宾客管理', icon: '👥' },
  { key: 'seating', label: '排桌安排', icon: '🪑' },
  { key: 'tableCards', label: '桌卡打印', icon: '🃏' },
  { key: 'kitchen', label: '厨房备餐', icon: '🍽️' },
];

export default function Sidebar() {
  const { activeTab, setActiveTab } = useWedding();

  return (
    <aside className="w-56 bg-white border-r border-wedding-pink/30 flex flex-col no-print">
      <div className="p-6 border-b border-wedding-pink/30">
        <h1 className="text-xl font-bold text-wedding-dark flex items-center gap-2">
          <span className="text-2xl">💒</span>
          <span>婚礼管家</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">桌卡与过敏信息系统</p>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
              activeTab === tab.key
                ? 'bg-wedding-rose/20 text-wedding-dark font-medium'
                : 'text-gray-600 hover:bg-wedding-pink/30'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span className="text-sm">{tab.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-wedding-pink/30">
        <div className="bg-wedding-gold/10 rounded-lg p-3">
          <p className="text-xs text-wedding-dark font-medium">今日提醒</p>
          <p className="text-xs text-gray-500 mt-1">请确认所有宾客信息</p>
        </div>
      </div>
    </aside>
  );
}

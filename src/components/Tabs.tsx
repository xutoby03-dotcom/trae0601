import { useState, ReactNode } from 'react';
import { cn } from '../lib/utils';

interface TabItem {
  key: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTab?: string;
  onTabChange?: (key: string) => void;
  className?: string;
  children: ReactNode;
}

export function Tabs({ tabs, defaultTab, onTabChange, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.key);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
    onTabChange?.(key);
  };

  return (
    <div className={className}>
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white text-sky-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}

interface TabPanelProps {
  activeKey: string;
  tabKey: string;
  children: ReactNode;
}

export function TabPanel({ activeKey, tabKey, children }: TabPanelProps) {
  if (activeKey !== tabKey) return null;
  return <div className="animate-fadeIn">{children}</div>;
}

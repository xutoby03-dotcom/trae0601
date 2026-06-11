import React from 'react';
import { Page } from '../types';

interface TabBarProps {
  current: Page;
  onChange: (page: Page) => void;
}

const tabs: { key: Page; label: string; icon: string }[] = [
  { key: 'dashboard', label: '首页', icon: '🏠' },
  { key: 'customers', label: '顾客', icon: '👥' },
  { key: 'records', label: '赊账', icon: '📝' },
  { key: 'summary', label: '统计', icon: '📊' }
];

export const TabBar: React.FC<TabBarProps> = ({ current, onChange }) => (
  <div style={{
    position: 'fixed', bottom: 0, left: 0, right: 0,
    backgroundColor: 'white', borderTop: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-around',
    padding: '8px 0', paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
    zIndex: 100
  }}>
    {tabs.map(tab => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        style={{
          flex: 1,
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '6px 0',
          color: current === tab.key ? '#4f46e5' : '#94a3b8',
          fontSize: 11,
          transition: 'color 0.2s'
        }}
      >
        <span style={{ fontSize: 22 }}>{tab.icon}</span>
        <span style={{ fontWeight: current === tab.key ? 600 : 400 }}>{tab.label}</span>
      </button>
    ))}
  </div>
);

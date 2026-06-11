import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  style?: React.CSSProperties;
  padding?: number;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, padding = 20, hoverable, onClick, ...rest }) => (
  <div
    onClick={onClick}
    style={{
      backgroundColor: 'white',
      borderRadius: 12,
      padding,
      boxShadow: hoverable ? '0 2px 8px rgba(0,0,0,0.06)' : '0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.2s',
      ...(hoverable || onClick ? { cursor: 'pointer' } : {}),
      ...style
    }}
    onMouseEnter={e => hoverable && (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
    onMouseLeave={e => hoverable && (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
    {...rest}
  >
    {children}
  </div>
);

export const EmptyState: React.FC<{ text?: string }> = ({ text = '暂无数据' }) => (
  <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8', fontSize: 14 }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
    {text}
  </div>
);

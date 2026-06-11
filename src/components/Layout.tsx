import React from 'react';
import { Page } from '../types';
import { TabBar } from './TabBar';

interface LayoutProps {
  children: React.ReactNode;
  page: Page;
  onPageChange: (page: Page) => void;
  title?: string;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, page, onPageChange, title, rightAction, showBack, onBack }) => (
  <div style={{
    minHeight: '100vh', backgroundColor: '#f8fafc',
    paddingBottom: 80
  }}>
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      backgroundColor: 'white', borderBottom: '1px solid #e2e8f0',
      padding: '16px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        {showBack && (
          <button
            onClick={onBack}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 20, padding: 4, color: '#334155'
            }}
          >←</button>
        )}
        <h1 style={{
          margin: 0, fontSize: 18, fontWeight: 700,
          color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {title || '街边小店赊账本'}
        </h1>
      </div>
      <div>{rightAction}</div>
    </div>
    <div style={{ padding: 16, maxWidth: 640, margin: '0 auto' }}>
      {children}
    </div>
    <TabBar current={page} onChange={onPageChange} />
  </div>
);

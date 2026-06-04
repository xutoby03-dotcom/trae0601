import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Palette } from 'lucide-react';
import type { Tab } from '@/types/terminal';
import type { ThemeName } from '@/types/theme';
import { themeNames } from '@/themes';
import { cn } from '@/lib/utils';

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  currentTheme: ThemeName;
  onTabClick: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabAdd: () => void;
  onTabRename: (tabId: string, newTitle: string) => void;
  onThemeChange: (theme: ThemeName) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  currentTheme,
  onTabClick,
  onTabClose,
  onTabAdd,
  onTabRename,
  onThemeChange,
}) => {
  const [renamingTabId, setRenamingTabId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (renamingTabId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingTabId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowThemeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDoubleClick = (tab: Tab) => {
    setRenamingTabId(tab.id);
    setRenameValue(tab.title);
  };

  const handleRenameSubmit = (tabId: string) => {
    if (renameValue.trim()) {
      onTabRename(tabId, renameValue.trim());
    }
    setRenamingTabId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter') {
      handleRenameSubmit(tabId);
    } else if (e.key === 'Escape') {
      setRenamingTabId(null);
      setRenameValue('');
    }
  };

  const handleCloseClick = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose(tabId);
  };

  const handleThemeSelect = (theme: ThemeName) => {
    onThemeChange(theme);
    setShowThemeDropdown(false);
  };

  return (
    <div className="tab-bar">
      <div className="tab-list">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={cn('tab-item', { active: tab.id === activeTabId })}
            onClick={() => onTabClick(tab.id)}
            onDoubleClick={() => handleDoubleClick(tab)}
          >
            {renamingTabId === tab.id ? (
              <input
                ref={renameInputRef}
                type="text"
                className="tab-rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={() => handleRenameSubmit(tab.id)}
                onKeyDown={(e) => handleRenameKeyDown(e, tab.id)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="tab-title">{tab.title}</span>
            )}
            {tabs.length > 1 && (
              <button
                className="tab-close"
                onClick={(e) => handleCloseClick(e, tab.id)}
                title="关闭标签"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button className="tab-add" onClick={onTabAdd} title="新建标签">
        <Plus size={18} />
      </button>

      <div className="theme-selector" ref={dropdownRef}>
        <button
          className="theme-button"
          onClick={() => setShowThemeDropdown(!showThemeDropdown)}
          title="切换主题"
        >
          <Palette size={16} />
        </button>
        {showThemeDropdown && (
          <div className="theme-dropdown">
            {themeNames.map((theme) => (
              <div
                key={theme}
                className={cn('theme-dropdown-item', { active: theme === currentTheme })}
                onClick={() => handleThemeSelect(theme)}
              >
                {theme.charAt(0).toUpperCase() + theme.slice(1)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TabBar;

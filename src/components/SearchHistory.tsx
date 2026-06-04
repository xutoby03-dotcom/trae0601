import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { HistoryEntry } from '@/types/terminal';
import { cn } from '@/lib/utils';

interface SearchHistoryProps {
  visible: boolean;
  history: HistoryEntry[];
  onClose: () => void;
  onSelect: (command: string) => void;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  return date.toLocaleDateString('zh-CN');
}

function fuzzyMatch(text: string, query: string): boolean {
  if (!query) return true;
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === queryLower.length;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({
  visible,
  history,
  onClose,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  const filteredHistory = useMemo(() => {
    const sorted = [...history].sort((a, b) => b.timestamp - a.timestamp);
    if (!query.trim()) {
      return sorted;
    }
    return sorted.filter((entry) => fuzzyMatch(entry.command, query));
  }, [history, query]);

  useEffect(() => {
    if (visible && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [visible]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (selectedItemRef.current && visible) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, visible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!visible) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          Math.min(prev + 1, Math.max(0, filteredHistory.length - 1))
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredHistory[selectedIndex]) {
          onSelect(filteredHistory[selectedIndex].command);
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible, filteredHistory, selectedIndex, onClose, onSelect]);

  if (!visible) {
    return null;
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleItemClick = (command: string) => {
    onSelect(command);
    onClose();
  };

  return (
    <div className="search-history-overlay" onClick={handleOverlayClick}>
      <div className="search-history-container">
        <div className="search-history-header">
          <Search size={18} className="search-history-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-history-input"
            placeholder="搜索历史命令 (fuzzy match)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-history-close" onClick={onClose} title="关闭">
            <X size={16} />
          </button>
        </div>

        <div className="search-history-results">
          {filteredHistory.length === 0 ? (
            <div className="search-history-empty">
              {query ? '没有找到匹配的命令' : '暂无历史记录'}
            </div>
          ) : (
            filteredHistory.map((entry, index) => (
              <div
                key={entry.id}
                ref={index === selectedIndex ? selectedItemRef : null}
                className={cn('search-history-item', { active: index === selectedIndex })}
                onClick={() => handleItemClick(entry.command)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className="search-history-command">{entry.command}</span>
                <span className="search-history-time">{formatTime(entry.timestamp)}</span>
              </div>
            ))
          )}
        </div>

        <div className="search-history-footer">
          <span>{filteredHistory.length} 条结果</span>
          <div className="search-history-hint">
            <span><span className="hint-key">↑↓</span> 选择</span>
            <span><span className="hint-key">Enter</span> 执行</span>
            <span><span className="hint-key">Esc</span> 关闭</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchHistory;

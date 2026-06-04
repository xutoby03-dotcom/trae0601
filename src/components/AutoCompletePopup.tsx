import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { File as FileIcon, Folder as FolderIcon, Terminal, Command } from 'lucide-react';

export interface AutoCompleteItem {
  label: string;
  type: 'file' | 'directory' | 'command' | 'argument';
  icon?: string;
  description?: string;
}

interface AutoCompletePopupProps {
  items: AutoCompleteItem[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  onConfirm: (item: AutoCompleteItem) => void;
  position?: { x: number; y: number };
  visible: boolean;
}

const getIconForType = (type: AutoCompleteItem['type']) => {
  switch (type) {
    case 'file':
      return FileIcon;
    case 'directory':
      return FolderIcon;
    case 'command':
      return Terminal;
    default:
      return Command;
  }
};

export const AutoCompletePopup: React.FC<AutoCompletePopupProps> = ({
  items,
  selectedIndex,
  onSelect,
  onConfirm,
  position,
  visible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedItemRef.current && visible) {
      selectedItemRef.current.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, visible]);

  if (!visible || items.length === 0) {
    return null;
  }

  const handleItemClick = (index: number, item: AutoCompleteItem) => {
    onSelect(index);
    onConfirm(item);
  };

  const style: React.CSSProperties = {};
  if (position) {
    style.left = position.x;
    style.top = position.y;
  }

  return (
    <div ref={containerRef} className="autocomplete-popup" style={style}>
      {items.map((item, index) => {
        const IconComponent = getIconForType(item.type);
        return (
          <div
            key={`${item.label}-${index}`}
            ref={index === selectedIndex ? selectedItemRef : null}
            className={cn('autocomplete-item', { active: index === selectedIndex })}
            onClick={() => handleItemClick(index, item)}
            onMouseEnter={() => onSelect(index)}
          >
            <IconComponent size={14} className="autocomplete-icon" />
            <span>{item.label}</span>
            {item.description && (
              <span className="text-xs opacity-60 ml-auto">{item.description}</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AutoCompletePopup;

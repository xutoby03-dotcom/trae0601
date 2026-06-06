import React from 'react';
import * as Icons from 'lucide-react';
import WindowControls from './WindowControls';

interface WindowTitlebarProps {
  title: string;
  icon?: string;
  isActive: boolean;
  isMaximized: boolean;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
}

const iconMap: Record<string, any> = {
  folder: Icons.Folder,
  'file-text': Icons.FileText,
  calculator: Icons.Calculator,
  palette: Icons.Palette,
  globe: Icons.Globe,
  music: Icons.Music,
};

const WindowTitlebar: React.FC<WindowTitlebarProps> = ({
  title,
  icon,
  isActive,
  isMaximized,
  onMinimize,
  onMaximize,
  onClose,
  onMouseDown,
  onDoubleClick,
}) => {
  const IconComponent = icon ? (iconMap[icon] || Icons.AppWindow) : Icons.AppWindow;

  return (
    <div
      className="flex items-center justify-between h-8 px-2 select-none cursor-move"
      style={{
        background: isActive ? 'var(--color-window-titlebar-active)' : 'var(--color-window-titlebar)',
      }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      <div className="flex items-center gap-2 px-1">
        <IconComponent size={14} style={{ color: isActive ? 'var(--color-window-titlebar-text-active)' : 'var(--color-window-titlebar-text)' }} />
        <span 
          className="text-xs font-medium truncate"
          style={{ color: isActive ? 'var(--color-window-titlebar-text-active)' : 'var(--color-window-titlebar-text)' }}
        >
          {title}
        </span>
      </div>
      <WindowControls
        onMinimize={onMinimize}
        onMaximize={onMaximize}
        onClose={onClose}
        isMaximized={isMaximized}
      />
    </div>
  );
};

export default WindowTitlebar;

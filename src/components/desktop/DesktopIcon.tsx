import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { DesktopIcon as DesktopIconType } from '../../types';
import { useWindowStore } from '../../stores/useWindowStore';
import { useAppStore } from '../../stores/useAppStore';
import { useDesktopStore } from '../../stores/useDesktopStore';

interface DesktopIconProps {
  icon: DesktopIconType;
}

const iconMap: Record<string, any> = {
  folder: Icons.Folder,
  'file-text': Icons.FileText,
  calculator: Icons.Calculator,
  palette: Icons.Palette,
  globe: Icons.Globe,
  music: Icons.Music,
  settings: Icons.Settings,
  user: Icons.User,
};

const DesktopIcon: React.FC<DesktopIconProps> = ({ icon }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const openWindow = useWindowStore(state => state.openWindow);
  const getAppConfig = useAppStore(state => state.getAppConfig);
  const updateIconPosition = useDesktopStore(state => state.updateIconPosition);
  const appConfig = getAppConfig(icon.appId);

  const IconComponent = appConfig ? (iconMap[appConfig.icon] || Icons.File) : Icons.File;

  const handleDoubleClick = () => {
    if (appConfig) {
      openWindow(icon.appId, appConfig.name, appConfig.defaultWidth, appConfig.defaultHeight);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const taskbarHeight = 48;
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - taskbarHeight - 80;
    const newX = Math.max(0, Math.min(maxX, e.clientX - dragOffset.x));
    const newY = Math.max(0, Math.min(maxY, e.clientY - dragOffset.y));
    updateIconPosition(icon.id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      className="absolute flex flex-col items-center justify-center w-20 h-20 cursor-pointer select-none group"
      style={{ left: icon.x, top: icon.y }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`p-2 rounded transition-all duration-150 ${
        isDragging ? 'opacity-50 scale-105' : 'group-hover:bg-white/10 group-active:bg-white/20'
      }`}>
        <IconComponent size={40} className="text-white drop-shadow-lg" />
      </div>
      <span className="mt-1 text-xs text-white text-center drop-shadow-md leading-tight max-w-[70px] truncate">
        {icon.name}
      </span>
    </div>
  );
};

export default DesktopIcon;

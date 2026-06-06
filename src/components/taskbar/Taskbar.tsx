import React, { useState } from 'react';
import { Monitor } from 'lucide-react';
import StartMenu from './StartMenu';
import Clock from './Clock';
import SystemTray from './SystemTray';
import { useWindowStore } from '../../stores/useWindowStore';
import { useAppStore } from '../../stores/useAppStore';
import * as Icons from 'lucide-react';

const iconMap: Record<string, any> = {
  folder: Icons.Folder,
  'file-text': Icons.FileText,
  calculator: Icons.Calculator,
  palette: Icons.Palette,
  globe: Icons.Globe,
  music: Icons.Music,
};

const Taskbar: React.FC = () => {
  const [showStartMenu, setShowStartMenu] = useState(false);
  const windows = useWindowStore(state => state.windows);
  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const restoreWindow = useWindowStore(state => state.restoreWindow);
  const focusWindow = useWindowStore(state => state.focusWindow);
  const minimizeWindow = useWindowStore(state => state.minimizeWindow);
  const getAppConfig = useAppStore(state => state.getAppConfig);

  const handleTaskbarItemClick = (windowId: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(windowId);
    } else if (activeWindowId === windowId) {
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  const visibleWindows = windows;

  return (
    <div
      className="absolute bottom-0 left-0 right-0 flex items-center justify-between z-30"
      style={{
        height: 'var(--taskbar-height)',
        background: 'var(--color-taskbar-background)',
        borderTop: 'var(--border-taskbar)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div className="flex items-center h-full">
        <div className="relative h-full">
          <button
            className="flex items-center justify-center h-full px-4 transition-colors hover:bg-white/10 active:bg-white/20"
            onClick={() => setShowStartMenu(!showStartMenu)}
          >
            <Monitor size={20} style={{ color: 'var(--color-accent)' }} />
          </button>
          {showStartMenu && <StartMenu onClose={() => setShowStartMenu(false)} />}
        </div>

        <div className="flex items-center h-full px-1 gap-1">
          {visibleWindows.map(win => {
            const appConfig = getAppConfig(win.appId);
            const IconComponent = appConfig ? (iconMap[appConfig.icon] || Icons.AppWindow) : Icons.AppWindow;
            const isActive = activeWindowId === win.id && !win.isMinimized;

            return (
              <button
                key={win.id}
                className={`relative flex items-center gap-2 h-full px-3 transition-colors ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                onClick={() => handleTaskbarItemClick(win.id, win.isMinimized)}
                title={win.title}
              >
                <IconComponent size={16} style={{ color: 'var(--color-text-primary)' }} />
                <span className="text-sm hidden sm:inline" style={{ color: 'var(--color-text-primary)' }}>
                  {win.title}
                </span>
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'var(--color-accent)' }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center h-full">
        <SystemTray />
        <Clock />
      </div>
    </div>
  );
};

export default Taskbar;

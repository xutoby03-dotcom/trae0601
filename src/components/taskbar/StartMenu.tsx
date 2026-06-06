import React from 'react';
import * as Icons from 'lucide-react';
import { useAppStore } from '../../stores/useAppStore';
import { useWindowStore } from '../../stores/useWindowStore';

interface StartMenuProps {
  onClose: () => void;
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

const StartMenu: React.FC<StartMenuProps> = ({ onClose }) => {
  const apps = useAppStore(state => state.apps);
  const getAppConfig = useAppStore(state => state.getAppConfig);
  const openWindow = useWindowStore(state => state.openWindow);

  const handleAppClick = (appId: string) => {
    const config = getAppConfig(appId);
    if (config) {
      openWindow(appId, config.name, config.defaultWidth, config.defaultHeight);
      onClose();
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <div
        className="absolute bottom-full left-0 mb-1 p-2 rounded-lg shadow-xl z-50 w-72"
        style={{
          background: 'var(--color-start-menu-background)',
          border: 'var(--border-start-menu)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="p-3 border-b" style={{ borderColor: 'var(--color-taskbar-border)' }}>
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-accent)' }}
            >
              <Icons.User size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                用户
              </p>
              <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                欢迎使用虚拟桌面
              </p>
            </div>
          </div>
        </div>

        <div className="p-2 max-h-80 overflow-y-auto">
          <p className="text-xs font-medium px-2 py-1" style={{ color: 'var(--color-text-secondary)' }}>
            应用列表
          </p>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {apps.map(app => {
              const IconComponent = iconMap[app.icon] || Icons.AppWindow;
              return (
                <button
                  key={app.id}
                  className="flex flex-col items-center gap-1 p-2 rounded transition-colors hover:bg-white/10 active:bg-white/20"
                  onClick={() => handleAppClick(app.id)}
                >
                  <div 
                    className="w-10 h-10 rounded flex items-center justify-center"
                    style={{ background: 'var(--color-button-background)' }}
                  >
                    <IconComponent size={20} style={{ color: 'var(--color-accent)' }} />
                  </div>
                  <span className="text-xs text-center leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                    {app.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div 
          className="p-2 border-t flex items-center justify-between"
          style={{ borderColor: 'var(--color-taskbar-border)' }}
        >
          <button className="flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <Icons.Settings size={16} />
            <span>设置</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors hover:bg-red-500/10 text-red-500">
            <Icons.Power size={16} />
            <span>关机</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default StartMenu;

import React, { useState } from 'react';
import { Wifi, Volume2, Battery, Settings, Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '../../stores/useThemeStore';
import { ThemeType } from '../../types';

const SystemTray: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const theme = useThemeStore(state => state.theme);
  const setTheme = useThemeStore(state => state.setTheme);

  const themes: { id: ThemeType; name: string; icon: React.ReactNode }[] = [
    { id: 'light', name: '浅色', icon: <Sun size={16} /> },
    { id: 'dark', name: '深色', icon: <Moon size={16} /> },
    { id: 'win95', name: 'Win95', icon: <Monitor size={16} /> },
  ];

  return (
    <div className="relative flex items-center h-full">
      <div 
        className="flex items-center gap-1 px-2 h-full cursor-pointer hover:bg-white/10 transition-colors"
        onClick={() => setShowSettings(!showSettings)}
      >
        <Wifi size={16} style={{ color: 'var(--color-text-primary)' }} />
        <Volume2 size={16} style={{ color: 'var(--color-text-primary)' }} />
        <Battery size={16} style={{ color: 'var(--color-text-primary)' }} />
      </div>

      {showSettings && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowSettings(false)}
          />
          <div 
            className="absolute bottom-full right-0 mb-2 p-4 rounded-lg shadow-lg z-50 min-w-[200px]"
            style={{
              background: 'var(--color-start-menu-background)',
              border: 'var(--border-start-menu)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>
              主题设置
            </h4>
            <div className="flex flex-col gap-2">
              {themes.map(t => (
                <button
                  key={t.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                    theme === t.id ? 'bg-blue-500 text-white' : ''
                  }`}
                  style={{
                    color: theme === t.id ? 'white' : 'var(--color-text-primary)',
                    background: theme === t.id ? 'var(--color-accent)' : 'transparent',
                  }}
                  onClick={() => {
                    setTheme(t.id);
                    setShowSettings(false);
                  }}
                >
                  {t.icon}
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemTray;

import React, { useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { themes } from '../../utils/themes';

const Desktop: React.FC = () => {
  const icons = useDesktopStore(state => state.icons);
  const loadIcons = useDesktopStore(state => state.loadIcons);
  const theme = useThemeStore(state => state.theme);
  const background = useThemeStore(state => state.background);
  const themeConfig = themes[theme];

  useEffect(() => {
    loadIcons();
  }, [loadIcons]);

  const desktopBg = background || themeConfig.colors.desktopBackground;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: desktopBg,
        bottom: 'var(--taskbar-height)',
      }}
    >
      {icons.map(icon => (
        <DesktopIcon key={icon.id} icon={icon} />
      ))}
    </div>
  );
};

export default Desktop;

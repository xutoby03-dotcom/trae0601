import React, { useEffect } from 'react';
import DesktopIcon from './DesktopIcon';
import DesktopWidget from './DesktopWidget';
import { useDesktopStore } from '../../stores/useDesktopStore';
import { useWidgetStore } from '../../stores/useWidgetStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { themes } from '../../utils/themes';

const Desktop: React.FC = () => {
  const icons = useDesktopStore(state => state.icons);
  const loadIcons = useDesktopStore(state => state.loadIcons);
  const widgets = useWidgetStore(state => state.widgets);
  const loadWidgets = useWidgetStore(state => state.loadWidgets);
  const theme = useThemeStore(state => state.theme);
  const background = useThemeStore(state => state.background);
  const themeConfig = themes[theme];

  useEffect(() => {
    loadIcons();
    loadWidgets();
  }, [loadIcons, loadWidgets]);

  const desktopBg = background || themeConfig.colors.desktopBackground;

  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: desktopBg,
        bottom: 'var(--taskbar-height)',
      }}
    >
      {widgets.map(widget => (
        <DesktopWidget key={widget.id} widget={widget} />
      ))}
      {icons.map(icon => (
        <DesktopIcon key={icon.id} icon={icon} />
      ))}
    </div>
  );
};

export default Desktop;

import { useEffect } from 'react';
import Desktop from './components/desktop/Desktop';
import Taskbar from './components/taskbar/Taskbar';
import Window from './components/window/Window';
import { useWindowStore } from './stores/useWindowStore';
import { useThemeStore } from './stores/useThemeStore';
import { useDesktopStore } from './stores/useDesktopStore';

function App() {
  const windows = useWindowStore(state => state.windows);
  const loadWindows = useWindowStore(state => state.loadWindows);
  const loadPreferences = useThemeStore(state => state.loadPreferences);
  const loadIcons = useDesktopStore(state => state.loadIcons);
  const themeLoaded = useThemeStore(state => state.isLoaded);
  const desktopLoaded = useDesktopStore(state => state.isLoaded);
  const windowsLoaded = useWindowStore(state => state.isLoaded);

  useEffect(() => {
    loadPreferences();
    loadIcons();
    loadWindows();
  }, [loadPreferences, loadIcons, loadWindows]);

  if (!themeLoaded || !desktopLoaded || !windowsLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--color-desktop-background)' }}>
        <div className="text-white text-lg">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden">
      <Desktop />
      
      {windows.map(window => (
        <Window key={window.id} windowState={window} />
      ))}
      
      <Taskbar />
    </div>
  );
}

export default App;

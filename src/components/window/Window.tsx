import React, { useState, useRef, useCallback, useEffect } from 'react';
import { WindowState } from '../../types';
import WindowTitlebar from './WindowTitlebar';
import { useWindowStore } from '../../stores/useWindowStore';
import { useAppStore } from '../../stores/useAppStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { themes } from '../../utils/themes';

interface WindowProps {
  windowState: WindowState;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

const Window: React.FC<WindowProps> = ({ windowState }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0, winX: 0, winY: 0 });

  const windowRef = useRef<HTMLDivElement>(null);
  const { id, appId, title, x, y, width, height, isMinimized, isMaximized, zIndex } = windowState;

  const activeWindowId = useWindowStore(state => state.activeWindowId);
  const focusWindow = useWindowStore(state => state.focusWindow);
  const moveWindow = useWindowStore(state => state.moveWindow);
  const resizeWindow = useWindowStore(state => state.resizeWindow);
  const minimizeWindow = useWindowStore(state => state.minimizeWindow);
  const maximizeWindow = useWindowStore(state => state.maximizeWindow);
  const restoreWindow = useWindowStore(state => state.restoreWindow);
  const closeWindow = useWindowStore(state => state.closeWindow);

  const getAppConfig = useAppStore(state => state.getAppConfig);
  const getAppComponent = useAppStore(state => state.getAppComponent);
  const theme = useThemeStore(state => state.theme);

  const appConfig = getAppConfig(appId);
  const AppComponent = getAppComponent(appId);
  const themeConfig = themes[theme];
  const isActive = activeWindowId === id;
  const taskbarHeight = themeConfig.taskbarHeight;

  const handleTitlebarMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (isMaximized) return;
    e.preventDefault();
    focusWindow(id);
    
    const rect = windowRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
  }, [id, focusWindow, isMaximized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      const newX = Math.max(0, Math.min(window.innerWidth - 100, e.clientX - dragOffset.x));
      const newY = Math.max(0, Math.min(window.innerHeight - taskbarHeight - 50, e.clientY - dragOffset.y));
      moveWindow(id, newX, newY);
    }

    if (isResizing && resizeDirection) {
      const deltaX = e.clientX - resizeStart.x;
      const deltaY = e.clientY - resizeStart.y;
      
      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = resizeStart.winX;
      let newY = resizeStart.winY;

      if (resizeDirection.includes('e')) {
        newWidth = Math.max(320, resizeStart.width + deltaX);
      }
      if (resizeDirection.includes('w')) {
        newWidth = Math.max(320, resizeStart.width - deltaX);
        newX = Math.max(0, resizeStart.winX + deltaX);
      }
      if (resizeDirection.includes('s')) {
        newHeight = Math.max(240, resizeStart.height + deltaY);
      }
      if (resizeDirection.includes('n')) {
        newHeight = Math.max(240, resizeStart.height - deltaY);
        newY = Math.max(0, resizeStart.winY + deltaY);
      }

      resizeWindow(id, newWidth, newHeight);
      if (resizeDirection.includes('w') || resizeDirection.includes('n')) {
        moveWindow(id, newX, newY);
      }
    }
  }, [isDragging, isResizing, resizeDirection, dragOffset, resizeStart, id, moveWindow, resizeWindow, taskbarHeight]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection(null);
  }, []);

  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    if (e.button !== 0) return;
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    focusWindow(id);

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width,
      height,
      winX: x,
      winY: y,
    });
    setResizeDirection(direction);
    setIsResizing(true);
  }, [id, x, y, width, height, focusWindow, isMaximized]);

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleTitlebarDoubleClick = () => {
    if (isMaximized) {
      restoreWindow(id);
    } else {
      maximizeWindow(id);
    }
  };

  const handleWindowClick = () => {
    if (!isActive) {
      focusWindow(id);
    }
  };

  if (isMinimized) {
    return null;
  }

  const resizeHandles: { direction: ResizeDirection; className: string }[] = [
    { direction: 'n', className: 'top-0 left-0 right-0 h-2 cursor-n-resize' },
    { direction: 's', className: 'bottom-0 left-0 right-0 h-2 cursor-s-resize' },
    { direction: 'e', className: 'top-0 right-0 bottom-0 w-2 cursor-e-resize' },
    { direction: 'w', className: 'top-0 left-0 bottom-0 w-2 cursor-w-resize' },
    { direction: 'ne', className: 'top-0 right-0 w-4 h-4 cursor-ne-resize' },
    { direction: 'nw', className: 'top-0 left-0 w-4 h-4 cursor-nw-resize' },
    { direction: 'se', className: 'bottom-0 right-0 w-4 h-4 cursor-se-resize' },
    { direction: 'sw', className: 'bottom-0 left-0 w-4 h-4 cursor-sw-resize' },
  ];

  return (
    <div
      ref={windowRef}
      className="absolute flex flex-col overflow-hidden rounded transition-shadow duration-200"
      style={{
        left: isMaximized ? 0 : x,
        top: isMaximized ? 0 : y,
        width: isMaximized ? '100%' : width,
        height: isMaximized ? `calc(100% - ${taskbarHeight}px)` : height,
        zIndex,
        background: 'var(--color-window-background)',
        border: 'var(--border-window)',
        boxShadow: isActive ? 'var(--shadow-window-active)' : 'var(--shadow-window)',
      }}
      onClick={handleWindowClick}
    >
      <WindowTitlebar
        title={title}
        icon={appConfig?.icon}
        isActive={isActive}
        isMaximized={isMaximized}
        onMinimize={() => minimizeWindow(id)}
        onMaximize={() => isMaximized ? restoreWindow(id) : maximizeWindow(id)}
        onClose={() => closeWindow(id)}
        onMouseDown={handleTitlebarMouseDown}
        onDoubleClick={handleTitlebarDoubleClick}
      />

      <div className="flex-1 overflow-hidden relative">
        {AppComponent ? (
          <React.Suspense fallback={
            <div className="flex items-center justify-center w-full h-full" style={{ color: 'var(--color-text-secondary)' }}>
              加载中...
            </div>
          }>
            <AppComponent />
          </React.Suspense>
        ) : (
          <div className="flex items-center justify-center w-full h-full" style={{ color: 'var(--color-text-secondary)' }}>
            应用加载失败
          </div>
        )}
      </div>

      {!isMaximized && resizeHandles.map(({ direction, className }) => (
        <div
          key={direction}
          className={`absolute z-10 ${className}`}
          onMouseDown={(e) => handleResizeStart(e, direction)}
        />
      ))}
    </div>
  );
};

export default Window;

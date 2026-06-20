import { useState } from 'react';
import {
  Home,
  List,
  AlertTriangle,
  ClipboardList,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';

interface PageLayoutProps {
  children: React.ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const location = useLocation();
  const { isMuted, toggleMute } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: '控制台', icon: Home },
    { path: '/issues', label: '问题记录', icon: AlertTriangle },
    { path: '/checklist', label: '排练清单', icon: ClipboardList },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-stage-bg text-stage-text overflow-hidden">
      {/* 侧边栏 */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-stage-bg-secondary border-r border-stage-border flex flex-col transition-all duration-300 flex-shrink-0`}
      >
        {/* Logo 区域 */}
        <div className="h-20 flex items-center justify-center border-b border-stage-border">
          {sidebarOpen ? (
            <h1 className="text-2xl font-bold text-neon-green tracking-wider">
              PROP·STATION
            </h1>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-neon-green/20 flex items-center justify-center">
              <List className="w-6 h-6 text-neon-green" />
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 py-6 px-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-200 text-lg ${
                  active
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30'
                    : 'text-stage-text-secondary hover:bg-stage-bg-hover hover:text-stage-text'
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* 底部控制区 */}
        <div className="p-3 border-t border-stage-border space-y-2">
          <button
            onClick={toggleMute}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
              isMuted
                ? 'text-stage-text-secondary hover:bg-stage-bg-hover'
                : 'bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30'
            }`}
          >
            {isMuted ? (
              <VolumeX className="w-6 h-6 flex-shrink-0" />
            ) : (
              <Volume2 className="w-6 h-6 flex-shrink-0" />
            )}
            {sidebarOpen && (
              <span className="font-medium">{isMuted ? '静音模式' : '声音开启'}</span>
            )}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl text-stage-text-secondary hover:bg-stage-bg-hover transition-all"
          >
            {sidebarOpen ? '收起菜单' : '展开'}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部状态栏 */}
        <header className="h-20 bg-stage-bg-secondary border-b border-stage-border flex items-center justify-between px-8 flex-shrink-0">
          <div className="text-lg text-stage-text-secondary">
            后台道具交接台
          </div>
          <div className="flex items-center gap-4">
            <div className="text-stage-text-muted text-sm">
              {new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </div>
  );
}

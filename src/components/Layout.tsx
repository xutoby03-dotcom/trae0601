import { ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { VolumeX, Home, MessageSquare, BarChart3 } from 'lucide-react';

const tabs = [
  { label: '首页', icon: Home, path: '/' },
  { label: '话术', icon: MessageSquare, path: '/scripts' },
  { label: '统计', icon: BarChart3, path: '/stats' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  return (
    <div className="max-w-[1024px] mx-auto min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <header className="sticky top-0 z-10 bg-white shadow-sm flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-lg font-bold text-slate-800">
          <VolumeX className="w-5 h-5 text-teal-600" />
          安静社区
        </div>
      </header>

      <main className="flex-1 px-4 py-4">{children}</main>

      <nav className="sticky bottom-0 z-10 bg-white shadow-[0_-1px_4px_rgba(0,0,0,0.08)] flex justify-around py-2">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-0.5 text-xs transition-colors ${
                active ? 'text-teal-600' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

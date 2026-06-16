import { NavLink, useLocation } from 'react-router-dom';
import { Umbrella, CalendarPlus, Wrench, BarChart3, Home, Droplets } from 'lucide-react';
import { useStore } from '@/store';

const navItems = [
  { path: '/', label: '今日借用', icon: Home },
  { path: '/borrow', label: '借用登记', icon: CalendarPlus },
  { path: '/repair', label: '维修管理', icon: Wrench },
  { path: '/stats', label: '统计分析', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const canopies = useStore((s) => s.canopies);
  const markCanopyDry = useStore((s) => s.markCanopyDry);

  const dryingCount = canopies.filter((c) => c.status === 'drying').length;
  const dryingCanopies = canopies.filter((c) => c.status === 'drying');

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 bg-gradient-to-b from-primary-800 to-primary-900 text-white flex flex-col">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-primary-700/50">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
            <Umbrella size={20} />
          </div>
          <div>
            <div className="font-semibold text-[15px]">雨棚管理系统</div>
            <div className="text-xs text-primary-200">物业仓库</div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary-600/70 text-white shadow-inner'
                    : 'text-primary-100 hover:bg-primary-700/50 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {dryingCount > 0 && (
          <div className="mx-3 mb-4 p-3 rounded-lg bg-amber-500/20 border border-amber-400/30">
            <div className="flex items-center gap-2 text-amber-200 text-xs font-medium mb-2">
              <Droplets size={14} />
              待晾干 ({dryingCount})
            </div>
            <div className="space-y-1.5">
              {dryingCanopies.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-primary-100">{c.name}</span>
                  <button
                    onClick={() => markCanopyDry(c.id)}
                    className="text-amber-200 hover:text-white underline underline-offset-2"
                  >
                    标记晾干
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6">
          <h1 className="text-lg font-semibold text-gray-900">
            {navItems.find(
              (n) => (n.path === '/' && location.pathname === '/') ||
                (n.path !== '/' && location.pathname.startsWith(n.path))
            )?.label || '雨棚管理'}
          </h1>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}

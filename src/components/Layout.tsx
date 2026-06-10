import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, Settings, ShieldAlert } from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/add', label: '添加证件', icon: PlusCircle },
  { path: '/statistics', label: '统计', icon: BarChart3 },
  { path: '/settings', label: '设置', icon: Settings },
];

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 md:min-h-screen bg-primary-500 text-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-white/20 rounded-lg">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold">证件管家</h1>
              <p className="text-xs text-primary-100">到期提醒 · 从容办理</p>
            </div>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-primary-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:block p-6 mt-auto">
          <div className="bg-primary-400/30 rounded-xl p-4">
            <p className="text-xs text-primary-100 mb-1">💡 温馨提示</p>
            <p className="text-sm text-white/90">
              建议定期检查证件状态，提前办理避免影响使用。
            </p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 min-h-screen">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-primary-500' : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="md:hidden h-20" />
    </div>
  );
};

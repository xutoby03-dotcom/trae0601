import { NavLink } from 'react-router-dom';
import { Coffee, ClipboardList, Thermometer, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/', label: '茶桶档案', icon: Coffee },
  { path: '/batches', label: '批次记录', icon: ClipboardList },
  { path: '/inspection', label: '巡查记录', icon: Thermometer },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-gradient-to-r from-tea-600 to-tea-700 text-white shadow-tea-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold">煮茶桶保温巡查系统</h1>
                <p className="text-xs text-tea-100">茶汤品质管理</p>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm text-tea-100">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b border-tea-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                      isActive
                        ? 'border-tea-500 text-tea-600 bg-tea-50'
                        : 'border-transparent text-gray-600 hover:text-tea-600 hover:bg-tea-50/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <footer className="bg-tea-800 text-tea-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>© 2024 煮茶桶保温巡查系统 · 守护每一杯好茶</p>
        </div>
      </footer>
    </div>
  );
}

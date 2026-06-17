import { NavLink, Outlet } from 'react-router-dom';
import { Cylinder, Wind, AlertTriangle, BarChart3 } from 'lucide-react';

const navItems = [
  { path: '/cylinders', label: '气瓶管理', icon: Cylinder },
  { path: '/inflation', label: '充气操作', icon: Wind },
  { path: '/abnormal', label: '异常登记', icon: AlertTriangle },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center">
                <Cylinder className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg text-primary-950">氦气管家</h1>
                <p className="text-xs text-slate-500">派对小店气瓶管理系统</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="container py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-4 py-1.5 text-xs font-medium transition-colors ${
                    isActive ? 'text-primary-600' : 'text-slate-400'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

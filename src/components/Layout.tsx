import { LayoutDashboard, Calculator, HandCoins, TrendingUp, Receipt, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard, end: true },
  { path: '/registers', label: '收银台档案', icon: Calculator },
  { path: '/handovers', label: '交接记录', icon: HandCoins },
  { path: '/transactions', label: '资金异动', icon: Receipt },
  { path: '/statistics', label: '统计分析', icon: TrendingUp },
];

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentTitle = navItems.find((item) => {
    if (item.end) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  })?.label || '系统';

  return (
    <div className="min-h-screen bg-warm-50 flex">
      <aside
        className={`${
          collapsed ? 'w-16' : 'w-60'
        } bg-white border-r border-warm-200 flex flex-col transition-all duration-300 fixed h-full z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-warm-200">
          {!collapsed && (
            <div className="font-serif font-bold text-lg text-primary-700">备用金管理</div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-warm-100 text-gray-500"
          >
            {collapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-warm-100'
                }`
              }
            >
              <item.icon size={20} />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {!collapsed && (
          <div className="p-4 border-t border-warm-200 text-xs text-gray-400">
            © 2026 小店备用金管理系统
          </div>
        )}
      </aside>

      <div className={`flex-1 ${collapsed ? 'ml-16' : 'ml-60'} transition-all duration-300`}>
        <header className="h-16 bg-white border-b border-warm-200 flex items-center px-6 sticky top-0 z-10">
          <div className="text-sm text-gray-500">
            <span>首页</span>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{currentTitle}</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-800">店长</div>
              <div className="text-xs text-gray-400">管理员权限</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              店
            </div>
          </div>
        </header>

        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

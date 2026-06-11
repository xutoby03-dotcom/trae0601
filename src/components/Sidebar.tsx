import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Plus, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const navItems = [
    { path: '/dashboard', label: '首页概览', icon: LayoutDashboard },
    { path: '/vendors', label: '摊主管理', icon: Users },
    { path: '/vendors/new', label: '新增摊主', icon: Plus },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">周末广场</h1>
            <p className="text-xs text-slate-400">摊位管理台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 bg-slate-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">管</span>
          </div>
          <div>
            <p className="text-sm font-medium">管理员</p>
            <p className="text-xs text-slate-400">admin@plaza.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

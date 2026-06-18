import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, PackagePlus, PackageSearch, BarChart3, Grid3x3,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '首页概览', icon: LayoutDashboard },
  { to: '/register', label: '包裹登记', icon: PackagePlus },
  { to: '/pickup', label: '取件操作', icon: PackageSearch },
  { to: '/lockers', label: '柜格管理', icon: Grid3x3 },
  { to: '/stats', label: '数据统计', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-primary-500 flex items-center justify-center">
            <PackagePlus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800">快递暂存柜</h1>
            <p className="text-xs text-slate-400">Parcel Locker System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-card'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" strokeWidth={2} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="text-xs text-slate-400">
          © 2026 前台快递管理系统
        </div>
      </div>
    </aside>
  );
}

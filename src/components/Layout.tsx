import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Wrench,
  ArrowLeftRight,
  Cpu,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { to: '/dashboard', label: '统计看板', icon: LayoutDashboard },
  { to: '/devices', label: '设备档案', icon: Package },
  { to: '/borrows', label: '借用管理', icon: ClipboardList },
  { to: '/returns', label: '归还验收', icon: ArrowLeftRight },
  { to: '/repairs', label: '维修管理', icon: Wrench },
];

const breadcrumbMap: Record<string, string> = {
  dashboard: '统计看板',
  devices: '设备档案',
  'devices-new': '新增设备',
  'devices-detail': '设备详情',
  borrows: '借用管理',
  'borrows-new': '发起借用',
  returns: '归还验收',
  repairs: '维修管理',
  'repairs-new': '新建维修单',
  'repairs-detail': '维修详情',
};

export default function Layout() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const crumbs = pathParts.map((part, idx) => ({
    key: part,
    label: breadcrumbMap[pathParts.slice(0, idx + 1).join('-')] || part,
  }));

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-60 bg-gradient-to-b from-brand-900 to-brand-700 text-white flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-base leading-tight">设备借修台</div>
            <div className="text-xs text-white/60">Equipment Manager</div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-white/15 text-white shadow-inner'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-sm font-semibold">
              行
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">行政管理员</div>
              <div className="text-xs text-white/60 truncate">admin@company.com</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            {crumbs.map((crumb, idx) => (
              <span key={crumb.key} className="flex items-center gap-2">
                {idx > 0 && <span className="text-slate-300">/</span>}
                <span className={idx === crumbs.length - 1 ? 'text-slate-800 font-medium' : ''}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </div>
          <div className="text-sm text-slate-500">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

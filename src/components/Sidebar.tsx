import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  RefreshCcw,
  Package,
  Settings,
  Wind,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '首页概览' },
  { path: '/devices', icon: Cpu, label: '设备档案' },
  { path: '/replacements', icon: RefreshCcw, label: '更换记录' },
  { path: '/inventory', icon: Package, label: '滤芯库存' },
  { path: '/settings', icon: Settings, label: '告警设置' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-surface-border p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-11 h-11 rounded-2xl bg-btn-primary flex items-center justify-center shadow-btn-primary">
          <Wind className="w-6 h-6 text-white" strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="text-lg font-black text-brand-700 leading-tight">
            滤芯管家
          </h1>
          <p className="text-xs text-brand-400">Air Filter Manager</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`
            }
          >
            <Icon className="w-5 h-5" strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-5 border-t border-surface-border">
        <div className="px-3 py-3 rounded-xl bg-brand-50/70">
          <p className="text-xs text-brand-500 font-medium mb-1">今日模拟日期</p>
          <p className="text-base font-bold text-brand-700 font-mono">
            2026-06-19 周五
          </p>
        </div>
      </div>
    </aside>
  );
}

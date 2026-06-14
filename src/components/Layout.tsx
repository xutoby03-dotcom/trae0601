import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ListTodo,
  Plus,
  Activity,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getOverdueEquipment, getUpcomingEquipment } from '@/utils/maintenance';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '仪表盘', icon: LayoutDashboard },
  { to: '/equipment', label: '装备档案', icon: Package },
  { to: '/usage', label: '使用记录', icon: ListTodo },
];

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const equipment = useAppStore((s) => s.equipment);
  const usageRecords = useAppStore((s) => s.usageRecords);
  const resetData = useAppStore((s) => s.resetData);

  const overdue = getOverdueEquipment(equipment, usageRecords);
  const upcoming = getUpcomingEquipment(equipment, usageRecords);
  const alertCount = overdue.length + upcoming.length;

  return (
    <div className="min-h-screen bg-warm-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-warm-200 flex flex-col fixed h-full z-20">
        <div className="p-6 border-b border-warm-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <Activity className="text-white" size={22} />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold text-warm-900 leading-tight">
                GearCare
              </h1>
              <p className="text-xs text-warm-500">运动装备保养管家</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              (item.to === '/' && location.pathname === '/') ||
              (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn('nav-link group relative', isActive && 'nav-link-active')}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.to === '/' && alertCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                    {alertCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-warm-100 space-y-3">
          <NavLink
            to="/usage/new"
            className={({ isActive }) =>
              cn(
                'w-full btn-primary text-sm',
                isActive && 'ring-2 ring-brand-400 ring-offset-2'
              )
            }
          >
            <Plus size={16} />
            记录使用
          </NavLink>
          <button
            onClick={() => {
              if (confirm('确定要重置所有数据到初始状态吗？')) {
                resetData();
              }
            }}
            className="w-full btn-ghost text-xs text-warm-500 hover:text-warm-700"
          >
            <RotateCcw size={14} />
            重置数据
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="container max-w-7xl py-8 px-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;

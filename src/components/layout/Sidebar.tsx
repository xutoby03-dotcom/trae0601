import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  MessageSquareWarning,
  Wrench,
  Droplets,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '看板首页', icon: LayoutDashboard },
  { path: '/rooms', label: '房间档案', icon: Building2 },
  { path: '/inspections', label: '巡检记录', icon: ClipboardList },
  { path: '/complaints', label: '投诉管理', icon: MessageSquareWarning },
  { path: '/repairs', label: '维修管理', icon: Wrench },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-dark-900 text-white min-h-screen flex flex-col border-r border-dark-800">
      <div className="p-6 border-b border-dark-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-warning-400 to-warning-600 rounded-xl flex items-center justify-center">
            <Droplets className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg">热水器巡检</h1>
            <p className="text-xs text-dark-400">民宿设备管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-warning-500/20 text-warning-400 font-medium'
                  : 'text-dark-300 hover:bg-dark-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-800">
        <div className="bg-dark-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-500/30 rounded-full flex items-center justify-center">
              <span className="text-primary-300 text-sm font-medium">管</span>
            </div>
            <div>
              <p className="text-sm font-medium">管理员</p>
              <p className="text-xs text-dark-400">admin@hotel.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Calendar,
  Package,
  Video,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Camera as CameraIcon,
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import { useEquipmentStore } from '../../store/equipmentStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '看板首页' },
  { path: '/equipment', icon: Camera, label: '器材档案' },
  { path: '/missions', icon: Calendar, label: '出行任务' },
  { path: '/missions/active/pack', icon: Package, label: '打包确认' },
  { path: '/missions/active/shooting', icon: Video, label: '拍摄记录' },
  { path: '/missions/active/return', icon: RotateCcw, label: '归还检查' },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { currentUser } = useEquipmentStore();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div
      className={cn(
        'h-screen bg-background-lighter border-r border-neutral-800 flex flex-col transition-all duration-300',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
            <CameraIcon size={20} className="text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-lg text-white whitespace-nowrap">
                器材管家
              </h1>
              <p className="text-xs text-neutral-500 whitespace-nowrap">
                摄影器材管理系统
              </p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                active
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50 border border-transparent'
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  'flex-shrink-0 transition-transform',
                  active && 'scale-110'
                )}
              />
              {!collapsed && (
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-neutral-800 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-600 to-neutral-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold text-sm">
              {currentUser?.name.charAt(0)}
            </span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-medium text-white whitespace-nowrap">
                {currentUser?.name}
              </p>
              <p className="text-xs text-neutral-500 whitespace-nowrap">
                {currentUser?.role === 'admin' ? '管理员' : '成员'}
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-6 h-12 bg-background-lighter border border-neutral-700 rounded-r-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors z-10"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </div>
  );
}

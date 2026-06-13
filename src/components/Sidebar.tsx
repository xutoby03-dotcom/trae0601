import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Battery,
  ArrowRightLeft,
  Undo2,
  FileText,
} from 'lucide-react';
import { cn } from '../lib/utils';

const menuItems = [
  {
    path: '/dashboard',
    label: '数据看板',
    icon: LayoutDashboard,
  },
  {
    path: '/devices',
    label: '设备档案',
    icon: Battery,
  },
  {
    path: '/lending',
    label: '借出管理',
    icon: ArrowRightLeft,
  },
  {
    path: '/return',
    label: '归还管理',
    icon: Undo2,
  },
  {
    path: '/compensation',
    label: '赔付记录',
    icon: FileText,
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col z-50">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Battery className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold">充电宝管理</h1>
            <p className="text-xs text-slate-400">社区活动中心</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + '/');

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )}
              />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-xl p-4">
          <p className="text-xs text-slate-400 mb-2">系统状态</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-slate-300">运行正常</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

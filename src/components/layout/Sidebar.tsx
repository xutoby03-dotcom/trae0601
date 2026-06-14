import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shirt,
  ClipboardList,
  RotateCcw,
  BarChart3,
  Bell,
} from 'lucide-react';
import { useAppStore } from '../../stores/appStore';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/costumes', label: '服装档案', icon: Shirt },
  { path: '/borrow', label: '借出登记', icon: ClipboardList },
  { path: '/borrow/records', label: '借出记录', icon: ClipboardList },
  { path: '/return', label: '归还检查', icon: RotateCcw },
  { path: '/statistics', label: '统计报表', icon: BarChart3 },
  { path: '/notifications', label: '消息通知', icon: Bell },
];

export default function Sidebar() {
  const location = useLocation();
  const overdueCount = useAppStore((state) => state.overdueCount);

  return (
    <aside className="w-64 bg-navy-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-navy-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shirt className="w-6 h-6 text-primary-400" />
          <span>社团服装管理</span>
        </h1>
        <p className="text-navy-400 text-sm mt-1">Costume Management</p>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1">
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
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                  : 'text-navy-300 hover:bg-navy-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
              {item.path === '/notifications' && overdueCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {overdueCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-navy-700">
        <div className="bg-navy-800 rounded-lg p-4">
          <p className="text-navy-400 text-xs">当前用户</p>
          <p className="text-white font-medium">管理员</p>
        </div>
      </div>
    </aside>
  );
}

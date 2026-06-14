import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Bell,
  RotateCcw,
  BarChart3,
  Home,
} from 'lucide-react';
import { cn } from '@/utils/helpers';

const navItems = [
  { path: '/', label: '总览看板', icon: LayoutDashboard },
  { path: '/inspections', label: '巡查记录', icon: ClipboardList },
  { path: '/notifications', label: '通知管理', icon: Bell },
  { path: '/recheck', label: '复查列表', icon: RotateCcw },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-800 text-white h-screen fixed left-0 top-0 flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-lg">楼道清理看板</h1>
            <p className="text-xs text-slate-400">Corridor Cleanup</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              )}
            >
              <Icon className={cn('w-5 h-5 transition-transform', isActive && 'scale-110')} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-700/50 rounded-lg p-4">
          <p className="text-sm text-slate-300 mb-2">消防安全提示</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            保持消防通道畅通，是每个居民的责任。发现消防通道被占用请及时上报。
          </p>
        </div>
      </div>
    </aside>
  );
}

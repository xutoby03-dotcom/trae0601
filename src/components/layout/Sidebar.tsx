import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Syringe,
  BarChart3,
  Baby,
  RotateCcw,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/children', label: '孩子档案', icon: Users },
  { path: '/vaccines', label: '疫苗计划', icon: Syringe },
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const resetWithMock = useAppStore((s) => s.resetWithMock);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 left-0 flex flex-col p-4 bg-gradient-to-b from-primary-50/60 via-white/40 to-accent-50/40 border-r border-white/50 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-4 mb-6">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
          <Baby className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-display text-lg text-slate-800 leading-tight">
            疫苗管家
          </h1>
          <p className="text-xs text-slate-500">守护每一次成长</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={isActive(item.path) ? 'nav-item-active' : 'nav-item'}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/50">
        <button
          onClick={() => {
            if (confirm('确定要重置所有数据为示例数据吗？')) {
              resetWithMock();
            }
          }}
          className="nav-item w-full text-slate-500 hover:text-danger-600 hover:bg-danger-50"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-sm">重置示例数据</span>
        </button>
        <p className="px-4 pt-3 text-xs text-slate-400 text-center">
          数据保存在浏览器本地
        </p>
      </div>
    </aside>
  );
}

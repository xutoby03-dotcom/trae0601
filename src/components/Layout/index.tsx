import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardCheck,
  ListTodo,
  Waves,
  Menu,
  X,
  Bell,
  User,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import { isSummerPeak, getDaysUntilSummerEnd } from '@/utils/dateUtils';

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/equipment', label: '器材档案', icon: Package },
  { path: '/inspection', label: '点检管理', icon: ClipboardCheck },
  { path: '/tasks', label: '任务中心', icon: ListTodo },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const isReady = useAppStore((state) => state.isPoolReady());
  const tasks = useAppStore((state) => state.tasks);
  const equipments = useAppStore((state) => state.equipments);
  const pendingTaskCount = tasks.filter((t) => t.status === 'pending').length;
  const abnormalCount = equipments.filter(
    (e) => e.status === 'abnormal' || e.status === 'maintaining'
  ).length;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-primary-700 to-primary-900 text-white transition-all duration-300 flex flex-col shadow-xl`}
      >
        <div className="p-5 flex items-center gap-3 border-b border-primary-600/30">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Waves className="w-6 h-6" />
          </div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-lg leading-tight">泳池救援器材</h1>
              <p className="text-xs text-primary-200">点检管理系统</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-primary-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'animate-float' : ''}`} />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                {sidebarOpen && item.path === '/tasks' && pendingTaskCount > 0 && (
                  <span className="ml-auto bg-safety-red text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingTaskCount}
                  </span>
                )}
                {sidebarOpen && item.path === '/dashboard' && abnormalCount > 0 && (
                  <span className="ml-auto bg-safety-orange text-white text-xs px-2 py-0.5 rounded-full animate-pulse-slow">
                    {abnormalCount}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {sidebarOpen && isSummerPeak() && (
          <div className="mx-3 mb-4 p-4 bg-gradient-to-r from-safety-orange to-orange-500 rounded-xl text-white text-sm shadow-lg">
            <p className="font-bold mb-1 flex items-center gap-2">
              <Bell className="w-4 h-4" /> 暑期高峰
            </p>
            <p className="text-orange-100">距离暑期结束还有 {getDaysUntilSummerEnd()} 天</p>
          </div>
        )}

        <div className="p-4 border-t border-primary-600/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">张安全</p>
                <p className="text-xs text-primary-200 truncate">物业管理员</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {navItems.find((item) => location.pathname.startsWith(item.path))?.label || '系统'}
              </h2>
              <p className="text-sm text-slate-500">
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`px-4 py-2 rounded-xl flex items-center gap-2 font-medium ${
                isReady
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200 animate-pulse-slow'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isReady ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                }`}
              />
              {isReady ? '泳池状态：正常开放' : '泳池状态：异常告警'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CheckSquare, AlertTriangle, BarChart3, Menu, X, Bell } from 'lucide-react';
import { useExceptionStore } from '@/store/exceptionStore';
import { useElderlyStore } from '@/store/elderlyStore';
import { useCheckInStore } from '@/store/checkInStore';
import { getToday } from '@/utils/date';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '首页' },
  { path: '/elderly', icon: Users, label: '老人信息' },
  { path: '/checkin', icon: CheckSquare, label: '确认登记' },
  { path: '/exceptions', icon: AlertTriangle, label: '异常处理' },
  { path: '/report', icon: BarChart3, label: '周报统计' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { exceptions, initExceptions } = useExceptionStore();
  const { elderlyList, initElderly } = useElderlyStore();
  const { initCheckIns, getTodayUnconfirmed } = useCheckInStore();

  useEffect(() => {
    initExceptions();
    initElderly();
    initCheckIns();
  }, [initExceptions, initElderly, initCheckIns]);

  const today = getToday();
  const allElderlyIds = elderlyList.map(e => e.id);
  const todayUnconfirmedIds = getTodayUnconfirmed(allElderlyIds);
  const escalatedCount = exceptions.filter(e => e.status === 'escalated' && e.type === 'timeout' && e.exceptionDate === today && todayUnconfirmedIds.includes(e.elderlyId)).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 flex flex-col shrink-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <span className="text-blue-900 text-xl font-bold">老</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-lg">平安守护</h1>
                <p className="text-xs text-blue-200">网格员管理系统</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={22} className="shrink-0" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
              {sidebarOpen && item.path === '/exceptions' && escalatedCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {escalatedCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-lg">
                👤
              </div>
              <div>
                <p className="font-medium">网格员小张</p>
                <p className="text-xs text-blue-200">第一网格</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {navItems.find(n => n.path === location.pathname)?.label || '首页'}
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
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={22} className="text-slate-600" />
              {escalatedCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

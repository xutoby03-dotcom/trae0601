import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Settings, Search } from 'lucide-react';
import { usePickupStore } from '@/stores/pickupStore';
import { useStudentStore } from '@/stores/studentStore';

const pageTitles: Record<string, string> = {
  '/dashboard': '工作台',
  '/students': '学生过敏档案',
  '/students/new': '新增学生档案',
  '/menu': '每日菜单管理',
  '/prep': '后厨备餐中心',
  '/pickup': '领取登记',
  '/statistics': '数据统计',
};

export default function Layout() {
  const location = useLocation();
  const { getTodayStats } = usePickupStore();
  const { students } = useStudentStore();
  const todayStats = getTodayStats();

  const getPageTitle = () => {
    if (location.pathname.startsWith('/students/') && location.pathname !== '/students/new') {
      return '学生档案详情';
    }
    return pageTitles[location.pathname] || '过敏餐管理系统';
  };

  const unconfirmed = students.filter((s) => !s.guardianConfirmed).length;
  const notPicked = todayStats.notPicked + todayStats.wrongPick;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
            <div className="text-sm text-slate-500 hidden md:flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>
                {new Date().toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="搜索学生姓名、班级..."
                className="w-64 pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Bell size={18} className="text-slate-600" />
              {(unconfirmed > 0 || notPicked > 0) && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-danger-500 animate-pulse"></span>
              )}
            </button>

            <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <Settings size={18} className="text-slate-600" />
            </button>

            {notPicked > 0 && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-danger-50 border border-danger-200">
                <span className="w-2 h-2 rounded-full bg-danger-500 animate-pulse"></span>
                <span className="text-xs font-medium text-danger-700">
                  {notPicked} 条异常待处理
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}

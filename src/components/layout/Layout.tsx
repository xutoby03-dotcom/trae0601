import {
  LayoutDashboard,
  PackagePlus,
  Boxes,
  ClipboardList,
  HandCoins,
  AlertTriangle,
  Bell,
  User,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, useMemo } from 'react';
import { usePackageStore } from '@/store/packageStore';
import { useReminderStore } from '@/store/reminderStore';
import { cn, formatDateTime } from '@/utils';

const navItems = [
  { to: '/', label: '数据看板', icon: LayoutDashboard, end: true },
  { to: '/shelves', label: '货架档案', icon: Boxes },
  { to: '/packages', label: '包裹管理', icon: ClipboardList },
  { to: '/packages/register', label: '登记包裹', icon: PackagePlus },
  { to: '/pickup', label: '取件操作', icon: HandCoins },
  { to: '/exceptions', label: '异常记录', icon: AlertTriangle },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  const packages = usePackageStore((s) => s.packages);
  const logs = useReminderStore((s) => s.logs);
  const checkRef = useRef(useReminderStore.getState().checkAndTriggerReminders);

  const delayedCount = useMemo(() => {
    const T24 = 24 * 3600 * 1000;
    const now = Date.now();
    let count = 0;
    for (let i = 0; i < packages.length; i++) {
      const p = packages[i];
      if (p.status === 'stored' && now - new Date(p.storedAt).getTime() >= T24) count++;
    }
    return count;
  }, [packages]);

  const todayReminders = useMemo(() => {
    const today = new Date().toDateString();
    let auto = 0;
    let manual = 0;
    for (let i = 0; i < logs.length; i++) {
      if (new Date(logs[i].remindedAt).toDateString() === today) {
        if (logs[i].type === 'manual_72h') manual++;
        else auto++;
      }
    }
    return { auto, manual };
  }, [logs]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const check = () => checkRef.current();
    check();
    const interval = setInterval(check, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white transform transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-700/50">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-sm tracking-wide">快递架管家</div>
              <div className="text-[10px] text-slate-400">滞留提醒系统</div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-700/50 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-lg shadow-indigo-900/30'
                    : 'text-slate-300 hover:bg-slate-700/40 hover:text-white',
                )
              }
            >
              <item.icon className="w-4.5 h-4.5 shrink-0" />
              <span>{item.label}</span>
              {item.to === '/exceptions' && delayedCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                  {delayedCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">张建国</div>
              <div className="text-[11px] text-slate-400 truncate">东门岗 · 值班中</div>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center gap-4 px-4 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-100 border-0 text-sm focus:ring-2 focus:ring-indigo-500/30 focus:bg-white transition-all"
                placeholder="搜索收件人、手机号、取件码..."
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
                <Bell className="w-5 h-5" />
                {delayedCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              {(todayReminders.auto > 0 || todayReminders.manual > 0) && (
                <div className="absolute right-0 mt-2 w-72 p-3 rounded-xl bg-white shadow-xl border border-slate-200 text-sm hidden group-hover:block">
                  <div className="font-semibold text-slate-800 mb-2">今日提醒</div>
                  <div className="space-y-1.5 text-slate-600">
                    <div>自动提醒：{todayReminders.auto} 条</div>
                    <div>人工处理：{todayReminders.manual} 条</div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:block text-right leading-tight">
              <div className="text-sm font-medium text-slate-700">
                {formatDateTime(currentTime.toISOString())}
              </div>
              <div className="text-[11px] text-slate-400">系统运行正常</div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

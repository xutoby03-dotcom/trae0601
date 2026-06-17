import { NavLink, Outlet } from 'react-router-dom';
import {
  CalendarDays,
  Users,
  Package,
  AlertTriangle,
  BarChart3,
  Heart,
  Clock,
} from 'lucide-react';
import { useWeddingStore } from '@/store/weddingStore';
import { useEffect, useMemo } from 'react';

const navItems = [
  { path: '/', label: '时间线', icon: CalendarDays },
  { path: '/members', label: '成员', icon: Users },
  { path: '/items', label: '物品交接', icon: Package },
  { path: '/monitor', label: '协调监控', icon: AlertTriangle },
  { path: '/workload', label: '负载统计', icon: BarChart3 },
];

export default function Layout() {
  const currentTime = useWeddingStore(state => state.currentTime);
  const setCurrentTime = useWeddingStore(state => state.setCurrentTime);
  const tasks = useWeddingStore(state => state.tasks);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, [setCurrentTime]);

  const { lateTasks, pendingTasks, alertCount } = useMemo(() => {
    const late = tasks.filter(t => t.status === 'late');
    const pending = tasks.filter(t => t.status === 'pending');
    const currentMinutes = parseInt(currentTime.replace(':', ''));
    const overduePending = pending.filter(t => {
      const remindMinutes = parseInt(t.remindTime.replace(':', ''));
      return remindMinutes <= currentMinutes;
    });
    return {
      lateTasks: late,
      pendingTasks: pending,
      alertCount: late.length + overduePending.length,
    };
  }, [tasks, currentTime]);

  return (
    <div className="min-h-screen bg-cream-gradient flex">
      <aside className="w-64 bg-white border-r border-rose-pale/50 flex flex-col fixed h-full z-30">
        <div className="p-6 border-b border-rose-pale/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-gold to-champagne-gold flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" fill="white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-gradient-gold">
                婚礼协调
              </h1>
              <p className="text-xs text-gray-500 font-body">Wedding Coordinator</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4 text-rose-gold" />
            <span>当前时间：{currentTime}</span>
          </div>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-body relative ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-gold/10 to-champagne-gold/10 text-rose-gold font-medium'
                    : 'text-gray-600 hover:bg-rose-pale/30 hover:text-rose-gold'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.path === '/monitor' && alertCount > 0 && (
                <span className="ml-auto bg-wine text-white text-xs px-2 py-0.5 rounded-full animate-pulse-slow">
                  {alertCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-rose-pale/50">
          <div className="bg-gradient-to-r from-rose-pale/50 to-champagne-pale/50 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium mb-2">今日提醒</p>
            <div className="space-y-1 text-xs text-gray-600">
              <p>· 待确认任务：{pendingTasks.length} 项</p>
              <p>· 迟到任务：{lateTasks.length} 项</p>
              <p className="text-rose-gold font-medium mt-2">
                共 {alertCount} 项需要关注
              </p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

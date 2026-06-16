import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardCheck, 
  MessageSquare, 
  Bell,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useEffect } from 'react';

const navItems = [
  { path: '/dashboard', label: '老板看板', icon: LayoutDashboard },
  { path: '/guests', label: '名单管理', icon: Users },
  { path: '/checkin', label: '签到管理', icon: ClipboardCheck },
  { path: '/feedback', label: '反馈收集', icon: MessageSquare },
  { path: '/reminders', label: '提醒中心', icon: Bell },
];

export default function Sidebar() {
  const location = useLocation();
  const { reminderCount, fetchReminderCount } = useAppStore();

  useEffect(() => {
    fetchReminderCount();
  }, [fetchReminderCount]);

  return (
    <aside className="w-64 bg-white border-r border-warm-100 h-screen flex flex-col shadow-soft">
      <div className="p-6 border-b border-warm-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-md">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="font-display text-lg font-semibold text-brown-800">试营业邀约</h1>
            <p className="text-xs text-brown-400">客户管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.path);
          const showBadge = item.path === '/reminders' && reminderCount.total > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 relative
                ${isActive 
                  ? 'bg-primary-50 text-primary-600 font-medium shadow-sm' 
                  : 'text-brown-600 hover:bg-warm-50 hover:text-brown-800'
                }
              `}
            >
              <Icon size={20} strokeWidth={2} />
              <span className="flex-1">{item.label}</span>
              {showBadge && (
                <span className="bg-red-500 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center animate-pulse-soft">
                  {reminderCount.total > 9 ? '9+' : reminderCount.total}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-warm-100">
        <div className="bg-gradient-to-br from-primary-50 to-warm-50 rounded-xl p-4">
          <p className="text-sm font-medium text-brown-700">试营业进行中</p>
          <p className="text-xs text-brown-500 mt-1">共 {reminderCount.unconfirmed + reminderCount.no_show} 条待处理事项</p>
        </div>
      </div>
    </aside>
  );
}

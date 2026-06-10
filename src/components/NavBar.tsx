import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, BellRing, LayoutDashboard, FileBarChart, Rss, Plus, X } from 'lucide-react';
import { useAppStore } from '@/store';
import RoleSwitcher from './RoleSwitcher';

const NAV = [
  { to: '/', label: '故障看板', icon: LayoutDashboard },
  { to: '/statistics', label: '统计分析', icon: FileBarChart },
  { to: '/subscribe', label: '订阅管理', icon: Rss },
];

export default function NavBar() {
  const loc = useLocation();
  const navigate = useNavigate();
  const { unreadCount, notifications, markNotificationRead, markAllNotificationsRead, currentRole } = useAppStore();
  const [open, setOpen] = useState(false);
  const unread = unreadCount();

  useEffect(() => {
    if (unread > 0 && !('notified' in window)) {
      (window as any).notified = true;
    }
  }, [unread]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-white/75 border-b border-slate-200/80">
      <div className="container max-w-7xl flex items-center justify-between h-16 gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-pop">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" />
              <path d="M10 2v20M14 2v20" />
              <path d="M7 8h2M7 14h2" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="font-bold text-slate-900">电梯互报</div>
            <div className="text-[11px] text-slate-500 -mt-0.5">社区故障透明协作平台</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1 bg-slate-100/60 rounded-xl p-1">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = loc.pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active
                  ? 'bg-white text-brand-600 shadow-card'
                  : 'text-slate-600 hover:text-brand-500 hover:bg-white/60'}`}
              >
                <Icon size={16} />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <RoleSwitcher />

          <div className="relative">
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-pop transition-all"
            >
              {unread > 0 ? <BellRing size={18} className="text-red-500" /> : <Bell size={18} className="text-slate-500" />}
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-80 card shadow-pop animate-slide-up overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <div className="font-semibold text-slate-800">消息通知</div>
                  {unread > 0 && (
                    <button
                      onClick={() => markAllNotificationsRead()}
                      className="text-xs text-brand-500 hover:underline"
                    >
                      全部已读
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400">暂无通知消息</div>
                  ) : (
                    notifications.slice(0, 30).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          markNotificationRead(n.id);
                          setOpen(false);
                          navigate(`/fault/${n.ticketId}`);
                        }}
                        className={`w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 transition-colors ${n.read ? 'opacity-70' : 'bg-brand-50/30 hover:bg-brand-50/60'}`}
                      >
                        <div className="text-sm text-slate-700 leading-snug">{n.message}</div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/report')}
            className="hidden sm:inline-flex btn-primary"
          >
            <Plus size={16} />
            上报故障
          </button>
        </div>
      </div>

      <nav className="md:hidden flex items-center gap-1 px-3 pb-3 overflow-x-auto no-scrollbar">
        {NAV.map((n) => {
          const Icon = n.icon;
          const active = loc.pathname === n.to;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium shrink-0 transition-all ${active
                ? 'bg-white text-brand-600 shadow-card'
                : 'text-slate-600 hover:text-brand-500 hover:bg-white/60'}`}
            >
              <Icon size={16} />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

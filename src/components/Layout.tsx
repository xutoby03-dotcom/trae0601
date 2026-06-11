import { NavLink, Outlet } from 'react-router-dom';
import { Package, ClipboardPlus, Search, BarChart3, Snowflake } from 'lucide-react';

const navItems = [
  { to: '/', icon: Package, label: '包裹首页' },
  { to: '/register', icon: ClipboardPlus, label: '录入包裹' },
  { to: '/pickup-search', icon: Search, label: '取件签收' },
  { to: '/stats', icon: BarChart3, label: '数据统计' },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-warm-100 font-sans">
      <aside className="w-60 bg-primary-500 flex flex-col shrink-0">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-primary-400/30">
          <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
            <Snowflake className="w-5 h-5 text-ice-400" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight">收发台</h1>
            <p className="text-primary-200 text-xs">包裹管理系统</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg shadow-primary-600/20'
                    : 'text-primary-200 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="w-4.5 h-4.5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-primary-400/30">
          <div className="bg-white/10 rounded-lg px-4 py-3">
            <p className="text-primary-200 text-xs">当前时间</p>
            <CurrentTime />
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

function CurrentTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  const dateStr = now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <p className="text-white text-sm font-semibold mt-0.5">
      {dateStr} {timeStr}
    </p>
  );
}

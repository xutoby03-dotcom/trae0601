import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  CalendarCheck,
  CheckSquare,
  Menu,
  X,
  MonitorSmartphone,
  ShieldCheck,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '统计仪表盘' },
  { to: '/devices', icon: Monitor, label: '设备档案' },
  { to: '/reservations', icon: CalendarCheck, label: '预约管理' },
  { to: '/returns', icon: CheckSquare, label: '归还检查' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const initMockDataIfEmpty = useStore((s) => s.initMockDataIfEmpty);

  useEffect(() => {
    initMockDataIfEmpty();
  }, [initMockDataIfEmpty]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden btn-ghost !p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-md shadow-brand-600/30">
              <MonitorSmartphone size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-brand-700 leading-tight">共享显示器管理</h1>
              <p className="text-[11px] text-zinc-500 leading-tight">Display Rental System</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">数据已本地加密存储</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            行
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside
          className={`${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-16 left-0 z-30 w-64 bg-white border-r border-zinc-200 transition-transform duration-300 flex flex-col`}
        >
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''} animate-slide-in`
                }
                onClick={() => setSidebarOpen(true)}
              >
                <item.icon size={18} strokeWidth={2} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-zinc-100">
            <div className="rounded-xl p-3 bg-gradient-to-br from-brand-50 to-sky-50 border border-brand-100">
              <p className="text-[11px] text-brand-700 font-semibold mb-1">使用小贴士</p>
              <p className="text-[11px] text-zinc-600 leading-relaxed">
                借出前确认配件齐全，归还后请放回原位并勾选检查项。
              </p>
            </div>
          </div>
        </aside>

        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 overflow-y-auto scrollbar-thin">
          <div className="max-w-[1600px] mx-auto p-4 lg:p-6 animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

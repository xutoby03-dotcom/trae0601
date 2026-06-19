import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Stethoscope, CalendarClock, Droplets,
  Package, Trash2, ChevronRight, Bell, Search, User, Menu, X
} from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store';

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/devices', label: '设备档案', icon: Stethoscope },
  { path: '/usage', label: '使用记录', icon: CalendarClock },
  { path: '/disinfection', label: '消毒管理', icon: Droplets },
  { path: '/inventory', label: '库存管理', icon: Package },
  { path: '/inventory/scrap', label: '报废登记', icon: Trash2 },
];

const getBreadcrumb = (pathname: string) => {
  const map: Record<string, string[]> = {
    '/dashboard': ['首页', '数据看板'],
    '/devices': ['首页', '设备档案'],
    '/devices/new': ['首页', '设备档案', '新增设备'],
    '/usage': ['首页', '使用记录'],
    '/usage/new': ['首页', '使用记录', '新建记录'],
    '/disinfection': ['首页', '消毒管理', '待消毒队列'],
    '/disinfection/records': ['首页', '消毒管理', '历史记录'],
    '/inventory': ['首页', '库存管理'],
    '/inventory/scrap': ['首页', '库存管理', '报废登记'],
  };
  for (const key of Object.keys(map)) {
    if (pathname.startsWith(key) && key !== '/') return map[key];
  }
  return ['首页'];
};

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const overdueCount = useAppStore(s => s.overdueAlerts?.length || 0);
  const breadcrumb = getBreadcrumb(location.pathname);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? 'w-16' : 'w-60'} bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-medical-500 to-medical-700 flex items-center justify-center shrink-0">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-bold text-slate-800 truncate">雾化消毒管理</div>
              <div className="text-[11px] text-slate-400 truncate">Nebulizer Disinfection</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-100 shrink-0"
          >
            {collapsed ? <Menu className="w-4 h-4 text-slate-500" /> : <X className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length <= 2}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.path === '/disinfection' && overdueCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-red-500 text-white animate-pulse">
                      {overdueCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-100">
            <div className="px-3 py-2 rounded-[10px] bg-medical-50 border border-medical-100">
              <div className="text-xs font-medium text-medical-700">卫生合规提示</div>
              <div className="text-[11px] text-medical-600 mt-0.5">消毒步骤缺一不可</div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 px-6 bg-white border-b border-slate-200 flex items-center gap-4 shrink-0 sticky top-0 z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            {breadcrumb.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-4 h-4 text-slate-300" />}
                <span className={i === breadcrumb.length - 1 ? 'text-slate-800 font-medium' : 'text-slate-400'}>
                  {b}
                </span>
              </div>
            ))}
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索设备编号、患者..."
              className="pl-9 pr-4 py-2 w-64 rounded-[10px] bg-slate-50 border border-transparent text-sm focus:outline-none focus:bg-white focus:border-slate-200 transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) navigate(`/devices?keyword=${encodeURIComponent(v)}`);
                }
              }}
            />
          </div>

          {/* Notification */}
          <button className="relative p-2 rounded-[10px] hover:bg-slate-100 transition-colors" onClick={() => navigate('/disinfection')}>
            <Bell className="w-5 h-5 text-slate-500" />
            {overdueCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* User */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-100">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-medical-400 to-medical-600 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-medium text-slate-700">李管理员</div>
              <div className="text-[11px] text-slate-400">设备管理员</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

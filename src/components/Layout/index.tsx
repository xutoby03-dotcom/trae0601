import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle, Building2, Menu, X, Volume2 } from 'lucide-react';
import { useStatistics } from '@/hooks/useStatistics';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '数据概览' },
  { path: '/complaints', icon: FileText, label: '投诉列表' },
  { path: '/complaints/new', icon: PlusCircle, label: '新建投诉' },
  { path: '/heatmap', icon: Building2, label: '楼栋热力图' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const statistics = useStatistics();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                噪音管理
              </h1>
              <p className="text-xs text-slate-400">投诉回访系统</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive(item.path) ? '' : 'group-hover:scale-110'}`} />
              <span className="font-medium">{item.label}</span>
              {item.path === '/' && statistics.overdueCount > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center animate-pulse">
                  {statistics.overdueCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="bg-slate-700/50 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-2">今日待办</div>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {statistics.pendingCount}
                </div>
                <div className="text-xs text-slate-400">待处理</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {statistics.overdueCount}
                </div>
                <div className="text-xs text-slate-400">已超期</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <h2 className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {navItems.find((item) => isActive(item.path))?.label || '投诉管理系统'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-700/50 rounded-full text-sm">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-slate-300">系统运行正常</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center font-semibold text-sm shadow-lg">
              管
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

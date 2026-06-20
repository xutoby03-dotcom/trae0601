import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Wrench,
  Menu,
  X,
  User,
  Bell,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: '数据看板', icon: LayoutDashboard },
  { path: '/classrooms', label: '教室档案', icon: Building2 },
  { path: '/inspections', label: '巡检管理', icon: ClipboardList },
  { path: '/repairs', label: '维修管理', icon: Wrench },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50',
          'bg-white border-r border-slate-200',
          'transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20',
          'overflow-hidden'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <div>
                  <h1 className="font-bold text-slate-800 text-sm">地胶巡检系统</h1>
                  <p className="text-xs text-slate-400">Dance Studio Floor</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/25'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    )
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-3 border-t border-slate-100">
            <div
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors'
              )}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                <User className="w-5 h-5 text-slate-600" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">管理员</p>
                  <p className="text-xs text-slate-400 truncate">admin@school.edu</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl w-64">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索教室、巡检记录..."
                className="flex-1 bg-transparent text-sm text-slate-600 placeholder-slate-400 outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-xl hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
            </button>
            <button
              onClick={() => navigate('/inspections/new')}
              className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-teal-500/25 transition-all duration-200"
            >
              + 新建巡检
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Cable,
  CalendarPlus,
  CheckSquare,
  History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/devices', label: '设备档案', icon: Cable },
  { path: '/borrow', label: '借用登记', icon: CalendarPlus },
  { path: '/return', label: '归还确认', icon: CheckSquare },
  { path: '/records', label: '借用记录', icon: History },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200">
          <div className="flex items-center h-16 px-6 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Cable className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">转接管家</h1>
                <p className="text-xs text-slate-500">投影转接头管理</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-teal-50 text-teal-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-teal-600')} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-slate-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-sm font-medium">
                员
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800">员工</p>
                <p className="text-xs text-slate-500">普通用户</p>
              </div>
            </div>
          </div>
        </aside>
        
        <div className="md:pl-64 flex flex-col flex-1">
          <header className="md:hidden flex items-center h-16 px-4 bg-white border-b border-slate-200 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Cable className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-800">转接管家</h1>
            </div>
          </header>
          
          <main className="flex-1 p-4 md:p-8">
            {children}
          </main>
          
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 z-10">
            <div className="flex justify-around">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
                      isActive ? 'text-teal-600' : 'text-slate-500'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Layout;

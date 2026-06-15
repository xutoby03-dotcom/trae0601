import { NavLink, useLocation } from 'react-router-dom';
import { Home, ClipboardCheck, LayoutDashboard } from 'lucide-react';
import { cn } from '@/utils/helpers';

export default function NavBar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '借桌', icon: Home },
    { path: '/return', label: '归还验收', icon: ClipboardCheck },
    { path: '/admin', label: '物业工作台', icon: LayoutDashboard },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="8" width="18" height="8" rx="1" />
                <path d="M6 8v13M18 8v13M3 8l2 13M21 8l-2 13" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">活动室折桌</span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

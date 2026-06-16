import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Home, Calendar, Bell, ClipboardList, Smile } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/braces', icon: Smile, label: '档案' },
    { path: '/records', icon: Calendar, label: '记录' },
    { path: '/reminders', icon: Bell, label: '提醒' },
    { path: '/checkup', icon: ClipboardList, label: '复诊' },
  ];
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };
  
  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-gray z-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-around items-center h-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                    active 
                      ? 'text-primary bg-primary/10' 
                      : 'text-gray-400 hover:text-warm-dark hover:bg-warm-gray/50'
                  }`}
                >
                  <Icon size={24} className={active ? 'animate-bounce-soft' : ''} />
                  <span className="text-xs font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Layout;

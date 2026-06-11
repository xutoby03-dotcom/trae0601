import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Home, Users, BarChart3, Scissors } from 'lucide-react';

const navItems = [
  { path: '/', label: '首页看板', icon: Home },
  { path: '/events', label: '理发日', icon: Calendar },
  { path: '/appointments', label: '预约记录', icon: Users },
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

export default function NavBar() {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-warm-100 sticky top-0 z-50 shadow-soft">
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-warm-800">爱心义剪</h1>
              <p className="text-xs text-warm-500">社区公益理发预约系统</p>
            </div>
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
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600'
                      : 'text-warm-600 hover:bg-warm-50 hover:text-warm-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

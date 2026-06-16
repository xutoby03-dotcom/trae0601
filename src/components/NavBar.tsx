import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardCheck, ListTodo, Droplets, ShoppingCart, Shield } from 'lucide-react';

const navItems = [
  { path: '/', label: '风险概览', icon: LayoutDashboard },
  { path: '/tasks', label: '更换任务', icon: ListTodo },
  { path: '/cleaning-records', label: '清洗记录', icon: Droplets },
  { path: '/procurement', label: '采购提醒', icon: ShoppingCart },
];

export const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Shield className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">浴室防滑安全管家</h1>
              <p className="text-xs text-gray-500">守护家人安全，防患于未然</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 ${isActive ? 'bg-orange-100 text-orange-600' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Icon size={20} />
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Home as HomeIcon,
  BarChart3,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表板' },
  { to: '/rooms', icon: HomeIcon, label: '房间管理' },
  { to: '/statistics', icon: BarChart3, label: '数据统计' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:left-0 md:top-0 md:bottom-auto md:w-64 md:h-screen bg-white border-t md:border-t-0 md:border-r border-gray-100 z-50">
      <div className="hidden md:flex flex-col h-full">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-serif font-bold text-primary-700 flex items-center gap-2">
            🪟 窗帘管家
          </h1>
          <p className="text-sm text-gray-500 mt-1">清洗维护管理系统</p>
        </div>

        <div className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-warm-50">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white text-lg">
              🏠
            </div>
            <div>
              <p className="text-sm font-medium text-primary-700">家庭用户</p>
              <p className="text-xs text-gray-500">本地数据存储</p>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden flex justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <item.icon size={24} />
              <span className="text-xs">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

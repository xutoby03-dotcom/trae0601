import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Tv2, ArrowRightLeft, BarChart3, ShoppingCart } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '首页仪表盘' },
  { path: '/remotes', icon: Tv2, label: '遥控器档案' },
  { path: '/borrow-return', icon: ArrowRightLeft, label: '借还管理' },
  { path: '/statistics', icon: BarChart3, label: '统计报表' },
  { path: '/purchase', icon: ShoppingCart, label: '补购管理' },
];

export default function Sidebar() {
  const unreadCount = useAppStore(state => state.notifications.filter(n => !n.read).length);

  return (
    <aside className="w-64 bg-primary-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-700">
        <h1 className="text-xl font-bold text-white font-display">
          投影遥控器管理
        </h1>
        <p className="text-primary-300 text-sm mt-1">智能借还管理系统</p>
      </div>
      
      <nav className="flex-1 py-4">
        {navItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-3 text-sm font-medium transition-all duration-200 animate-fade-in-up ${
                isActive
                  ? 'bg-primary-800 text-white border-r-4 border-accent-500'
                  : 'text-primary-200 hover:bg-primary-800 hover:text-white'
              }`
            }
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
            {item.path === '/' && unreadCount > 0 && (
              <span className="ml-auto bg-accent-500 text-white text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-primary-700">
        <div className="bg-primary-800 rounded-lg p-4">
          <p className="text-primary-200 text-xs">当前时间</p>
          <p className="text-white font-medium mt-1">
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
        </div>
      </div>
    </aside>
  );
}

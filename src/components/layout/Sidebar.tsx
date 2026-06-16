import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Cable, ArrowRightLeft, RotateCcw, BarChart3, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';

const menuItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/cables', label: '线材档案', icon: Cable },
  { path: '/borrow', label: '我要借', icon: ArrowRightLeft },
  { path: '/my-borrow', label: '我的借用', icon: RotateCcw },
  { path: '/return', label: '归还登记', icon: RotateCcw },
];

const adminMenuItems = [
  { path: '/statistics', label: '统计看板', icon: BarChart3 },
  { path: '/admin-login', label: '管理员登录', icon: UserPlus },
];

export const Sidebar = () => {
  const { currentUser } = useAppStore();
  const navigate = useNavigate();

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (!currentUser && path !== '/' && path !== '/admin-login' && path !== '/cables') {
      e.preventDefault();
      navigate('/admin-login');
    }
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 min-h-[calc(100vh-4rem)] flex flex-col">
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={(e) => handleNavClick(e, item.path)}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
              isActive
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <item.icon className={cn(
              'w-5 h-5 flex-shrink-0 transition-transform duration-200',
              'group-hover:scale-110'
            )} />
            <span>{item.label}</span>
          </NavLink>
        ))}

        {currentUser?.isAdmin && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              管理功能
            </p>
            {adminMenuItems.slice(0, 1).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 flex-shrink-0 transition-transform duration-200',
                  'group-hover:scale-110'
                )} />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </>
        )}

        {!currentUser?.isAdmin && (
          <>
            <div className="my-4 border-t border-gray-200" />
            <NavLink
              to="/admin-login"
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <UserPlus className="w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span>管理员登录</span>
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <p className="text-sm font-semibold mb-1">今日数据</p>
          <p className="text-xs text-blue-100">保持线材有序，提高使用效率</p>
        </div>
      </div>
    </aside>
  );
};

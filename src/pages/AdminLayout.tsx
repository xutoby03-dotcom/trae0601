import { Navigate, Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Table, BarChart3, LogOut, Home } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminLayout() {
  const isAdmin = useStore(state => state.isAdmin);
  const setIsAdmin = useStore(state => state.setIsAdmin);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    setIsAdmin(false);
    navigate('/');
  };

  const navItems = [
    { path: '/admin/tables', label: '桌位管理', icon: Table },
    { path: '/admin/stats', label: '运营面板', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">棋</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">管理后台</h1>
              <p className="text-xs text-gray-500">社区棋牌室</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-100 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Home size={20} />
            <span>返回看板</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={20} />
            <span>退出登录</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

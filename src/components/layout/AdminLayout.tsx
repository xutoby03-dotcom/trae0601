import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Wrench, Table, LogOut } from 'lucide-react';
import { useAppStore } from '../../store';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminUsername, logoutAdmin } = useAppStore();

  const navItems = [
    { path: '/admin/dashboard', label: '仪表盘', icon: LayoutDashboard },
    { path: '/admin/no-shows', label: '爽约名单', icon: Users },
    { path: '/admin/damages', label: '器材损坏', icon: Wrench },
    { path: '/admin/tables', label: '球桌管理', icon: Table },
  ];

  const handleLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏓</span>
            <h1 className="font-display text-xl font-bold text-gray-800">管理后台</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">管理员: {adminUsername}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              退出
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-48 shrink-0">
            <nav className="bg-white rounded-xl shadow-sm p-2 sticky top-20">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

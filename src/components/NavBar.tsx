import { Link, useLocation } from 'react-router-dom';
import { Cookie, PlusCircle, BarChart3, FileText, User } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '认领大厅', icon: Cookie },
    { path: '/admin/publish', label: '录入食品', icon: PlusCircle },
    { path: '/admin/stats', label: '数据统计', icon: BarChart3 },
    { path: '/admin/records', label: '处理记录', icon: FileText },
    { path: '/my/claims', label: '我的认领', icon: User },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-warm-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-coffee-800">茶歇认领</h1>
              <p className="text-xs text-coffee-500">节约每一份美味</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || 
                (item.path !== '/' && location.pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${isActive
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-200'
                      : 'text-coffee-600 hover:bg-warm-100 hover:text-coffee-800'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

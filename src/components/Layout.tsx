import { Link, NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cookie, 
  ClipboardList, 
  Calendar, 
  AlertTriangle,
  Wheat
} from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navItems = [
    { path: '/', label: '看板总览', icon: LayoutDashboard },
    { path: '/starters', label: '母种档案', icon: Cookie },
    { path: '/feeding', label: '喂养记录', icon: ClipboardList },
    { path: '/production', label: '配方排产', icon: Calendar },
    { path: '/anomalies', label: '异常管理', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gradient-to-b from-bread-600 to-bread-800 text-white flex flex-col shadow-xl">
        <Link to="/" className="p-6 border-b border-bread-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-wheat rounded-xl flex items-center justify-center">
              <Wheat className="w-6 h-6 text-bread-700" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">酸种管家</h1>
              <p className="text-xs text-bread-200">Sourdough Manager</p>
            </div>
          </div>
        </Link>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-wheat/20 text-wheat shadow-inner'
                    : 'text-bread-100 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-bread-500/30">
          <div className="bg-bread-700/50 rounded-lg p-3">
            <p className="text-xs text-bread-200">今日提示</p>
            <p className="text-sm font-medium mt-1">定期喂养是酸种活力的关键 🍞</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

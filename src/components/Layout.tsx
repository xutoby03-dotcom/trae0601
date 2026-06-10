import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  PlusCircle,
  ClipboardList,
  ChefHat,
  BarChart3,
  Snowflake,
  Bell,
} from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { useFreezerStore, getExpiryStatus } from '../store';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const items = useFreezerStore((s) => s.items);

  const expiringCount = useMemo(() => {
    return items.filter((it) => {
      const status = getExpiryStatus(it.expiryDate);
      return status === 'urgent' || status === 'expired';
    }).length;
  }, [items]);

  const navItems = [
    { to: '/', label: '冷冻地图', icon: LayoutGrid },
    { to: '/add', label: '添加食材', icon: PlusCircle },
    { to: '/to-eat', label: '待吃清单', icon: ClipboardList, badge: expiringCount },
    { to: '/recipes', label: '菜谱反查', icon: ChefHat },
    { to: '/statistics', label: '统计中心', icon: BarChart3 },
  ];

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden bg-white shadow-sm sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Snowflake className="w-6 h-6 text-freezer-accent" />
          <h1 className="text-lg font-bold text-gray-800">冷冻库</h1>
        </div>
        {expiringCount > 0 && (
          <button
            onClick={() => navigate('/to-eat')}
            className="relative p-2 rounded-full hover:bg-gray-100"
          >
            <Bell className="w-5 h-5 text-expiring-urgent" />
            <span className="absolute -top-1 -right-1 bg-expiring-urgent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {expiringCount}
            </span>
          </button>
        )}
      </header>

      <aside className="hidden md:flex md:w-60 bg-white shadow-md flex-col py-6 fixed h-full left-0 top-0">
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-freezer-accent to-sky-400 rounded-xl flex items-center justify-center shadow-md">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">冷冻库存</h1>
            <p className="text-xs text-gray-500">家庭管家</p>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-freezer-accent text-white shadow-md shadow-sky-200'
                    : 'text-gray-600 hover:bg-sky-50 hover:text-freezer-accent'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span
                  className={`ml-auto text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                    location.pathname === item.to
                      ? 'bg-white text-expiring-urgent'
                      : 'bg-expiring-urgent text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">共 {items.length} 件食材</div>
        </div>
      </aside>

      <main className="flex-1 md:ml-60 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6">{children}</div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
        <div className="grid grid-cols-5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2.5 px-1 transition-colors relative ${
                  isActive ? 'text-freezer-accent' : 'text-gray-500'
                }`
              }
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-expiring-urgent text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 truncate w-full text-center">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

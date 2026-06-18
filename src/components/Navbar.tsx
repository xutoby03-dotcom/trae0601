import { NavLink, useLocation } from 'react-router-dom';
import { Coffee, BarChart3, Plus, Package } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Coffee, label: '看板' },
    { path: '/statistics', icon: BarChart3, label: '统计' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-cream-50/80 backdrop-blur-md border-b border-coffee-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-coffee-800 flex items-center justify-center">
              <Package className="w-5 h-5 text-cream-50" />
            </div>
            <span className="text-xl font-bold text-coffee-900 font-serif">
              养豆看板
            </span>
          </div>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-coffee-800 text-cream-50 shadow-md'
                      : 'text-coffee-600 hover:bg-coffee-100 hover:text-coffee-800'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}

            <NavLink
              to="/add"
              className="flex items-center gap-2 px-4 py-2 ml-2 rounded-xl font-medium bg-sunset-400 text-white hover:bg-sunset-500 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">添加豆子</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

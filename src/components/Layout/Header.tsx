import { Link, NavLink } from 'react-router-dom';
import { Flame } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-cream-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-800 leading-tight">燃气安全管家</span>
            <span className="text-xs text-gray-500 leading-tight">安全守护 · 防患未然</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-gray-800'
              }`
            }
          >
            仪表盘
          </NavLink>
          <NavLink
            to="/devices"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-gray-800'
              }`
            }
          >
            设备档案
          </NavLink>
          <NavLink
            to="/alerts"
            className={({ isActive }) =>
              `px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25'
                  : 'text-gray-600 hover:bg-cream-100 hover:text-gray-800'
              }`
            }
          >
            异常维修
          </NavLink>
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-warning-400 to-warning-500 flex items-center justify-center text-white font-semibold text-sm">
            管
          </div>
        </div>
      </div>
    </header>
  );
}

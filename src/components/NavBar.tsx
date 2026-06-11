import { NavLink } from 'react-router-dom';
import { Snowflake, Package, BarChart3 } from 'lucide-react';

export default function NavBar() {
  return (
    <nav className="bg-gradient-to-r from-sky-500 to-cyan-500 shadow-lg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Snowflake className="w-7 h-7 text-white" />
            <span className="text-white font-bold text-xl tracking-wide">滑雪拼租</span>
          </div>
          <div className="flex gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-md'
                    : 'text-white/90 hover:bg-white/20'
                }`
              }
            >
              <Package className="w-4 h-4" />
              <span>装备列表</span>
            </NavLink>
            <NavLink
              to="/return"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-md'
                    : 'text-white/90 hover:bg-white/20'
                }`
              }
            >
              <Snowflake className="w-4 h-4" />
              <span>归还管理</span>
            </NavLink>
            <NavLink
              to="/stats"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-sky-600 shadow-md'
                    : 'text-white/90 hover:bg-white/20'
                }`
              }
            >
              <BarChart3 className="w-4 h-4" />
              <span>费用统计</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

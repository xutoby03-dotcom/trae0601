import { Coffee, LayoutDashboard, List, Plus } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-coffee-800 text-coffee-50 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <Coffee className="w-8 h-8 text-amber-500" strokeWidth={2} />
            <span className="font-display text-2xl font-bold tracking-wide">手冲刻度笔记</span>
          </Link>
          <div className="flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-coffee-700 text-white'
                    : 'text-coffee-200 hover:bg-coffee-700/50 hover:text-white'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              仪表盘
            </NavLink>
            <NavLink
              to="/records"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-coffee-700 text-white'
                    : 'text-coffee-200 hover:bg-coffee-700/50 hover:text-white'
                }`
              }
            >
              <List className="w-4 h-4" />
              参数表
            </NavLink>
            <NavLink
              to="/records/new"
              className="ml-2 flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium bg-matcha text-white hover:bg-matcha-light transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              新增记录
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

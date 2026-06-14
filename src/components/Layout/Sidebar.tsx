import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, UtensilsCrossed, BarChart3, Store } from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/products', label: '商品档案', icon: Package },
  { path: '/tasting', label: '试吃监控', icon: UtensilsCrossed },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-full">
      <div className="p-6 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-stone-800 text-lg">零食试吃</h1>
            <p className="text-xs text-stone-500">管理系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500 to-orange-550 text-white shadow-lg shadow-orange-500/30'
                  : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-stone-200">
        <div className="bg-gradient-to-r from-stone-100 to-stone-50 rounded-xl p-4">
          <p className="text-sm font-medium text-stone-700">当前店员</p>
          <p className="text-lg font-bold text-stone-900 mt-1">张小明</p>
          <p className="text-xs text-stone-500 mt-1">工号: S001</p>
        </div>
      </div>
    </aside>
  );
}

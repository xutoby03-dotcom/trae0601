import { NavLink } from 'react-router-dom';
import { Home, Coffee, Package, ShoppingCart, BarChart3, Droplets } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '库存总览' },
  { path: '/flavors', icon: Coffee, label: '口味档案' },
  { path: '/consume', icon: Package, label: '取用登记' },
  { path: '/supplies', icon: Droplets, label: '配套物品' },
  { path: '/statistics', icon: BarChart3, label: '统计分析' },
  { path: '/purchase', icon: ShoppingCart, label: '采购清单' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-coffee-100 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-coffee-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-coffee-800 rounded-lg flex items-center justify-center">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-coffee-900">咖啡库存</h1>
            <p className="text-xs text-coffee-500">Coffee Inventory</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'sidebar-item-active' : 'sidebar-item'
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-coffee-100">
        <div className="bg-cream-100 rounded-lg p-4">
          <p className="text-sm text-coffee-600">
            今日已取用
          </p>
          <p className="font-display text-2xl font-bold text-coffee-900">
            <span id="today-consumption">--</span> 颗
          </p>
        </div>
      </div>
    </aside>
  );
}

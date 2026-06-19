import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Droplets, Wrench, BarChart3, ShoppingBag } from 'lucide-react';
import { cn } from '../../utils/helpers';

const navItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/boxes', label: '箱子档案', icon: Package },
  { path: '/cleaning', label: '清洁记录', icon: Droplets },
  { path: '/maintenance', label: '维修报废', icon: Wrench },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
  { path: '/assignment', label: '订单分配', icon: ShoppingBag },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">保温箱台账</h1>
            <p className="text-xs text-gray-500">清洁管理系统</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-6 left-6 right-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
          <p className="text-xs text-orange-800 font-medium">今日提示</p>
          <p className="text-xs text-orange-600 mt-1">请检查所有待清洁箱子</p>
        </div>
      </div>
    </aside>
  );
}

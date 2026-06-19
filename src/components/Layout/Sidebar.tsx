import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, Calculator, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/products', label: '商品档案', icon: Package },
  { path: '/inventory', label: '批次库存', icon: Warehouse },
  { path: '/pos', label: '收银台', icon: Calculator },
  { path: '/stats', label: '统计报表', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gradient-to-b from-blue-600 to-blue-800 min-h-screen text-white flex flex-col">
      <div className="p-6 border-b border-blue-500/30">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🥛</span>
          临期酸奶促销看板
        </h1>
        <p className="text-blue-200 text-sm mt-1">智能库存管理系统</p>
      </div>
      
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-white/20 text-white shadow-lg'
                      : 'text-blue-100 hover:bg-white/10 hover:text-white'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-blue-500/30">
        <div className="bg-white/10 rounded-lg p-3">
          <p className="text-sm text-blue-200">今日提示</p>
          <p className="text-xs text-blue-300 mt-1">记得检查临期商品哦~</p>
        </div>
      </div>
    </aside>
  );
}

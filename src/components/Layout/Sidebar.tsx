import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  ShoppingCart,
  BarChart3,
  Coffee,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '看板', icon: LayoutDashboard },
  { to: '/items', label: '物品档案', icon: Package },
  { to: '/requests', label: '补货申请', icon: ClipboardList },
  { to: '/purchases', label: '采购处理', icon: ShoppingCart },
  { to: '/stats', label: '统计分析', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-60 min-h-screen bg-white border-r border-slate-100 flex flex-col">
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-sm">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-display text-lg text-slate-900 leading-none">茶水间</h1>
          <p className="text-xs text-slate-500 mt-0.5">补给看板</p>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-brand-50 text-brand-700 shadow-sm'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50 to-slate-50 border border-brand-100">
          <p className="text-xs text-slate-600 leading-relaxed">
            💡 发现库存不足？<br />
            点击"补货申请"快速提交
          </p>
        </div>
      </div>
    </aside>
  );
}

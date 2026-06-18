import { LayoutDashboard, Shirt, ClipboardList, Droplets, RotateCcw } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

const navItems = [
  { to: '/dashboard', label: '仪表板', icon: LayoutDashboard },
  { to: '/coats', label: '实验服档案', icon: Shirt },
  { to: '/lendings', label: '领用登记', icon: ClipboardList },
  { to: '/return', label: '归还检查', icon: RotateCcw },
  { to: '/cleaning', label: '清洗管理', icon: Droplets },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen flex flex-col">
      <div className="px-6 py-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Shirt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-base">实验服管理</h1>
            <p className="text-slate-400 text-xs">Lab Coat System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-blue-500/20 text-blue-400 shadow-inner'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
            <span className="text-white text-sm font-bold">管</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">管理员</p>
            <p className="text-slate-400 text-xs">实验室管理中心</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

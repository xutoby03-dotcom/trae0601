import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ListOrdered,
  Monitor,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '数据看板' },
  { to: '/batches', icon: Package, label: '团购批次' },
  { to: '/queue', icon: ListOrdered, label: '排号叫号' },
  { to: '/display', icon: Monitor, label: '叫号屏幕' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-cyan-400" />
          团购取货系统
        </h1>
        <p className="text-slate-400 text-sm mt-1">Pickup Queue System</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                    isActive
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-400 text-xs">系统提示</p>
          <p className="text-white text-sm mt-1">
            请确保叫号屏幕连接到大显示器
          </p>
        </div>
      </div>
    </aside>
  );
}

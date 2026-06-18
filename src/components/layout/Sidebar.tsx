import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Soup, ClipboardList, MessageSquare, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', label: '品质看板', icon: LayoutDashboard },
  { to: '/batches', label: '批次管理', icon: ClipboardList },
  { to: '/batches/new', label: '新建熬制', icon: Soup },
  { to: '/feedback', label: '反馈追溯', icon: MessageSquare },
];

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-gradient-to-b from-broth-800 to-broth-900 text-white flex flex-col">
      <div className="px-6 py-6 border-b border-broth-700/50">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fire-400 to-fire-500 flex items-center justify-center shadow-lg">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-lg font-bold leading-tight">汤底管家</h1>
            <p className="text-xs text-broth-300">品质稳定系统</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-fire-500/90 text-white shadow-lg shadow-fire-500/30'
                  : 'text-broth-200 hover:bg-broth-700/50 hover:text-white'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-broth-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-soup-200 flex items-center justify-center text-broth-800 font-bold text-sm">
            王
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">王师傅</p>
            <p className="text-xs text-broth-300">后厨操作</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

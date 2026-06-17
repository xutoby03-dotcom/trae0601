import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Archive,
  FileUp,
  CheckSquare,
  RotateCcw,
  FolderLock,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '看板首页', icon: LayoutDashboard },
  { path: '/archives', label: '档案箱管理', icon: Archive },
  { path: '/borrow/apply', label: '借阅申请', icon: FileUp },
  { path: '/borrow/approve', label: '借阅审批', icon: CheckSquare },
  { path: '/borrow/return', label: '归还检查', icon: RotateCcw },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-navy-900 text-white flex flex-col shadow-xl z-30">
      <div className="h-16 px-6 flex items-center gap-3 border-b border-navy-700">
        <div className="w-9 h-9 rounded-lg bg-gold-500 flex items-center justify-center">
          <FolderLock size={20} />
        </div>
        <div>
          <h1 className="font-serif text-lg leading-tight">档案管理</h1>
          <p className="text-[11px] text-navy-300">Archive Tracking</p>
        </div>
      </div>
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gold-500 text-white shadow-md'
                    : 'text-navy-200 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="p-4 border-t border-navy-700">
        <p className="text-xs text-navy-400">© 2026 行政档案系统</p>
      </div>
    </aside>
  );
}

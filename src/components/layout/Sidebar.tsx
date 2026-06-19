import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Bell,
  PawPrint,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '看板' },
  { to: '/cases', icon: FolderKanban, label: '病例档案' },
  { to: '/alerts', icon: Bell, label: '提醒中心' },
];

export default function Sidebar() {
  return (
    <aside className="w-60 bg-white border-r border-gray-100 h-screen flex flex-col sticky top-0">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <PawPrint className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-800 text-lg">爱宠康</div>
            <div className="text-xs text-gray-500">术后回访系统</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ${
                isActive
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">李</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">李医生</div>
            <div className="text-xs text-gray-500 truncate">主治医师</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

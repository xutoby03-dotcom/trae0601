import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Armchair,
  PlayCircle,
  StopCircle,
  Bell,
  FileText,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const menuItems: MenuItem[] = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/furniture', label: '桌椅档案', icon: Armchair },
  { path: '/open', label: '开摊', icon: PlayCircle },
  { path: '/close', label: '收摊', icon: StopCircle },
  { path: '/reminders', label: '提醒中心', icon: Bell },
  { path: '/incidents', label: '事件登记', icon: FileText },
  { path: '/statistics', label: '统计报表', icon: BarChart3 },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r border-gray-200 bg-white transition-transform duration-300 ease-in-out',
          'lg:static lg:translate-x-0 lg:pt-0',
          isOpen ? 'translate-x-0 pt-16' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <nav className="flex h-full flex-col gap-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-primary-500' : 'text-gray-400',
                  )}
                />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

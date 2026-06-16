import { NavLink, useLocation } from 'react-router-dom';
import { Home, Armchair, PlayCircle, Bell, User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useReminderStore } from '@/stores/useReminderStore';

interface NavItem {
  path: string;
  label: string;
  icon: typeof Home;
}

const navItems: NavItem[] = [
  { path: '/', label: '首页', icon: Home },
  { path: '/furniture', label: '桌椅', icon: Armchair },
  { path: '/open', label: '操作', icon: PlayCircle },
  { path: '/reminders', label: '提醒', icon: Bell },
  { path: '/profile', label: '我的', icon: User },
];

export default function BottomNav() {
  const location = useLocation();
  const { unreadCount } = useReminderStore();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white lg:hidden">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          const showBadge = item.path === '/reminders' && unreadCount > 0;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive ? 'text-primary-500' : 'text-gray-400',
                  )}
                />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, Package, Shirt, Bell, Plus } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function BottomNav() {
  const unreadCount = useStore((state) => state.getUnreadReminderCount());

  const navItems = [
    { to: '/', icon: Home, label: '首页' },
    { to: '/boxes', icon: Package, label: '箱子' },
    { to: '/clothes', icon: Shirt, label: '衣物' },
    { to: '/reminders', icon: Bell, label: '提醒', badge: unreadCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 shadow-soft z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-16 h-16 relative transition-colors duration-200 ${
                isActive ? 'text-sage-600' : 'text-warm-400'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-coral-500 text-white text-xs font-medium rounded-full min-w-5 h-5 flex items-center justify-center px-1 animate-pulse-soft">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

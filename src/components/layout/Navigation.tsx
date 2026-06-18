import { LayoutDashboard, MapPin, ClipboardList } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: '看板', icon: LayoutDashboard },
  { to: '/routes', label: '路线', icon: MapPin },
  { to: '/orders', label: '订单', icon: ClipboardList }
];

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-orange-600' : 'text-gray-500'
              }`
            }
          >
            <item.icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

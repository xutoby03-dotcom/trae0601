import { NavLink } from 'react-router-dom';
import { Home, Package, CalendarClock, AlertTriangle } from 'lucide-react';

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/inventory', label: '食材库', icon: Package },
  { path: '/planner', label: '解冻规划', icon: CalendarClock },
  { path: '/warnings', label: '风险区', icon: AlertTriangle },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-warm-100 z-50">
      <div className="max-w-lg mx-auto px-2">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-warm-400 hover:text-warm-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={isActive ? 'animate-pulse-soft' : ''}
                  />
                  <span className="text-xs font-medium">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}

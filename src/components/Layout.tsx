import { NavLink, Outlet } from 'react-router-dom';
import { Dices, ListTodo, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', icon: Dices, label: '抽签' },
  { to: '/pool', icon: ListTodo, label: '任务池' },
  { to: '/stats', icon: BarChart3, label: '统计' },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      <main className="pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200',
                  isActive
                    ? 'text-[#FF6B35] scale-105'
                    : 'text-gray-400 hover:text-gray-600'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={cn(
                      'p-1.5 rounded-xl transition-all duration-200',
                      isActive && 'bg-[#FF6B35]/10'
                    )}
                  >
                    <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={cn('text-xs font-medium', isActive && 'font-bold')}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

import { NavLink } from 'react-router-dom';
import { Home, PawPrint, Pill, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: '首页' },
  { to: '/pets', icon: PawPrint, label: '宠物' },
  { to: '/medicines', icon: Pill, label: '药品' },
  { to: '/statistics', icon: BarChart3, label: '统计' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50">
      <div className="max-w-4xl mx-auto pb-24 md:pb-8 md:pl-20">
        {children}
      </div>
      
      <nav className="fixed bottom-0 left-0 right-0 md:left-0 md:top-0 md:bottom-0 md:w-20 bg-white/90 backdrop-blur-md border-t md:border-t-0 md:border-r border-orange-100 z-50">
        <div className="flex md:flex-col items-center justify-around md:justify-start md:pt-8 md:gap-2 h-16 md:h-full">
          <div className="hidden md:flex items-center justify-center w-12 h-12 mb-8 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-400">
            <PawPrint className="w-6 h-6 text-white" />
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300',
                  'hover:bg-orange-50 hover:text-orange-500',
                  'md:w-14 md:h-14',
                  isActive
                    ? 'text-orange-500 bg-orange-100/50'
                    : 'text-gray-400'
                )
              }
            >
              <item.icon className="w-5 h-5 md:w-6 md:h-6" />
              <span className="text-xs mt-1 font-medium hidden md:block">
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}

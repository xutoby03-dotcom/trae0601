import { NavLink } from 'react-router-dom';
import { Home, Droplets, Cat, TrendingUp } from 'lucide-react';

export default function NavBar() {
  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/record', label: '记录', icon: Droplets },
    { path: '/trends', label: '趋势', icon: TrendingUp },
    { path: '/profile', label: '档案', icon: Cat },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 md:relative md:border-none md:bg-transparent z-50">
      <div className="container mx-auto">
        <div className="flex justify-around md:justify-start md:gap-6 py-2 md:py-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex flex-col md:flex-row items-center gap-1 md:gap-2
                  px-4 py-2 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'text-primary-500 md:bg-primary-50' 
                    : 'text-gray-500 hover:text-gray-700 md:hover:bg-gray-50'
                  }
                `}
              >
                <Icon size={20} />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

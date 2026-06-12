import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Flower2, 
  CalendarCheck, 
  History, 
  FlowerIcon 
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: '老板看板', icon: LayoutDashboard },
  { path: '/bouquets', label: '花束看板', icon: Flower2 },
  { path: '/reservations', label: '预留管理', icon: CalendarCheck },
  { path: '/records', label: '操作记录', icon: History },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-cream-200 flex flex-col">
      <div className="p-6 border-b border-cream-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-300 to-rose-400 flex items-center justify-center">
            <FlowerIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-serif text-forest-700">花语轩</h1>
            <p className="text-xs text-forest-400">鲜花预留看板</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-rose-400/10 to-rose-300/5 text-rose-500 font-medium' 
                  : 'text-forest-500 hover:bg-cream-100 hover:text-forest-700'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-400" />
              )}
            </NavLink>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-cream-100">
        <div className="bg-gradient-to-br from-forest-50 to-cream-100 rounded-xl p-4">
          <p className="text-xs text-forest-500 mb-1">今日业绩</p>
          <p className="text-xl font-bold font-serif text-forest-700">¥1,280</p>
          <p className="text-xs text-rose-400 mt-1">↑ 12% 较昨日</p>
        </div>
      </div>
    </aside>
  );
}

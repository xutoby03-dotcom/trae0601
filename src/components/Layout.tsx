import { NavLink, Outlet } from 'react-router-dom';
import { Package, ShoppingCart, ChefHat, BarChart3, Sunrise } from 'lucide-react';
import { format } from 'date-fns';

const navItems = [
  { to: '/products', icon: Package, label: '商品管理' },
  { to: '/order', icon: ShoppingCart, label: '顾客下单' },
  { to: '/kitchen', icon: ChefHat, label: '厨房看板' },
  { to: '/stats', icon: BarChart3, label: '数据统计' },
];

const chineseDays = ['日', '一', '二', '三', '四', '五', '六'];

export default function Layout() {
  const today = new Date();
  const dateStr = `${format(today, 'M月d日')} 周${chineseDays[today.getDay()]}`;

  return (
    <div className="flex">
      <aside className="w-64 h-screen flex flex-col bg-white border-r border-brand-100">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Sunrise className="w-8 h-8 text-brand-500" />
            <h1 className="font-serif text-2xl font-bold text-brand-500">早高峰</h1>
          </div>
          <p className="text-xs text-brown-400 mt-1">早餐店预订备餐</p>
        </div>

        <nav className="flex-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 text-sm text-brown-400 border-t border-brand-100">
          {dateStr}
        </div>
      </aside>

      <main className="flex-1 h-screen overflow-y-auto bg-brand-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}

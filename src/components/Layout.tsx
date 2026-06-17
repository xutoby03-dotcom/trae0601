import { NavLink, Outlet } from 'react-router-dom';
import {
  Home,
  PlusCircle,
  ListTodo,
  Package,
  CheckCircle2,
  Scissors,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/register', icon: PlusCircle, label: '登记衣物' },
  { path: '/queue', icon: ListTodo, label: '任务队列' },
  { path: '/materials', icon: Package, label: '材料管理' },
  { path: '/records', icon: CheckCircle2, label: '完成记录' },
];

const Layout = () => {
  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-md">
                <Scissors className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-lg md:text-xl text-brown-900">
                  缝补小助手
                </h1>
                <p className="text-xs text-brown-500 hidden md:block">
                  让每件衣物都得到精心照料
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-brown-100 md:hidden z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-primary-500 bg-primary-50'
                    : 'text-brown-400 hover:text-brown-700'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <aside className="hidden md:block fixed left-0 top-20 bottom-0 w-64 bg-white border-r border-brown-100 p-4 z-40">
        <div className="space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-brown-600 hover:bg-brown-50 hover:text-brown-800'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>

      <div className="hidden md:block ml-64" />
    </div>
  );
};

export default Layout;

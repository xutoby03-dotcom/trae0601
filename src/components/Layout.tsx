import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, PawPrint, ClipboardList, Plus } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/pets', label: '宠物', icon: PawPrint },
    { path: '/tasks', label: '任务', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-cream-200">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🐾</span>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                宠物寄养管家
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-brand-100 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                to="/pets/new"
                className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-brand-500 text-white rounded-full font-medium hover:bg-brand-600 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Plus size={18} />
                添加宠物
              </Link>
              <Link
                to="/tasks/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-brand-200 text-brand-700 rounded-full font-medium hover:bg-brand-50 transition-all duration-200"
              >
                <Plus size={18} />
                新建寄养
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 pb-24 md:pb-6">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-100 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors duration-200 ${
                isActive(item.path) ? 'text-brand-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={22} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}

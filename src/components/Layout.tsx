import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BarChart3, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: '活动广场', icon: Home },
  { path: '/stats', label: '管理统计', icon: BarChart3 },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-primary-500 via-primary-400 to-accent-400 sticky top-0 z-40 shadow-soft">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-11 h-11 rounded-2xl bg-white/25 backdrop-blur flex items-center justify-center group-hover:bg-white/35 transition-colors">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">玩伴约局板</h1>
                <p className="text-xs text-white/80">小区孩子找玩伴 更方便</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-primary-600 shadow-soft'
                        : 'text-white/90 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 pb-24 md:pb-6">
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-cream-300 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="container">
          <div className="flex justify-around py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-5 py-2 rounded-xl transition-colors ${
                    isActive ? 'text-primary-500' : 'text-ink-500'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/publish"
              className="flex flex-col items-center gap-1 px-5 py-2 rounded-xl text-primary-500"
            >
              <div className="w-12 h-12 -mt-6 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-float">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium">发布</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

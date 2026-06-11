import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, BarChart3, ArrowUpRight, Sparkles } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { path: '/', label: '首页看板', icon: Home },
    { path: '/reserve', label: '预约登记', icon: ClipboardList },
    { path: '/statistics', label: '统计分析', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="container">
          <div className="h-16 sm:h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-glow-amber group-hover:scale-105 transition-transform duration-300">
                  <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-mint-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-serif text-lg font-bold text-slate-800 leading-tight">
                  邻里<span className="gradient-text">梯约</span>
                </h1>
                <p className="text-xs text-slate-500">社区共享梯子 · 透明可追溯</p>
              </div>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-glow-amber'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={isActive ? 2.5 : 2} />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-6 sm:py-8 animate-fade-in">
        {children}
      </main>

      <footer className="border-t border-slate-100 bg-white/60 backdrop-blur-sm mt-auto">
        <div className="container py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
              <span>邻里梯约 · 让社区更温暖</span>
            </div>
            <div className="flex items-center gap-4">
              <span>梯子取放点：物业服务中心</span>
              <span>服务热线：400-888-8888</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Archive, ArrowRightLeft, BarChart3, CloudRain } from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/archive', label: '雨具档案', icon: Archive },
  { path: '/lend-return', label: '借出归还', icon: ArrowRightLeft },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, #2563eb 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, #9333ea 0%, transparent 50%),
                          radial-gradient(circle at 40% 80%, #f97316 0%, transparent 50%)`
      }} />
      
      <div className="relative flex min-h-screen">
        <aside className="hidden lg:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50">
          <div className="p-6 border-b border-slate-200/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <CloudRain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">雨具归位</h1>
                <p className="text-xs text-slate-500">让每把伞都有归宿</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'text-slate-600 hover:bg-slate-100'
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 lg:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <CloudRain className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">雨具归位</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-6">
            {children}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200/50 px-2 py-2 z-40">
            <div className="flex items-center justify-around">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 min-w-[60px]',
                      isActive
                        ? 'text-blue-600'
                        : 'text-slate-500'
                    )
                  }
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors',
                    location.pathname === item.path ? 'text-blue-600' : 'text-slate-400'
                  )} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}

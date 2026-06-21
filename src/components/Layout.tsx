import { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Snowflake, Settings, MessageSquare, Lightbulb, Mountain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navItems = [
    { to: '/', icon: Snowflake, label: '雪板' },
    { to: '/tunes', icon: Settings, label: '调校' },
    { to: '/feedback', icon: MessageSquare, label: '试滑' },
    { to: '/recommend', icon: Lightbulb, label: '推荐' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-card border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-glow to-purple-glow flex items-center justify-center animate-float">
              <Mountain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white">雪刃调校</h1>
              <p className="text-xs text-slate-400">滑雪板刃角调校记录工具</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    isActive
                      ? 'bg-cyan-glow/20 text-cyan-glow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-slate-500">
        滑雪板刃角调校记录 · 数据本地存储
      </footer>
    </div>
  );
}

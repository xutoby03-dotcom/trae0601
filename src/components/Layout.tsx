import { NavLink, useLocation } from 'react-router-dom';
import { Telescope, ClipboardList, PenLine, BookOpen, Sparkles } from 'lucide-react';
import StarryBackground from './StarryBackground';
import type { ReactNode } from 'react';

const NAV_ITEMS = [
  { to: '/', label: '观测计划', icon: Telescope },
  { to: '/checklist', label: '观测清单', icon: ClipboardList },
  { to: '/history', label: '观测记录', icon: PenLine },
  { to: '/library', label: '历史复盘', icon: BookOpen },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const current = NAV_ITEMS.find(n => {
    if (n.to === '/') return location.pathname === '/';
    return location.pathname.startsWith(n.to);
  });

  return (
    <div className="relative min-h-screen">
      <StarryBackground />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <header className="lg:hidden sticky top-0 z-50 bg-space-950/80 backdrop-blur-xl border-b border-white/5 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-nebula-purple to-nebula-pink flex items-center justify-center shadow-lg shadow-nebula-purple/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-lg font-semibold text-gradient">星野夜</span>
            </div>
          </div>
          <nav className="flex gap-1 mt-3 -mx-1 overflow-x-auto">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = current?.to === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={`flex-1 min-w-0 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap
                    ${isActive
                      ? 'bg-gradient-to-r from-nebula-purple/30 to-nebula-cyan/20 text-white border border-nebula-purple/30'
                      : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              );
            })}
          </nav>
        </header>

        <aside className="hidden lg:flex flex-col w-64 xl:w-72 flex-shrink-0 p-6 gap-2 border-r border-white/5">
          <div className="mb-6 px-2">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-nebula-purple via-nebula-pink to-moonlight flex items-center justify-center shadow-2xl shadow-nebula-purple/30 animate-pulse-glow">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gradient leading-tight">星野夜</h1>
                <p className="text-[11px] text-white/40 tracking-wider">STARRY NIGHT OBSERVER</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const isActive = current?.to === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive: navActive }) => `nav-link ${navActive || isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto pt-6">
            <div className="glass-card p-4 text-xs leading-relaxed">
              <p className="text-white/40 mb-2">💡 观测小贴士</p>
              <p className="text-white/70">
                观测前30分钟让眼睛适应黑暗，不要使用白光手电。红光可以保持夜间视觉。
              </p>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 px-4 sm:px-6 lg:px-8 xl:px-10 py-6 lg:py-8 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

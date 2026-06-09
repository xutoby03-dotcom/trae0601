import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Monitor, Clapperboard, Wrench, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '拓扑图' },
  { to: '/devices', icon: Monitor, label: '设备' },
  { to: '/scenes', icon: Clapperboard, label: '场景' },
  { to: '/troubleshoot', icon: Wrench, label: '排查' },
  { to: '/stats', icon: BarChart3, label: '统计' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-900">
      <aside className="w-[72px] flex flex-col items-center py-6 border-r border-white/5 bg-dark-800/50 backdrop-blur-sm shrink-0">
        <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-8">
          <span className="text-accent font-display font-bold text-lg">AV</span>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-accent/15 text-accent'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} strokeWidth={1.5} />
              <span className="text-[9px] font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="text-[10px] text-white/15 font-display mt-4">v1.0</div>
      </aside>
      <main className="flex-1 overflow-hidden relative" key={location.pathname}>
        {children}
      </main>
    </div>
  );
}

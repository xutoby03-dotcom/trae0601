import { NavLink, Outlet } from 'react-router-dom';
import { Radar, BookOpen, ClipboardList, Calendar, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', icon: Radar, label: '雷达' },
  { to: '/courses', icon: BookOpen, label: '课程' },
  { to: '/assignments', icon: ClipboardList, label: '作业' },
  { to: '/week', icon: Calendar, label: '周视图' },
  { to: '/stats', icon: BarChart3, label: '统计' },
];

export default function Layout() {
  return (
    <div className="flex h-screen bg-radar-bg font-noto">
      <nav className="hidden md:flex flex-col w-20 lg:w-56 bg-radar-surface border-r border-radar-border shrink-0">
        <div className="p-4 lg:p-6 border-b border-radar-border">
          <h1 className="font-orbitron text-radar-cyan text-sm lg:text-lg font-bold text-glow-cyan">
            DEADLINE
          </h1>
          <h1 className="font-orbitron text-radar-pink text-sm lg:text-lg font-bold text-glow-pink">
            RADAR
          </h1>
        </div>
        <div className="flex flex-col gap-1 p-2 lg:p-3 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive
                    ? 'bg-radar-cyan/10 text-radar-cyan glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-radar-surface border-t border-radar-border flex justify-around py-2 px-1 z-50">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all ${
                isActive
                  ? 'text-radar-cyan'
                  : 'text-slate-500'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

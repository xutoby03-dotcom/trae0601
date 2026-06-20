import { NavLink } from 'react-router-dom';
import { Gauge, CalendarDays, Flag, FileText, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '主仪表盘', icon: Gauge },
  { path: '/schedule', label: '课程表', icon: CalendarDays },
  { path: '/pre-race', label: '赛前模式', icon: Flag },
  { path: '/report', label: '交接报告', icon: FileText },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-slate-900 border-r border-slate-700 flex flex-col h-screen fixed left-0 top-0 z-40">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/30">
            <Snowflake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">冰面运维</h1>
            <p className="text-slate-400 text-xs">Ice Rink Ops</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sky-500/20 text-sky-300 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">当前班次</p>
          <p className="text-sm text-slate-200 font-medium">白班 · 张师傅</p>
          <p className="text-xs text-slate-500 mt-1">08:00 - 16:00</p>
        </div>
      </div>
    </aside>
  );
}

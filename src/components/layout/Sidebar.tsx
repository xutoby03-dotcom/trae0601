import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Umbrella,
  ArrowRightLeft,
  Undo2,
  AlertTriangle,
  BarChart3,
  UmbrellaIcon,
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/umbrellas', icon: Umbrella, label: '雨伞档案' },
  { to: '/lend', icon: ArrowRightLeft, label: '雨伞借出' },
  { to: '/return', icon: Undo2, label: '雨伞归还' },
  { to: '/overdue', icon: AlertTriangle, label: '逾期提醒' },
  { to: '/statistics', icon: BarChart3, label: '统计分析' },
];

export default function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg shadow-teal-900/40">
          <UmbrellaIcon className="h-5 w-5" />
        </div>
        <div>
          <div className="font-serif-sc text-base font-bold text-white">雨伞管家</div>
          <div className="text-[11px] text-slate-400">Umbrella Manager</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-teal-600/20 text-teal-300 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-[18px] w-[18px] transition-colors ${
                    isActive ? 'text-teal-400' : 'text-slate-500 group-hover:text-slate-300'
                  }`}
                />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-teal-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="rounded-lg bg-slate-800/60 p-3">
          <div className="text-xs text-slate-400">当前门店</div>
          <div className="mt-1 text-sm font-medium text-slate-100">朝阳路旗舰店</div>
          <div className="mt-1 text-[11px] text-slate-500">朝阳区朝阳路168号</div>
        </div>
      </div>
    </aside>
  );
}

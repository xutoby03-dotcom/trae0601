import { NavLink } from 'react-router-dom';
import { Pill, Calendar, ClipboardList, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', label: '分装计划', icon: Calendar, end: true },
  { to: '/medicines', label: '药品管理', icon: Pill },
  { to: '/records', label: '服药记录', icon: ClipboardList },
  { to: '/statistics', label: '月度统计', icon: BarChart3 },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 shadow-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                老人药盒管家
              </h1>
              <p className="text-xs text-emerald-100">安心分装 · 安全服药</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-white text-emerald-700 shadow-md scale-105'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto -mx-2 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-white text-emerald-700 shadow-md'
                    : 'text-white/90 bg-white/10 hover:bg-white/20'
                }`
              }
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

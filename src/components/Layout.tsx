import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Fish, Filter, Wrench, Droplets, ChevronDown } from 'lucide-react';
import { useAquaStore } from '@/store/aquaStore';

const navItems = [
  { to: '/', label: '首页仪表盘', shortLabel: '首页', icon: LayoutDashboard },
  { to: '/tank', label: '鱼缸档案', shortLabel: '鱼缸', icon: Fish },
  { to: '/filter-materials', label: '滤材管理', shortLabel: '滤材', icon: Filter },
  { to: '/maintenance', label: '维护日志', shortLabel: '维护', icon: Wrench },
  { to: '/water-quality', label: '水质监测', shortLabel: '水质', icon: Droplets },
];

export default function Layout() {
  const { tanks, activeTankId, setActiveTankId } = useAquaStore();
  const [tankDropdownOpen, setTankDropdownOpen] = useState(false);

  const activeTank = tanks.find((t) => t.id === activeTankId);

  return (
    <div className="flex h-screen bg-deep-sea text-foam overflow-hidden">
      <aside className="hidden md:flex md:flex-col md:w-[260px] md:min-w-[260px] bg-gradient-to-b from-deep-sea via-ocean to-shallow/60 bg-white/[0.06] backdrop-blur-xl border-r border-white/10">
        <div className="px-6 py-6">
          <h1 className="font-serif text-2xl font-bold text-foam tracking-wide">
            🐠 鱼缸滤材管家
          </h1>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/10 text-foam border-l-[3px] border-coral pl-[13px]'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5 border-l-[3px] border-transparent'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-4 relative">
          <button
            onClick={() => setTankDropdownOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-lg bg-white/[0.06] border border-white/10 text-sm text-foam/80 hover:bg-white/10 transition-colors"
          >
            <span className="truncate">
              {activeTank ? activeTank.name : '选择鱼缸'}
            </span>
            <ChevronDown
              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                tankDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {tankDropdownOpen && (
            <ul className="absolute bottom-full left-3 right-3 mb-1 rounded-lg bg-ocean/95 backdrop-blur-xl border border-white/10 shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
              {tanks.length === 0 && (
                <li className="px-4 py-2.5 text-sm text-white/40">暂无鱼缸</li>
              )}
              {tanks.map((tank) => (
                <li key={tank.id}>
                  <button
                    onClick={() => {
                      setActiveTankId(tank.id);
                      setTankDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      tank.id === activeTankId
                        ? 'text-coral bg-white/10'
                        : 'text-foam/70 hover:bg-white/5 hover:text-foam'
                    }`}
                  >
                    {tank.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-gradient-to-r from-deep-sea via-ocean to-deep-sea/95 backdrop-blur-xl border-t border-white/10">
        {navItems.map(({ to, shortLabel, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] transition-colors ${
                isActive ? 'text-coral' : 'text-white/40'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{shortLabel}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

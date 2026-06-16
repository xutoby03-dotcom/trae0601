import { NavLink } from 'react-router-dom';
import { Home, Refrigerator, BarChart3, Plus } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  onAddClick: () => void;
}

const navItems = [
  { to: '/', icon: Home, label: '今日冰箱', emoji: '🧊' },
  { to: '/fridge', icon: Refrigerator, label: '食材分区', emoji: '❄️' },
  { to: '/stats', icon: BarChart3, label: '浪费统计', emoji: '📊' },
];

export function Sidebar({ onAddClick }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-xl border-r border-emerald-100 flex flex-col z-40">
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl shadow-lg shadow-emerald-200/50">
            🧊
          </div>
          <div>
            <h1
              className="text-xl font-bold text-slate-800"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              冰箱管家
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">别再让冰箱变盲盒</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200/60 scale-[1.02]'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4">
        <button
          onClick={onAddClick}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-500 text-white font-medium shadow-lg shadow-orange-200/60 flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0"
        >
          <Plus className="w-5 h-5" />
          录入新食材
        </button>

        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
          <div className="flex items-start gap-2">
            <span className="text-lg">💡</span>
            <div>
              <p className="text-xs font-medium text-emerald-700">小贴士</p>
              <p className="text-xs text-emerald-600/80 mt-1 leading-relaxed">
                开封后的酸奶、豆腐、熟食要尽快吃完哦！
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PawPrint, Syringe, RotateCcw } from 'lucide-react';
import { usePetStore } from '../../store/usePetStore';

export function Sidebar() {
  const resetAll = usePetStore((s) => s.resetAll);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-xl text-white shadow-md shadow-emerald-200">
          🐾
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            宠物免疫登记
          </h1>
          <p className="text-[11px] text-slate-500 leading-tight">小区物业版</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        <SidebarItem to="/" icon={LayoutDashboard} label="首页看板" />
        <SidebarItem to="/pets" icon={PawPrint} label="宠物档案" />
        <SidebarItem to="/vaccines" icon={Syringe} label="疫苗记录" />
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          onClick={resetAll}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          重置为演示数据
        </button>
      </div>
    </aside>
  );
}

function SidebarItem({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-200'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`
      }
    >
      <Icon className="h-4.5 w-4.5" strokeWidth={2} />
      {label}
    </NavLink>
  );
}

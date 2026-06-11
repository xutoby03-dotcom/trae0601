import { Link, useLocation } from 'react-router-dom';
import { Wrench, LayoutDashboard, ClipboardList, UserRound, RotateCcw } from 'lucide-react';
import { useTicketStore } from '@/store/useTicketStore';
import type { UserRole } from '@/types';

const roleConfig: { key: UserRole; label: string; icon: typeof Wrench }[] = [
  { key: 'student', label: '学生端', icon: ClipboardList },
  { key: 'worker', label: '维修员', icon: Wrench },
  { key: 'admin', label: '管理员', icon: LayoutDashboard },
];

const navByRole: Record<UserRole, { to: string; label: string; icon: typeof Wrench }[]> = {
  student: [
    { to: '/', label: '我的报修', icon: ClipboardList },
    { to: '/submit', label: '新建报修', icon: Wrench },
  ],
  worker: [{ to: '/workbench', label: '工作台', icon: LayoutDashboard }],
  admin: [{ to: '/admin', label: '管理看板', icon: LayoutDashboard }],
};

export default function Navbar() {
  const { role, setRole, resetData } = useTicketStore();
  const location = useLocation();

  const navItems = navByRole[role];

  return (
    <header className="sticky top-0 z-40 backdrop-blur-lg bg-cream-50/80 border-b border-teal-600/10">
      <div className="container py-4 flex items-center justify-between gap-4 relative z-10">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-card group-hover:shadow-cardHover transition-shadow">
            <Wrench className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-bold text-ink-500 tracking-wide">宿舍报修</div>
            <div className="text-xs text-ink-300">Dorm Repair System</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-teal-600 text-white shadow-card'
                    : 'text-ink-400 hover:text-teal-700 hover:bg-teal-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-cream-100 border border-teal-600/10">
            {roleConfig.map((rc) => {
              const Icon = rc.icon;
              const active = role === rc.key;
              return (
                <button
                  key={rc.key}
                  onClick={() => setRole(rc.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-white text-teal-700 shadow-soft'
                      : 'text-ink-300 hover:text-ink-500'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{rc.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cream-100 border border-teal-600/10">
            <div className="w-7 h-7 rounded-full bg-teal-100 flex items-center justify-center">
              <UserRound className="w-4 h-4 text-teal-700" />
            </div>
            <button
              onClick={resetData}
              title="重置数据"
              className="text-ink-300 hover:text-orange-500 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <nav className="md:hidden flex items-center justify-around border-t border-teal-600/5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center gap-1 px-4 py-1 rounded-lg text-[11px] font-medium ${
                active ? 'text-teal-700' : 'text-ink-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

import { useMemo } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  CalendarDays, CreditCard, PieChart, Plus, Receipt, Sparkles,
} from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { cn, generateSmartSuggestions } from '@/utils/helpers';

const navItems = [
  { to: '/', label: '仪表盘', icon: CalendarDays, end: true },
  { to: '/subscriptions', label: '订阅管理', icon: CreditCard },
  { to: '/stats', label: '统计分析', icon: PieChart },
];

export default function AppLayout() {
  const openAdd = useSubscriptionStore((s) => s.openAddModal);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const suggestions = useMemo(() => generateSmartSuggestions(subscriptions), [subscriptions]);
  const unconfirmed = suggestions.find((s) => s.type === 'unconfirmed');

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-white/5 p-5 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-xl shadow-glow">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight">SubTrack</h1>
            <p className="text-xs text-slate-400">订阅管家</p>
          </div>
        </div>

        <nav className="space-y-1 flex-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <div className={cn('sidebar-link', isActive && 'active')}>
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {to === '/subscriptions' && unconfirmed && (
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                      {unconfirmed.subscriptionIds.length}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <button onClick={openAdd} className="btn-primary w-full mt-6">
          <Plus className="w-4 h-4" />
          <span>新增订阅</span>
        </button>

        <div className="glass-card p-4 mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold">智能建议</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">共 {suggestions.length} 条待处理</p>
          <div className="space-y-2">
            {suggestions.slice(0, 2).map((s) => (
              <div key={s.id} className="text-[11px] p-2 rounded-lg bg-black/20 border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'w-1.5 h-1.5 rounded-full shrink-0',
                      s.severity === 'high' && 'bg-red-500',
                      s.severity === 'medium' && 'bg-amber-500',
                      s.severity === 'low' && 'bg-sky-500'
                    )}
                  />
                  <span className="font-medium truncate">{s.title}</span>
                </div>
              </div>
            ))}
            {suggestions.length === 0 && (
              <p className="text-[11px] text-slate-500">✨ 一切正常</p>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/5">
          <p className="text-[11px] text-slate-500">💾 本地存储 · 数据安全</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden sticky top-0 z-30 backdrop-blur-xl bg-background/80 border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold">SubTrack</span>
          </div>
          <button onClick={openAdd} className="btn-primary !px-3 !py-2 text-sm">
            <Plus className="w-4 h-4" />
          </button>
        </header>

        <nav className="lg:hidden flex gap-1 px-4 py-2 border-b border-white/5 overflow-x-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}>
              {({ isActive }) => (
                <div className={cn('sidebar-link !px-3 !py-2 text-xs whitespace-nowrap', isActive && 'active')}>
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

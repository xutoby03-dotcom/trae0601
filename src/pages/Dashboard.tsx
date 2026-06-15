import { useMemo } from 'react';
import SummaryCards from '@/components/SummaryCards';
import CalendarView from '@/components/CalendarView';
import UpcomingList from '@/components/UpcomingList';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { Plus, Wand2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isSameMonth } from 'date-fns';
import {
  formatCurrency, formatMonthLabel, getMonthlyTotal,
  getTotalAnnual, generateSmartSuggestions,
} from '@/utils/helpers';

export default function Dashboard() {
  const selectedMonth = useSubscriptionStore((s) => s.selectedMonth);
  const subscriptions = useSubscriptionStore((s) => s.subscriptions);
  const openAdd = useSubscriptionStore((s) => s.openAddModal);

  const monthlySum = useMemo(() => getMonthlyTotal(subscriptions, selectedMonth), [subscriptions, selectedMonth]);
  const annualProjection = useMemo(() => getTotalAnnual(subscriptions), [subscriptions]);
  const subscriptionCount = subscriptions.length;
  const suggestions = useMemo(() => generateSmartSuggestions(subscriptions), [subscriptions]);
  const potentialSavings = useMemo(
    () => suggestions.filter((s) => s.potentialSaving).reduce((sum, s) => sum + (s.potentialSaving || 0), 0),
    [suggestions]
  );

  const now = new Date();
  const [selYear, selMonth] = selectedMonth.split('-').map(Number);
  const selDate = new Date(selYear, selMonth - 1, 1);
  const monthLabel = useMemo(() => {
    if (isSameMonth(selDate, now)) return '本月';
    const nextMonthDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    if (isSameMonth(selDate, nextMonthDate)) return '下个月';
    return formatMonthLabel(selectedMonth);
  }, [selDate, now, selectedMonth]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/25 text-teal-300 text-xs font-medium mb-3">
            <Wand2 className="w-3.5 h-3.5" />
            <span>{formatMonthLabel(selectedMonth)} 财务概览</span>
          </div>
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight leading-tight">
            {monthLabel} <span className="text-teal-400">{formatCurrency(monthlySum > 0 ? monthlySum : annualProjection / 12)}</span>
            <br className="sm:hidden" />
            <span className="text-slate-300 text-2xl md:text-3xl ml-2 md:ml-3">的订阅已安排</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            共管理 <span className="text-slate-200 font-medium">{subscriptionCount}</span> 项订阅，
            年化预估 <span className="text-amber-400 font-medium">{formatCurrency(annualProjection)}</span>
            {potentialSavings > 0 && (
              <span className="ml-2">
                · 通过建议可节省约 <span className="text-teal-400 font-medium">{formatCurrency(potentialSavings)}</span>/年
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/stats" className="btn-secondary">
            查看统计
          </Link>
          <button onClick={openAdd} className="btn-primary">
            <Plus className="w-4 h-4" />
            <span>添加订阅</span>
          </button>
        </div>
      </div>

      <SummaryCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <CalendarView />
        </div>
        <div className="xl:col-span-1">
          <UpcomingList />
        </div>
      </div>
    </div>
  );
}

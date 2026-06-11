import { useMemo } from 'react';
import { useReimbursementStore } from '../../store/useReimbursementStore';
import { AmountCard } from '../../components/AmountCard';
import { formatCurrency } from '../../utils/format';
import { Empty } from '../../components/Empty';

const Summary = () => {
  const { items } = useReimbursementStore();

  const stats = useMemo(() => {
    const total = items.reduce((s, i) => s + i.amount, 0);
    const approved = items.filter((i) => i.status === 'approved');
    const approvedTotal = approved.reduce((s, i) => s + i.amount, 0);
    const pending = items.filter((i) => i.status === 'pending');
    const pendingTotal = pending.reduce((s, i) => s + i.amount, 0);
    const rejected = items.filter((i) => i.status === 'rejected');
    const rejectedTotal = rejected.reduce((s, i) => s + i.amount, 0);

    const byPerson: Record<string, number> = {};
    items.forEach((i) => {
      byPerson[i.applicant] = (byPerson[i.applicant] || 0) + i.amount;
    });

    const byMonth: Record<string, { total: number; count: number }> = {};
    items.forEach((i) => {
      const month = i.date.substring(0, 7);
      if (!byMonth[month]) byMonth[month] = { total: 0, count: 0 };
      byMonth[month].total += i.amount;
      byMonth[month].count += 1;
    });

    return { total, approvedTotal, pendingTotal, rejectedTotal, byPerson, byMonth, count: items.length };
  }, [items]);

  const maxPersonAmount = Math.max(...Object.values(stats.byPerson), 0);
  const sortedMonths = Object.entries(stats.byMonth).sort(([a], [b]) => b.localeCompare(a));

  if (items.length === 0) {
    return <Empty title="暂无数据" description="提交报销后即可查看统计" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">报销统计</h2>
        <p className="text-gray-500">查看报销数据概览和趋势</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AmountCard amount={stats.total} label="总计" prefix={`${stats.count} 笔`} />
        <AmountCard amount={stats.approvedTotal} label="已通过" />
        <AmountCard amount={stats.pendingTotal} label="待审核" />
        <AmountCard amount={stats.rejectedTotal} label="已拒绝" />
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-gray-900 mb-4">按申请人统计</h3>
        <div className="space-y-4">
          {Object.entries(stats.byPerson)
            .sort(([, a], [, b]) => b - a)
            .map(([name, amount]) => (
              <div key={name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{name}</span>
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(amount)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                    style={{ width: `${maxPersonAmount ? (amount / maxPersonAmount) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {sortedMonths.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-900 mb-4">按月统计</h3>
          <div className="space-y-3">
            {sortedMonths.map(([month, data]) => (
              <div key={month} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-medium text-gray-900">{month}</p>
                  <p className="text-sm text-gray-500">{data.count} 笔</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(data.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;

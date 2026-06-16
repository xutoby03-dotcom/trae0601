import { useMemo } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { useFleetStore } from '../store/fleetStore';
import { Car, Users, DollarSign, TrendingUp, ArrowRightLeft, Download } from 'lucide-react';
import { formatMoney, cn } from '../utils/helpers';
import { motion } from 'framer-motion';
import VehicleExpenseChart from '../components/settlement/VehicleExpenseChart';
import SettlementTable from '../components/settlement/SettlementTable';

interface TransferSuggestion {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  amount: number;
}

export default function Settlement() {
  const { people, expenses, getPersonSettlement, getTotalExpenses } = useFleetStore();
  const totalExpenses = getTotalExpenses();
  const settlements = getPersonSettlement();

  const perPersonExpense = people.length > 0 ? totalExpenses / people.length : 0;

  const statCards = [
    {
      label: '总费用',
      value: formatMoney(totalExpenses),
      icon: DollarSign,
      gradient: 'from-forest-500 to-forest-700',
    },
    {
      label: '参与人数',
      value: people.length,
      icon: Users,
      gradient: 'from-warm-500 to-warm-700',
    },
    {
      label: '人均费用',
      value: formatMoney(perPersonExpense),
      icon: TrendingUp,
      gradient: 'from-blue-500 to-blue-700',
    },
    {
      label: '已记录笔数',
      value: expenses.length,
      icon: Car,
      gradient: 'from-purple-500 to-purple-700',
    },
  ];

  const transferSuggestions = useMemo<TransferSuggestion[]>(() => {
    const debtors = settlements
      .filter((s) => s.balance < -0.01)
      .map((s) => ({ ...s, remaining: Math.abs(s.balance) }))
      .sort((a, b) => b.remaining - a.remaining);

    const creditors = settlements
      .filter((s) => s.balance > 0.01)
      .map((s) => ({ ...s, remaining: s.balance }))
      .sort((a, b) => b.remaining - a.remaining);

    const suggestions: TransferSuggestion[] = [];
    let i = 0;
    let j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.remaining, creditor.remaining);

      if (amount > 0.01) {
        suggestions.push({
          from: debtor.personId,
          fromName: debtor.name,
          to: creditor.personId,
          toName: creditor.name,
          amount,
        });
      }

      debtor.remaining -= amount;
      creditor.remaining -= amount;

      if (debtor.remaining < 0.01) i++;
      if (creditor.remaining < 0.01) j++;
    }

    return suggestions;
  }, [settlements]);

  const handleExport = () => {
    const rows = [
      ['姓名', '已支付金额', '应承担金额', '差额'],
      ...settlements.map((s) => [
        s.name,
        s.paid.toFixed(2),
        s.shouldPay.toFixed(2),
        s.balance.toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '费用结算明细.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout
      title="费用结算"
      subtitle="查看本次行程的费用明细与分摊方案"
      actions={
        <button
          onClick={handleExport}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出明细
        </button>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -4 }}
                className={cn(
                  'relative overflow-hidden rounded-xl p-5 text-white shadow-card bg-gradient-to-br',
                  card.gradient
                )}
              >
                <div className="absolute right-0 top-0 opacity-10">
                  <Icon className="w-32 h-32 -mr-4 -mt-4" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">{card.label}</span>
                  </div>
                  <p className="font-serif text-3xl font-bold">{card.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <VehicleExpenseChart />

        <SettlementTable />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="card p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <ArrowRightLeft className="w-5 h-5 text-forest-600" />
            <h3 className="font-serif text-lg font-semibold text-forest-800">转账建议</h3>
          </div>

          {transferSuggestions.length > 0 ? (
            <div className="space-y-3">
              {transferSuggestions.map((s, idx) => (
                <motion.div
                  key={`${s.from}-${s.to}-${idx}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + idx * 0.08, duration: 0.3 }}
                  className="flex items-center justify-between p-4 rounded-xl bg-cream-50 border border-cream-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold">
                        {s.fromName.charAt(0)}
                      </div>
                      <span className="font-medium text-forest-800">{s.fromName}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4">
                      <div className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center">
                        <ArrowRightLeft className="w-4 h-4 text-warm-600" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold">
                        {s.toName.charAt(0)}
                      </div>
                      <span className="font-medium text-forest-800">{s.toName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl font-bold text-warm-600">
                      {formatMoney(s.amount)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">支付金额</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <ArrowRightLeft className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>无需转账，所有账目已结清</p>
            </div>
          )}
        </motion.div>
      </div>
    </PageLayout>
  );
}

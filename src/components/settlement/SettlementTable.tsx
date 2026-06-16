import { useMemo } from 'react';
import { useFleetStore } from '../../store/fleetStore';
import { formatMoney, cn } from '../../utils/helpers';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function SettlementTable() {
  const { getPersonSettlement } = useFleetStore();
  const settlements = getPersonSettlement();

  const totals = useMemo(() => {
    return settlements.reduce(
      (acc, s) => ({
        paid: acc.paid + s.paid,
        shouldPay: acc.shouldPay + s.shouldPay,
        balance: acc.balance + s.balance,
      }),
      { paid: 0, shouldPay: 0, balance: 0 }
    );
  }, [settlements]);

  const getBalanceStyle = (balance: number) => {
    if (balance > 0.01) {
      return 'text-green-600 bg-green-50';
    }
    if (balance < -0.01) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-500 bg-gray-50';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0.01) {
      return <TrendingUp className="w-4 h-4" />;
    }
    if (balance < -0.01) {
      return <TrendingDown className="w-4 h-4" />;
    }
    return <Minus className="w-4 h-4" />;
  };

  const getBalanceLabel = (balance: number) => {
    if (balance > 0.01) {
      return '应收';
    }
    if (balance < -0.01) {
      return '应付';
    }
    return '结清';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="card p-5 overflow-hidden"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg font-semibold text-forest-800">人均分摊明细</h3>
        <span className="text-sm text-gray-500">共 {settlements.length} 人</span>
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cream-200">
              <th className="text-left py-3 px-3 text-sm font-medium text-gray-600">姓名</th>
              <th className="text-right py-3 px-3 text-sm font-medium text-gray-600">已支付金额</th>
              <th className="text-right py-3 px-3 text-sm font-medium text-gray-600">应承担金额</th>
              <th className="text-right py-3 px-3 text-sm font-medium text-gray-600">差额</th>
            </tr>
          </thead>
          <tbody>
            {settlements.map((s, idx) => (
              <motion.tr
                key={s.personId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.05, duration: 0.3 }}
                className="border-b border-cream-100 hover:bg-cream-50 transition-colors"
              >
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-forest-400 to-forest-600 flex items-center justify-center text-white text-sm font-medium">
                      {s.name.charAt(0)}
                    </div>
                    <span className="font-medium text-forest-800">{s.name}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right font-mono text-forest-800">
                  {formatMoney(s.paid)}
                </td>
                <td className="py-3 px-3 text-right font-mono text-gray-600">
                  {formatMoney(s.shouldPay)}
                </td>
                <td className="py-3 px-3 text-right">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium',
                      getBalanceStyle(s.balance)
                    )}
                  >
                    {getBalanceIcon(s.balance)}
                    <span>
                      {getBalanceLabel(s.balance)} {formatMoney(Math.abs(s.balance))}
                    </span>
                  </span>
                </td>
              </motion.tr>
            ))}
            {settlements.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400">
                  暂无参与人员
                </td>
              </tr>
            )}
          </tbody>
          {settlements.length > 0 && (
            <tfoot>
              <tr className="bg-cream-50 border-t-2 border-cream-300">
                <td className="py-3 px-3 font-semibold text-forest-800">合计</td>
                <td className="py-3 px-3 text-right font-mono font-semibold text-forest-800">
                  {formatMoney(totals.paid)}
                </td>
                <td className="py-3 px-3 text-right font-mono font-semibold text-forest-800">
                  {formatMoney(totals.shouldPay)}
                </td>
                <td className="py-3 px-3 text-right">
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold',
                      getBalanceStyle(totals.balance)
                    )}
                  >
                    {getBalanceIcon(totals.balance)}
                    <span>
                      {getBalanceLabel(totals.balance)} {formatMoney(Math.abs(totals.balance))}
                    </span>
                  </span>
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </motion.div>
  );
}

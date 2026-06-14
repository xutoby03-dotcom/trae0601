import { useParams } from 'react-router-dom';
import {
  Calculator,
  TrendingUp,
  Users,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle,
  Crown,
  Medal,
  Medal as Bronze,
} from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatCurrency, calculateSettlement } from '@/utils/calculation';
import PageLayout from '@/components/PageLayout';
import { cn } from '@/lib/utils';

export default function Settlement() {
  const { id } = useParams();
  const getTrip = useTripStore(state => state.getTrip);
  const trip = getTrip(id!);

  if (!trip) {
    return (
      <PageLayout showBack title="费用结算">
        <div className="text-center py-20 text-stone-400">行程不存在</div>
      </PageLayout>
    );
  }

  const settlement = calculateSettlement(trip);

  const sortedByPaid = [...settlement.items].sort((a, b) => b.alreadyPaid - a.alreadyPaid);
  const sortedByBalance = [...settlement.items].sort((a, b) => b.balance - a.balance);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown size={18} className="text-yellow-500" />;
    if (index === 1) return <Medal size={18} className="text-stone-400" />;
    if (index === 2) return <Bronze size={18} className="text-amber-600" />;
    return null;
  };

  return (
    <PageLayout title="费用结算" showBack>
      <div className="px-4 pt-4 space-y-4">
        <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-xl shadow-teal-200">
          <div className="text-center mb-4">
            <p className="text-teal-200 text-sm mb-1">本次行程总费用</p>
            <h2 className="text-4xl font-bold font-serif">
              {formatCurrency(settlement.totalCost)}
            </h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-teal-400/30">
            <div className="text-center">
              <p className="text-teal-200 text-xs mb-1">人均费用</p>
              <p className="text-xl font-bold">{formatCurrency(settlement.averageCost)}</p>
            </div>
            <div className="text-center">
              <p className="text-teal-200 text-xs mb-1">参与人数</p>
              <p className="text-xl font-bold">{trip.passengers.length}人</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Crown size={18} className="text-yellow-500" />
            垫付排行榜
          </h3>
          <div className="space-y-3">
            {sortedByPaid.slice(0, 3).map((item, index) => (
              <div
                key={item.passengerId}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl',
                  index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                  index === 1 ? 'bg-stone-50' : 'bg-amber-50'
                )}
              >
                <div className="w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {item.passengerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-stone-800">
                    {item.passengerName}
                    {item.passengerName === trip.driverName && (
                      <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        司机
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-stone-500">已垫付</p>
                </div>
                <p className="font-bold text-stone-800">
                  {formatCurrency(item.alreadyPaid)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Calculator size={18} className="text-orange-500" />
            个人结算明细
          </h3>
          <div className="space-y-3">
            {settlement.items.map(item => {
              const isZero = Math.abs(item.balance) < 0.01;
              const owes = item.balance > 0;
              return (
                <div
                  key={item.passengerId}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    isZero
                      ? 'bg-green-50 border-green-200'
                      : owes
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-teal-50 border-teal-200'
                  )}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                      {item.passengerName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-stone-800">
                        {item.passengerName}
                        {item.passengerName === trip.driverName && (
                          <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                            司机
                          </span>
                        )}
                      </p>
                    </div>
                    {isZero && (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle size={16} />
                        已结清
                      </span>
                    )}
                    {!isZero && owes && (
                      <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                        <ArrowUpRight size={16} />
                        需补付
                      </span>
                    )}
                    {!isZero && !owes && (
                      <span className="flex items-center gap-1 text-teal-600 text-sm font-medium">
                        <ArrowDownRight size={16} />
                        应收回
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-white/60 rounded-lg py-2">
                      <p className="text-xs text-stone-500 mb-1">应付</p>
                      <p className="font-bold text-stone-700">
                        {formatCurrency(item.shouldPay)}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg py-2">
                      <p className="text-xs text-stone-500 mb-1">已付</p>
                      <p className="font-bold text-stone-700">
                        {formatCurrency(item.alreadyPaid)}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg py-2">
                      <p className="text-xs text-stone-500 mb-1">差额</p>
                      <p
                        className={cn(
                          'font-bold',
                          isZero
                            ? 'text-green-600'
                            : owes
                            ? 'text-orange-600'
                            : 'text-teal-600'
                        )}
                      >
                        {owes ? '+' : ''}
                        {formatCurrency(Math.abs(item.balance))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100">
          <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-orange-500" />
            转账建议
          </h3>
          <div className="space-y-3">
            {sortedByBalance
              .filter(item => item.balance > 0.01)
              .map(debtor => {
                const creditors = sortedByBalance.filter(item => item.balance < -0.01);
                return creditors.map(creditor => {
                  const transferAmount = Math.min(
                    debtor.balance,
                    Math.abs(creditor.balance)
                  );
                  if (transferAmount < 0.01) return null;
                  return (
                    <div
                      key={`${debtor.passengerId}-${creditor.passengerId}`}
                      className="flex items-center justify-between p-3 bg-stone-50 rounded-xl"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs">
                          {debtor.passengerName.charAt(0)}
                        </div>
                        <span className="text-sm font-medium text-stone-700">
                          {debtor.passengerName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-orange-500">
                        <ArrowUpRight size={16} />
                        <span className="font-bold">
                          {formatCurrency(transferAmount)}
                        </span>
                        <ArrowUpRight size={16} className="rotate-90" />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-stone-700">
                          {creditor.passengerName}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white font-bold text-xs">
                          {creditor.passengerName.charAt(0)}
                        </div>
                      </div>
                    </div>
                  );
                });
              })}
            {settlement.items.every(item => Math.abs(item.balance) < 0.01) && (
              <p className="text-center text-stone-400 py-4 text-sm">
                所有费用已结清 ✓
              </p>
            )}
          </div>
        </div>

        <div className="bg-stone-100 rounded-xl p-4">
          <p className="text-xs text-stone-500 text-center">
            💡 以上为系统自动计算，仅供参考。如有疑问请与同行伙伴核对。
          </p>
        </div>
      </div>
    </PageLayout>
  );
}

import { useState } from 'react';
import { Check, X, User, CreditCard, Package, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Order, Settlement } from '@/types';
import { formatCurrency } from '@/types';
import { calculateSettlements } from '@/utils/calculator';

interface SettlementPanelProps {
  order: Order;
  payments: Record<string, number>;
  pickupStatus: Record<string, boolean>;
  onSetPayment: (participantId: string, amount: number) => void;
  onSetPickup: (participantId: string, pickedUp: boolean) => void;
}

export default function SettlementPanel({
  order,
  payments,
  pickupStatus,
  onSetPayment,
  onSetPickup,
}: SettlementPanelProps) {
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const paymentsMap = new Map(Object.entries(payments || {}));
  const pickupMap = new Map(Object.entries(pickupStatus || {}));

  const settlements: Settlement[] = calculateSettlements(
    order.id,
    order.participants,
    order.items,
    order.adjustments,
    order.totalShipping,
    order.totalTax,
    order.allocationMethod,
    order.exchangeRate,
    paymentsMap,
    pickupMap
  );

  const handleStartEditPayment = (participantId: string, currentAmount: number) => {
    setEditingPayment(participantId);
    setPaymentAmount(currentAmount.toString());
  };

  const handleSavePayment = (participantId: string) => {
    const amount = parseFloat(paymentAmount) || 0;
    onSetPayment(participantId, amount);
    setEditingPayment(null);
    setPaymentAmount('');
  };

  const handleMarkAllPaid = () => {
    settlements.forEach((s) => {
      if (!s.isPaid) {
        onSetPayment(s.participantId, s.totalPayable);
      }
    });
  };

  const handleMarkAllPickedUp = () => {
    order.participants.forEach((p) => {
      if (!pickupMap.get(p.id)) {
        onSetPickup(p.id, true);
      }
    });
  };

  const allPaid = settlements.every((s) => s.isPaid);
  const allPickedUp = order.participants.every((p) => pickupMap.get(p.id));
  const completedCount = settlements.filter((s) => s.isPaid).length;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-serif text-lg font-bold text-neutral-800">结算中心</h2>
          <p className="text-sm text-neutral-500 mt-1">
            已结清 {completedCount}/{order.participants.length} 人
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMarkAllPaid}
            disabled={allPaid}
            className="btn-ghost flex items-center gap-1.5 text-sm"
          >
            <Check className="w-4 h-4" />
            全部已付
          </button>
          <button
            onClick={handleMarkAllPickedUp}
            disabled={allPickedUp}
            className="btn-ghost flex items-center gap-1.5 text-sm"
          >
            <Package className="w-4 h-4" />
            全部取货
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {order.participants.map((participant, index) => {
          const settlement = settlements.find((s) => s.participantId === participant.id);
          if (!settlement) return null;

          const isEditing = editingPayment === participant.id;
          const isPickedUp = pickupMap.get(participant.id) || false;
          const remaining = Math.max(0, settlement.totalPayable - settlement.amountPaid);

          return (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`p-5 rounded-2xl transition-all ${
                settlement.isPaid && isPickedUp
                  ? 'bg-green-50 border-2 border-green-200'
                  : settlement.isPaid
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-white border-2 border-neutral-100'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-700">
                      {participant.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800">{participant.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span
                        className={`badge ${
                          settlement.isPaid ? 'badge-success' : 'badge-warning'
                        }`}
                      >
                        {settlement.isPaid ? '已付清' : '待付款'}
                      </span>
                      <span
                        className={`badge ${isPickedUp ? 'badge-success' : 'badge-warning'}`}
                      >
                        {isPickedUp ? '已取货' : '待取货'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-neutral-500 mb-1">应付总额</p>
                  <p className="font-serif text-2xl font-bold text-primary-800">
                    {formatCurrency(settlement.totalPayable)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4 p-3 bg-white/60 rounded-xl">
                <div className="text-center">
                  <p className="text-xs text-neutral-500">商品金额</p>
                  <p className="font-semibold text-neutral-700">
                    {formatCurrency(settlement.itemsTotal)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">运费分摊</p>
                  <p className="font-semibold text-neutral-700">
                    {formatCurrency(settlement.shippingShare)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">税费分摊</p>
                  <p className="font-semibold text-neutral-700">
                    {formatCurrency(settlement.taxShare)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-neutral-500">调整项</p>
                  <p
                    className={`font-semibold ${
                      settlement.adjustmentShare >= 0 ? 'text-red-600' : 'text-green-600'
                    }`}
                  >
                    {settlement.adjustmentShare >= 0 ? '+' : ''}
                    {formatCurrency(settlement.adjustmentShare)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <CreditCard className="w-5 h-5 text-neutral-400" />
                  <div className="flex-1">
                    <p className="text-xs text-neutral-500 mb-1">已付金额</p>
                    {isEditing ? (
                      <div className="flex gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="input-field flex-1 py-1.5 text-sm"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePayment(participant.id)}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingPayment(null)}
                          className="p-2 bg-neutral-200 text-neutral-600 rounded-lg hover:bg-neutral-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-2 cursor-pointer hover:text-primary-600"
                        onClick={() => handleStartEditPayment(participant.id, settlement.amountPaid)}
                      >
                        <span className="font-semibold text-lg">
                          {formatCurrency(settlement.amountPaid)}
                        </span>
                        <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                      </div>
                    )}
                  </div>
                </div>

                {remaining > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">还需支付</p>
                    <p className="font-bold text-accent-coral">{formatCurrency(remaining)}</p>
                  </div>
                )}

                {settlement.refundDue > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">待退款</p>
                    <p className="font-bold text-accent-mint">{formatCurrency(settlement.refundDue)}</p>
                  </div>
                )}

                <button
                  onClick={() => onSetPickup(participant.id, !isPickedUp)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isPickedUp
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  {isPickedUp ? '已取货' : '标记取货'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

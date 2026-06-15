import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronUp, Package, DollarSign, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '@/store/useOrderStore';
import { formatCurrency, formatDate } from '@/types';
import { calculateSettlements } from '@/utils/calculator';
import Header from '@/components/layout/Header';

interface ParticipantDebt {
  participantId: string;
  name: string;
  totalUnpaid: number;
  orders: {
    orderId: string;
    orderPlatform: string;
    trackingNumber: string;
    orderDate: number;
    amount: number;
    isPaid: boolean;
    isPickedUp: boolean;
  }[];
}

export default function History() {
  const navigate = useNavigate();
  const { orders, payments, pickupStatus } = useOrderStore();
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedParticipant(expandedParticipant === id ? null : id);
  };

  const participantDebts = orders.reduce((acc, order) => {
    const orderPayments = new Map(Object.entries(payments[order.id] || {}));
    const orderPickup = new Map(Object.entries(pickupStatus[order.id] || {}));

    const settlements = calculateSettlements(
      order.id,
      order.participants,
      order.items,
      order.adjustments,
      order.totalShipping,
      order.totalTax,
      order.allocationMethod,
      order.exchangeRate,
      orderPayments,
      orderPickup
    );

    settlements.forEach((s) => {
      if (s.totalPayable > 0 && !s.isPaid) {
        if (!acc[s.participantId]) {
          const participant = order.participants.find((p) => p.id === s.participantId);
          acc[s.participantId] = {
            participantId: s.participantId,
            name: participant?.name || '未知',
            totalUnpaid: 0,
            orders: [],
          };
        }
        acc[s.participantId].totalUnpaid += s.totalPayable - s.amountPaid;
        acc[s.participantId].orders.push({
          orderId: order.id,
          orderPlatform: order.platform,
          trackingNumber: order.trackingNumber,
          orderDate: order.createdAt,
          amount: s.totalPayable - s.amountPaid,
          isPaid: s.isPaid,
          isPickedUp: orderPickup.get(s.participantId) || false,
        });
      }
    });

    return acc;
  }, {} as Record<string, ParticipantDebt>);

  const debtList = Object.values(participantDebts).sort((a, b) => b.totalUnpaid - a.totalUnpaid);

  const totalUnpaid = debtList.reduce((sum, d) => sum + d.totalUnpaid, 0);

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-serif text-3xl font-bold text-neutral-800">未结清记录</h1>
          <p className="text-neutral-500 mt-1">追踪未付款和未取货的参与人</p>
        </motion.div>

        {debtList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-neutral-800 mb-2">
              太棒了！
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              所有订单都已结清，没有待付款或待取货的记录。
            </p>
            <button onClick={() => navigate('/')} className="btn-primary">
              返回订单列表
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card mb-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-accent-coral/10 to-accent-coral/20 rounded-2xl flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-accent-coral" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-neutral-800">待收总金额</h3>
                    <p className="text-neutral-500">共 {debtList.length} 人未结清</p>
                  </div>
                </div>
                <p className="font-serif text-4xl font-bold text-accent-coral">
                  {formatCurrency(totalUnpaid)}
                </p>
              </div>
            </motion.div>

            <div className="space-y-4">
              {debtList.map((debt, index) => {
                const isExpanded = expandedParticipant === debt.participantId;

                return (
                  <motion.div
                  key={debt.participantId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + index * 0.05 }}
                  className="card overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleExpand(debt.participantId)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-primary-700">
                          {debt.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-neutral-800">{debt.name}</h3>
                        <p className="text-sm text-neutral-500">
                          {debt.orders.length} 个订单待处理
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">待付金额</p>
                        <p className="font-serif text-2xl font-bold text-accent-coral">
                          {formatCurrency(debt.totalUnpaid)}
                        </p>
                      </div>
                      <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-neutral-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-neutral-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t border-neutral-100">
                        <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-neutral-500">
                          <div className="col-span-2">订单</div>
                          <div className="text-right">日期</div>
                          <div className="text-right">待付金额</div>
                          <div className="text-right">状态</div>
                        </div>

                        {debt.orders.map((order) => (
                          <div
                            key={order.orderId}
                            className="grid grid-cols-5 gap-4 px-4 py-3 rounded-xl hover:bg-neutral-50 items-center cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/order/${order.orderId}`);
                            }}
                          >
                            <div className="col-span-2">
                              <p className="font-medium text-neutral-800">
                                {order.orderPlatform}
                              </p>
                              <p className="text-xs text-neutral-500">{order.trackingNumber}
                              </p>
                            </div>
                            <div className="text-right text-neutral-600">
                              {formatDate(order.orderDate)}
                            </div>
                            <div className="text-right font-semibold text-accent-coral">
                              {formatCurrency(order.amount)}
                            </div>
                            <div className="flex justify-end gap-1">
                              {!order.isPaid && (
                                <span className="badge badge-warning">待付款</span>
                              )}
                              {!order.isPickedUp && (
                                <span className="badge badge-warning">待取货</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
          </>
        )}
      </main>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronUp, Package, DollarSign, User, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '@/store/useOrderStore';
import { formatCurrency, formatDate } from '@/types';
import { calculateSettlements } from '@/utils/calculator';
import Header from '@/components/layout/Header';

type FilterType = 'all' | 'unpaid' | 'unpicked';

interface ParticipantDebt {
  participantId: string;
  name: string;
  totalUnpaid: number;
  totalUnpicked: number;
  orders: {
    orderId: string;
    orderPlatform: string;
    trackingNumber: string;
    orderDate: number;
    unpaidAmount: number;
    payableAmount: number;
    isPaid: boolean;
    isPickedUp: boolean;
  }[];
}

export default function History() {
  const navigate = useNavigate();
  const { orders, payments, pickupStatus, setPayment, setPickupStatus } = useOrderStore();
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const toggleExpand = (id: string) => {
    setExpandedParticipant(expandedParticipant === id ? null : id);
  };

  const handleQuickPayment = (e: React.MouseEvent, orderId: string, participantId: string, amount: number) => {
    e.stopPropagation();
    if (confirm(`确认收到该笔款项 ${formatCurrency(amount)} 吗？`)) {
      setPayment(orderId, participantId, amount);
    }
  };

  const handleQuickPickup = (e: React.MouseEvent, orderId: string, participantId: string) => {
    e.stopPropagation();
    if (confirm('确认标记为已取货吗？')) {
      setPickupStatus(orderId, participantId, true);
    }
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
      const isPickedUp = orderPickup.get(s.participantId) || false;
      const hasUnpaid = s.totalPayable > 0 && !s.isPaid;
      const hasUnpicked = !isPickedUp;

      if (hasUnpaid || hasUnpicked) {
        if (!acc[s.participantId]) {
          const participant = order.participants.find((p) => p.id === s.participantId);
          acc[s.participantId] = {
            participantId: s.participantId,
            name: participant?.name || '未知',
            totalUnpaid: 0,
            totalUnpicked: 0,
            orders: [],
          };
        }
        if (hasUnpaid) {
          acc[s.participantId].totalUnpaid += s.totalPayable - s.amountPaid;
        }
        if (hasUnpicked) {
          acc[s.participantId].totalUnpicked += 1;
        }
        acc[s.participantId].orders.push({
          orderId: order.id,
          orderPlatform: order.platform,
          trackingNumber: order.trackingNumber,
          orderDate: order.createdAt,
          unpaidAmount: hasUnpaid ? s.totalPayable - s.amountPaid : 0,
          payableAmount: s.totalPayable,
          isPaid: s.isPaid,
          isPickedUp,
        });
      }
    });

    return acc;
  }, {} as Record<string, ParticipantDebt>);

  const debtList = Object.values(participantDebts).sort((a, b) => b.totalUnpaid - a.totalUnpaid);

  const filteredDebtList = debtList
    .map((debt) => {
      let filteredOrders = debt.orders;
      if (filter === 'unpaid') {
        filteredOrders = debt.orders.filter((o) => !o.isPaid);
      } else if (filter === 'unpicked') {
        filteredOrders = debt.orders.filter((o) => !o.isPickedUp);
      }
      return {
        ...debt,
        orders: filteredOrders,
        displayUnpaid: filteredOrders.reduce((sum, o) => sum + o.unpaidAmount, 0),
        displayUnpicked: filteredOrders.filter((o) => !o.isPickedUp).length,
      };
    })
    .filter((d) => d.orders.length > 0);

  const totalUnpaid = filteredDebtList.reduce((sum, d) => sum + d.displayUnpaid, 0);
  const totalUnpicked = filteredDebtList.reduce((sum, d) => sum + d.displayUnpicked, 0);
  const totalPeople = filteredDebtList.length;

  const filterOptions: { value: FilterType; label: string; icon: typeof DollarSign }[] = [
    { value: 'all', label: '全部', icon: AlertTriangle },
    { value: 'unpaid', label: '待付款', icon: DollarSign },
    { value: 'unpicked', label: '待取货', icon: Package },
  ];

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

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex gap-2 mb-6"
        >
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                  filter === option.value
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {option.label}
              </button>
            );
          })}
        </motion.div>

        {filteredDebtList.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-neutral-800 mb-2">
              {filter === 'unpaid' && '没有待付款订单'}
              {filter === 'unpicked' && '没有待取货订单'}
              {filter === 'all' && '太棒了！'}
            </h2>
            <p className="text-neutral-500 mb-6 max-w-md mx-auto">
              {filter === 'unpaid' && '所有订单都已付款，继续保持！'}
              {filter === 'unpicked' && '所有商品都已取货，效率真高！'}
              {filter === 'all' && '所有订单都已结清，没有待付款或待取货的记录。'}
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
                    <p className="text-neutral-500">共 {totalPeople} 人未结清</p>
                  </div>
                </div>
                <p className="font-serif text-4xl font-bold text-accent-coral">
                  {formatCurrency(totalUnpaid)}
                </p>
              </div>
            </motion.div>

            <div className="space-y-4">
              {filteredDebtList.map((debt, index) => {
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
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg text-neutral-800">{debt.name}</h3>
                          {debt.displayUnpicked > 0 && (
                            <span className="badge badge-info">
                              {debt.displayUnpicked} 件待取
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500">
                          {debt.orders.length} 个订单待处理
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs text-neutral-500">待付金额</p>
                        <p className="font-serif text-2xl font-bold text-accent-coral">
                          {formatCurrency(debt.displayUnpaid)}
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
                        <div className="grid grid-cols-6 gap-3 px-4 py-2 text-sm font-medium text-neutral-500">
                          <div className="col-span-2">订单</div>
                          <div className="text-right">日期</div>
                          <div className="text-right">
                            {filter === 'unpicked' ? '应付金额' : '待付金额'}
                          </div>
                          <div className="text-right">状态</div>
                          <div className="text-right">操作</div>
                        </div>

                        {debt.orders.map((order) => (
                          <div
                            key={order.orderId}
                            className="grid grid-cols-6 gap-3 px-4 py-3 rounded-xl hover:bg-neutral-50 items-center"
                          >
                            <div
                              className="col-span-2 cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/order/${order.orderId}`);
                              }}
                            >
                              <p className="font-medium text-neutral-800">
                                {order.orderPlatform}
                              </p>
                              <p className="text-xs text-neutral-500">{order.trackingNumber}
                              </p>
                            </div>
                            <div className="text-right text-neutral-600">
                              {formatDate(order.orderDate)}
                            </div>
                            <div className={`text-right font-semibold ${
                              order.isPaid ? 'text-neutral-400' : 'text-accent-coral'
                            }`}>
                              {filter === 'unpicked' && order.isPaid
                                ? formatCurrency(order.payableAmount)
                                : order.unpaidAmount > 0
                                  ? formatCurrency(order.unpaidAmount)
                                  : '-'
                              }
                            </div>
                            <div className="flex justify-end gap-1">
                              {!order.isPaid && (
                                <span className="badge badge-warning">待付款</span>
                              )}
                              {!order.isPickedUp && (
                                <span className="badge badge-warning">待取货</span>
                              )}
                            </div>
                            <div className="flex justify-end gap-1">
                              {!order.isPaid && (
                                <button
                                  onClick={(e) => handleQuickPayment(
                                    e,
                                    order.orderId,
                                    debt.participantId,
                                    order.payableAmount
                                  )}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                                  title="标记为已收款"
                                >
                                  <DollarSign className="w-3.5 h-3.5" />
                                  收款
                                </button>
                              )}
                              {!order.isPickedUp && (
                                <button
                                  onClick={(e) => handleQuickPickup(
                                    e,
                                    order.orderId,
                                    debt.participantId
                                  )}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors"
                                  title="标记为已取货"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  取货
                                </button>
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

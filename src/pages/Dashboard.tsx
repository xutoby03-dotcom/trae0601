import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Clock,
  Thermometer,
  AlertTriangle,
  User,
  Phone,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Snowflake,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { Order, PickupSlot } from '@/types';
import { PICKUP_SLOT_LABELS } from '@/types';
import { OrderStatusBadge, TempBadge } from '@/components/Badges';
import StatCard from '@/components/StatCard';
import {
  classNames,
  formatDateTime,
  getPickupSlotLabel,
  isTempAbnormal,
  isOrderTimedOut,
  timeRemaining,
} from '@/utils/helpers';

const SLOT_ORDER: PickupSlot[] = ['morning', 'noon', 'afternoon', 'evening'];
const SHORTAGE_COMPENSATION_PER_UNIT = 20;

export default function Dashboard() {
  const navigate = useNavigate();
  const { products, orders, inspections, markOrderTimeout } = useAppStore();
  const [now, setNow] = useState(new Date());

  // 每秒更新时间，用于超时检测
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 自动标记超时订单
  useEffect(() => {
    orders.forEach((order) => {
      if (order.status === 'pending') {
        const product = products.find((p) => p.id === order.productId);
        if (product && isOrderTimedOut(order.pickupSlot, product.arrivalTime, now)) {
          markOrderTimeout(order.id);
        }
      }
    });
  }, [now, orders, products, markOrderTimeout]);

  const stats = useMemo(() => {
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const timeoutCount = orders.filter((o) => o.status === 'timeout').length;

    let tempAbnormalCount = 0;
    inspections.forEach((ins) => {
      const product = products.find((p) => p.id === ins.productId);
      if (product && isTempAbnormal(product.tempZone, ins.temperature)) {
        const relatedOrders = orders.filter((o) => o.productId === product.id);
        tempAbnormalCount += relatedOrders.length;
      }
    });

    const shortageTotal = inspections.reduce((sum, ins) => sum + ins.shortageQuantity, 0);
    const shortageCompensation = shortageTotal * SHORTAGE_COMPENSATION_PER_UNIT;

    return {
      pending: pendingCount,
      timeout: timeoutCount,
      tempAbnormal: tempAbnormalCount,
      shortageCompensation,
    };
  }, [orders, inspections, products]);

  // 时段取货压力
  const slotPressure = useMemo(() => {
    const pressure: Record<PickupSlot, { total: number; pending: number; picked: number }> = {
      morning: { total: 0, pending: 0, picked: 0 },
      noon: { total: 0, pending: 0, picked: 0 },
      afternoon: { total: 0, pending: 0, picked: 0 },
      evening: { total: 0, pending: 0, picked: 0 },
    };
    orders.forEach((o) => {
      pressure[o.pickupSlot].total++;
      if (o.status === 'picked') {
        pressure[o.pickupSlot].picked++;
      } else {
        pressure[o.pickupSlot].pending++;
      }
    });
    return pressure;
  }, [orders]);

  const maxSlotTotal = Math.max(...Object.values(slotPressure).map((s) => s.total), 1);

  // 异常订单列表
  const abnormalOrders = useMemo(() => {
    const abnormal: (Order & { abnormalType: 'timeout' | 'temp' | 'shortage'; productName: string })[] = [];

    orders.forEach((order) => {
      const product = products.find((p) => p.id === order.productId);
      if (!product) return;

      if (order.status === 'timeout') {
        abnormal.push({ ...order, abnormalType: 'timeout', productName: product.name });
      } else {
        const inspection = inspections.find((i) => i.productId === product.id);
        if (inspection) {
          if (isTempAbnormal(product.tempZone, inspection.temperature)) {
            abnormal.push({ ...order, abnormalType: 'temp', productName: product.name });
          }
          if (inspection.shortageQuantity > 0) {
            abnormal.push({ ...order, abnormalType: 'shortage', productName: product.name });
          }
        }
      }
    });

    return abnormal.slice(0, 10);
  }, [orders, products, inspections]);

  const getAbnormalTypeInfo = (type: string) => {
    switch (type) {
      case 'timeout':
        return { label: '已超时', color: 'bg-red-500/15 text-red-400 border-red-500/30', icon: Clock };
      case 'temp':
        return { label: '温度异常', color: 'bg-orange-500/15 text-orange-400 border-orange-500/30', icon: Thermometer };
      case 'shortage':
        return { label: '可能缺货', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', icon: AlertTriangle };
      default:
        return { label: '异常', color: 'bg-slate-500/15 text-slate-400 border-slate-500/30', icon: AlertTriangle };
    }
  };

  // 温度异常的团品
  const tempAbnormalProducts = useMemo(() => {
    return products
      .map((p) => {
        const ins = inspections.find((i) => i.productId === p.id);
        if (!ins) return null;
        if (isTempAbnormal(p.tempZone, ins.temperature)) {
          return { product: p, inspection: ins };
        }
        return null;
      })
      .filter(Boolean) as { product: typeof products[number]; inspection: typeof inspections[number] }[];
  }, [products, inspections]);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">数据看板</h1>
          <p className="text-sm text-slate-400 mt-1">
            实时监控冷冻品交接情况 · 更新于 {formatDateTime(now.toISOString())}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-medium text-emerald-400">实时监控中</span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="待取货订单"
          value={stats.pending}
          icon={Package}
          color="sky"
          trend="-3"
          trendUp={false}
          subtitle="需要跟进取货"
        />
        <StatCard
          title="已超时订单"
          value={stats.timeout}
          icon={Clock}
          color="red"
          trend="+2"
          trendUp={true}
          subtitle="需要催促取货"
        />
        <StatCard
          title="温度异常"
          value={stats.tempAbnormal}
          icon={Thermometer}
          color="amber"
          subtitle="涉及的订单数"
        />
        <StatCard
          title="缺货补偿金额"
          value={`¥${stats.shortageCompensation}`}
          icon={AlertTriangle}
          color="violet"
          subtitle="待处理补偿"
        />
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 时段取货压力 */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">各时段取货压力</h3>
              <p className="text-sm text-slate-400 mt-0.5">今日取货订单分布</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-sky-500" />
                <span className="text-slate-400">待取货</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-400">已取货</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {SLOT_ORDER.map((slot) => {
              const data = slotPressure[slot];
              const pendingWidth = (data.pending / maxSlotTotal) * 100;
              const pickedWidth = (data.picked / maxSlotTotal) * 100;
              const isHighPressure = data.total >= 3;

              return (
                <div key={slot} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={classNames(
                          'text-sm font-medium',
                          isHighPressure ? 'text-white' : 'text-slate-400'
                        )}
                      >
                        {PICKUP_SLOT_LABELS[slot]}
                      </span>
                      {isHighPressure && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <TrendingUp className="w-3 h-3" />
                          高峰
                        </span>
                      )}
                      {data.total === 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-700/50 text-slate-500">
                          <TrendingDown className="w-3 h-3" />
                          空闲
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-white">
                      {data.total} <span className="text-slate-500 font-normal">单</span>
                    </span>
                  </div>
                  <div className="relative h-8 rounded-xl bg-slate-800/60 overflow-hidden">
                    <div className="absolute inset-y-0 left-0 flex">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-700 ease-out"
                        style={{ width: `${pendingWidth}%` }}
                      />
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out"
                        style={{ width: `${pickedWidth}%` }}
                      />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-between px-3">
                      <span className="text-xs font-medium text-white/80">
                        {data.pending > 0 && `待取 ${data.pending}`}
                      </span>
                      <span className="text-xs font-medium text-white/80">
                        {data.picked > 0 && `已取 ${data.picked}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 温度异常团品 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-lg font-semibold text-white">温度异常</h3>
              <p className="text-sm text-slate-400 mt-0.5">需要重点关注</p>
            </div>
            <Thermometer className="w-5 h-5 text-orange-400" />
          </div>

          {tempAbnormalProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <p className="text-sm text-slate-400">所有团品温度正常</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tempAbnormalProducts.map(({ product, inspection }) => (
                <div
                  key={product.id}
                  className="p-3 rounded-xl bg-orange-500/5 border border-orange-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white text-sm truncate">{product.name}</span>
                    <TempBadge temperature={inspection.temperature} isAbnormal={true} />
                  </div>
                  <p className="text-xs text-slate-400">
                    {product.boxNumber} · 要求 {product.tempZone === 'frozen' ? '-18°C以下' : '0-4°C'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 异常订单列表 */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">异常订单提醒</h3>
            <p className="text-sm text-slate-400 mt-0.5">需要优先处理的订单</p>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="inline-flex items-center gap-1 text-sm text-sky-400 hover:text-sky-300 transition-colors"
          >
            查看全部
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {abnormalOrders.length === 0 ? (
          <div className="text-center py-12">
            <Snowflake className="w-12 h-12 mx-auto mb-3 text-sky-400/50" />
            <p className="text-slate-400">暂无异常订单，一切正常</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/60">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">异常类型</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">居民</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">商品</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">取货时段</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">剩余时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {abnormalOrders.map((order) => {
                  const info = getAbnormalTypeInfo(order.abnormalType);
                  const Icon = info.icon;
                  const product = products.find((p) => p.id === order.productId);
                  const remaining = product ? timeRemaining(order.pickupSlot, product.arrivalTime, now) : '';
                  const isTimeout = order.status === 'timeout' || remaining === '已超时';

                  return (
                    <tr
                      key={`${order.id}-${order.abnormalType}`}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={classNames(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border',
                            info.color
                          )}
                        >
                          <Icon className="w-3 h-3" />
                          {info.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-700/50 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{order.customerName}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              ****{order.phoneLast4}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-white">{order.productName}</p>
                          <p className="text-xs text-slate-500">x{order.quantity}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-300">
                          {getPickupSlotLabel(order.pickupSlot)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={classNames(
                            'text-sm font-medium',
                            isTimeout ? 'text-red-400' : 'text-amber-400'
                          )}
                        >
                          {order.status === 'picked' ? '—' : remaining}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

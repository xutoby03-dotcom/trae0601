import { useMemo } from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  AlertTriangle,
  CheckCircle2,
  Clock,
  QrCode,
  Phone,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { DashboardCard } from '../components/DashboardCard';
import { PressureChart } from '../components/PressureChart';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const queueState = useAppStore((state) => state.queueState);
  const orders = useAppStore((state) => state.orders);
  const batches = useAppStore((state) => state.batches);
  const getDashboardStats = useAppStore((state) => state.getDashboardStats);

  const stats = useMemo(() => getDashboardStats(), [getDashboardStats, orders, queueState]);

  const abnormalOrders = orders.filter(
    (o) => o.callCount > 1 || o.paymentStatus === 'unpaid'
  );

  const activeBatches = batches.filter((b) => b.status !== 'completed');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-cyan-600" />
            数据看板
          </h1>
          <p className="text-slate-500 mt-1">实时监控取货进度和运营数据</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/queue"
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            排号叫号
          </Link>
          <Link
            to="/display"
            target="_blank"
            className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            打开叫号屏
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <DashboardCard
          title="当前叫号"
          value={stats.currentCalled?.toString().padStart(3, '0') || '--'}
          icon={QrCode}
          color="cyan"
        />
        <DashboardCard
          title="等待取货"
          value={stats.waitingCount}
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title="已完成取货"
          value={stats.pickedCount}
          icon={CheckCircle2}
          color="emerald"
        />
        <DashboardCard
          title="待取货总数"
          value={stats.notPickedCount}
          icon={Package}
          color="violet"
        />
        <DashboardCard
          title="异常订单"
          value={stats.abnormalCount}
          icon={AlertTriangle}
          color="red"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <PressureChart data={stats.hourlyPressure} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              异常订单
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {abnormalOrders.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
                  <p>暂无异常订单</p>
                </div>
              ) : (
                abnormalOrders.slice(0, 5).map((order) => {
                  const batch = batches.find((b) => b.id === order.batchId);
                  return (
                    <div
                      key={order.id}
                      className={cn(
                        'p-3 rounded-lg border',
                        order.callCount > 1
                          ? 'border-amber-200 bg-amber-50'
                          : 'border-red-200 bg-red-50'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900">
                            {order.customerName}
                          </p>
                          <p className="text-sm text-slate-500">
                            {batch?.productName} · {order.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          {order.callCount > 1 && (
                            <span className="text-xs text-amber-600 font-medium">
                              叫号 {order.callCount} 次
                            </span>
                          )}
                          {order.paymentStatus === 'unpaid' && (
                            <span className="text-xs text-red-600 font-medium">
                              未付款
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-600" />
              进行中的团购
            </h3>
            <div className="space-y-3">
              {activeBatches.length === 0 ? (
                <div className="text-center py-4 text-slate-400">
                  <p>暂无进行中的团购</p>
                </div>
              ) : (
                activeBatches.map((batch) => {
                  const batchOrders = orders.filter((o) => o.batchId === batch.id);
                  const picked = batchOrders.filter(
                    (o) => o.queueStatus === 'picked'
                  ).length;
                  const progress =
                    batchOrders.length > 0
                      ? Math.round((picked / batchOrders.length) * 100)
                      : 0;
                  return (
                    <div key={batch.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 text-sm">
                          {batch.productName}
                        </span>
                        <span className="text-sm text-slate-500">
                          {picked}/{batchOrders.length}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

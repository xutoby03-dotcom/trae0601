import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  AlertTriangle,
  Truck,
  Wallet,
  Clock,
  User,
  Plus,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { daysFromNow } from '@/utils/date';

export default function Dashboard() {
  const navigate = useNavigate();
  const items = useStore((s) => s.items);
  const purchases = useStore((s) => s.purchases);
  const requests = useStore((s) => s.requests);

  const dangerItems = items.filter((i) => i.currentStock < i.minStock);
  const pendingPurchases = purchases.filter((p) => p.status === 'ordered');
  const pendingRequests = requests.filter((r) => r.status === 'pending');

  const now = new Date();
  const thisMonthPurchases = purchases.filter(
    (p) =>
      new Date(p.createdAt).getMonth() === now.getMonth() &&
      new Date(p.createdAt).getFullYear() === now.getFullYear() &&
      p.status !== 'cancelled'
  );
  const totalSpent = thisMonthPurchases.reduce((sum, p) => sum + p.actualAmount, 0);

  const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  const sortedDangerItems = [...dangerItems].sort((a, b) => {
    const ra = pendingRequests.find((r) => r.itemId === a.id);
    const rb = pendingRequests.find((r) => r.itemId === b.id);
    const ua = ra ? urgencyOrder[ra.urgency] : 4;
    const ub = rb ? urgencyOrder[rb.urgency] : 4;
    return ua - ub;
  });

  const getNearestArrival = () => {
    if (pendingPurchases.length === 0) return undefined;
    const sorted = [...pendingPurchases].sort(
      (a, b) => new Date(a.expectedArrivalDate).getTime() - new Date(b.expectedArrivalDate).getTime()
    );
    const days = daysFromNow(sorted[0].expectedArrivalDate);
    if (days < 0) return `已有 ${Math.abs(days)} 件逾期`;
    if (days === 0) return '今日有望到货';
    return `最近 ${days} 天后到货`;
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-6 h-6" />}
          label="物品总数"
          value={items.length}
          color="brand"
          trend={dangerItems.length > 0 ? `${dangerItems.length} 项库存不足` : undefined}
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          label="红区预警"
          value={dangerItems.length}
          color="danger"
          highlight={dangerItems.length > 0}
          trend={pendingRequests.length > 0 ? `${pendingRequests.length} 个待处理申请` : undefined}
        />
        <StatCard
          icon={<Truck className="w-6 h-6" />}
          label="待到货"
          value={pendingPurchases.length}
          color="warn"
          trend={getNearestArrival()}
        />
        <StatCard
          icon={<Wallet className="w-6 h-6" />}
          label="本月采购"
          value={`¥${totalSpent.toLocaleString()}`}
          color="brand"
          trend={`${thisMonthPurchases.length} 笔订单`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-danger-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-danger-500" />
                </div>
                <h3 className="font-semibold text-slate-900">红区预警</h3>
                {dangerItems.length > 0 && (
                  <span className="badge bg-danger-50 text-danger-600">{dangerItems.length}</span>
                )}
              </div>
              <Link
                to="/requests/new"
                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                发起补货 <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {sortedDangerItems.length === 0 ? (
              <EmptyState
                icon={<Package className="w-8 h-8" />}
                title="库存状态良好"
                description="所有物品库存充足，无需补货"
              />
            ) : (
              <div className="space-y-3">
                {sortedDangerItems.map((item) => {
                  const relatedRequest = pendingRequests.find((r) => r.itemId === item.id);
                  return (
                    <Link
                      key={item.id}
                      to={`/items/${item.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border border-danger-100 bg-danger-50/50 hover:bg-danger-50 hover:border-danger-200 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-xl bg-white border border-danger-100 overflow-hidden flex-shrink-0">
                        {item.photoUrl ? (
                          <img
                            src={item.photoUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-display text-xl">
                            {item.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">{item.name}</h4>
                          {relatedRequest && (
                            <StatusBadge type="urgency" value={relatedRequest.urgency} />
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mb-2">{item.specification}</p>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-danger-600 font-medium">
                            库存 {item.currentStock} / 下限 {item.minStock}
                          </span>
                          <span className="text-slate-500">📍 {item.location}</span>
                        </div>
                      </div>
                      {relatedRequest ? (
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-slate-500">申请人</p>
                          <div className="flex items-center gap-1 text-sm text-slate-700">
                            <User className="w-3.5 h-3.5" />
                            {relatedRequest.applicantName}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate('/requests/new');
                          }}
                          className="btn-primary !py-1.5 !px-3 text-sm flex-shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          补货
                        </button>
                      )}
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-warn-50 flex items-center justify-center">
                <Truck className="w-4 h-4 text-warn-500" />
              </div>
              <h3 className="font-semibold text-slate-900">待到货</h3>
              {pendingPurchases.length > 0 && (
                <span className="badge bg-warn-50 text-warn-500">{pendingPurchases.length}</span>
              )}
            </div>
            {pendingPurchases.length === 0 ? (
              <EmptyState
                icon={<Truck className="w-8 h-8" />}
                title="暂无在途订单"
                description="所有采购订单均已完成"
              />
            ) : (
              <div className="space-y-3">
                {pendingPurchases.map((purchase) => {
                  const item = items.find((i) => i.id === purchase.itemId);
                  const daysLeft = daysFromNow(purchase.expectedArrivalDate);
                  const isOverdue = daysLeft < 0;
                  return (
                    <div
                      key={purchase.id}
                      className="p-3 rounded-xl border border-warn-100 bg-warn-50/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-slate-900">{item?.name || '未知物品'}</h4>
                        <span
                          className={`text-xs font-medium ${
                            isOverdue ? 'text-danger-600' : 'text-warn-600'
                          }`}
                        >
                          {isOverdue
                            ? `已逾期 ${Math.abs(daysLeft)} 天`
                            : daysLeft === 0
                            ? '今日到货'
                            : `${daysLeft} 天后到`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {purchase.expectedArrivalDate}
                        <span className="mx-1">·</span>
                        <span>x{purchase.quantity}</span>
                        <span className="mx-1">·</span>
                        <span>¥{purchase.actualAmount}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <Link
              to="/purchases"
              className="mt-4 flex items-center justify-center gap-1 text-sm text-brand-600 hover:text-brand-700 font-medium pt-3 border-t border-slate-100"
            >
              查看全部采购 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="card p-6 bg-gradient-to-br from-brand-500 to-brand-600 text-white border-0">
            <h3 className="font-semibold text-white mb-2">快捷操作</h3>
            <p className="text-brand-50/80 text-sm mb-4">快速发起补货或新增物品</p>
            <div className="space-y-2">
              <Link
                to="/requests/new"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="font-medium">提交补货申请</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/items/new"
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              >
                <span className="font-medium">新增物品档案</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-brand-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-brand-600" />
            </div>
            <h3 className="font-semibold text-slate-900">库存总览</h3>
          </div>
          <Link
            to="/items"
            className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
          >
            查看全部 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.slice(0, 8).map((item) => {
            const isDanger = item.currentStock < item.minStock;
            const stockPercent = Math.min(
              100,
              Math.round((item.currentStock / Math.max(item.minStock, 1)) * 50)
            );
            return (
              <Link
                key={item.id}
                to={`/items/${item.id}`}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                  {item.photoUrl ? (
                    <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-display text-lg">
                      {item.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 text-sm truncate">{item.name}</h4>
                  <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isDanger ? 'bg-danger-500' : stockPercent < 70 ? 'bg-warn-400' : 'bg-brand-500'
                      }`}
                      style={{ width: `${Math.max(4, stockPercent)}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`text-sm font-medium flex-shrink-0 ${
                    isDanger ? 'text-danger-600' : 'text-slate-600'
                  }`}
                >
                  {item.currentStock}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'brand' | 'danger' | 'warn';
  highlight?: boolean;
  trend?: string;
}

function StatCard({ icon, label, value, color, highlight, trend }: StatCardProps) {
  const colorClasses = {
    brand: 'from-brand-50 to-white text-brand-600',
    danger: 'from-danger-50 to-white text-danger-500',
    warn: 'from-warn-50 to-white text-warn-500',
  };

  return (
    <div
      className={`card p-5 bg-gradient-to-br ${colorClasses[color]} ${
        highlight ? 'ring-2 ring-danger-200 animate-pulse-slow' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center">{icon}</div>
      </div>
      <p className="text-sm text-slate-500 mb-1">{label}</p>
      <p className="title-display !text-2xl !mb-1">{value}</p>
      {trend && <p className="text-xs text-slate-500">{trend}</p>}
    </div>
  );
}

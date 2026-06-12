import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  MapPin,
  Building2,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { formatDateTime, formatDate } from '@/utils/date';

export default function ItemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const items = useStore((s) => s.items);
  const requests = useStore((s) => s.requests);
  const purchases = useStore((s) => s.purchases);
  const stockLogs = useStore((s) => s.stockLogs);
  const deleteItem = useStore((s) => s.deleteItem);

  const item = items.find((i) => i.id === id);
  if (!item) {
    return (
      <div className="animate-slide-up">
        <Link to="/items" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          返回物品列表
        </Link>
        <EmptyState title="物品不存在" description="该物品可能已被删除" />
      </div>
    );
  }

  const itemRequests = requests.filter((r) => r.itemId === item.id);
  const itemPurchases = purchases.filter((p) => p.itemId === item.id);
  const itemLogs = stockLogs.filter((l) => l.itemId === item.id);

  const isDanger = item.currentStock < item.minStock;
  const stockStatus = isDanger ? 'danger' : item.currentStock <= item.minStock * 1.5 ? 'warn' : 'normal';
  const stockPercent = Math.min(100, Math.round((item.currentStock / Math.max(item.minStock, 1)) * 50));

  const handleDelete = () => {
    if (confirm(`确定删除「${item.name}」吗？相关的申请和采购记录也会被删除。`)) {
      deleteItem(item.id);
      navigate('/items');
    }
  };

  const getLogTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return { label: '入库', className: 'text-brand-600 bg-brand-50' };
      case 'consume': return { label: '消耗', className: 'text-slate-600 bg-slate-100' };
      case 'adjust': return { label: '调整', className: 'text-warn-600 bg-warn-50' };
      default: return { label: type, className: 'text-slate-600 bg-slate-100' };
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <Link to="/items" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" />
          返回物品列表
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/requests/new`} className="btn-warn">
            <Plus className="w-4 h-4" />
            申请补货
          </Link>
          <Link to={`/items/${item.id}/edit`} className="btn-secondary">
            <Edit className="w-4 h-4" />
            编辑
          </Link>
          <button onClick={handleDelete} className="btn-danger">
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card overflow-hidden">
          <div className="h-48 bg-slate-100 relative">
            {item.photoUrl ? (
              <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-300 text-6xl font-display">
                {item.name.charAt(0)}
              </div>
            )}
            <div className="absolute top-4 left-4">
              <StatusBadge type="stock" value={stockStatus} />
            </div>
          </div>
          <div className="p-6">
            <h1 className="font-display text-2xl text-slate-900 mb-1">{item.name}</h1>
            <p className="text-sm text-slate-500 mb-4">{item.specification}</p>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-slate-500">库存状态</span>
                <span className={`font-semibold ${isDanger ? 'text-danger-600' : 'text-slate-900'}`}>
                  {item.currentStock} / 下限 {item.minStock}
                </span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isDanger ? 'bg-danger-500' : stockPercent < 70 ? 'bg-warn-400' : 'bg-brand-500'
                  }`}
                  style={{ width: `${Math.max(4, stockPercent)}%` }}
                />
              </div>
              {isDanger && (
                <p className="flex items-center gap-1 text-xs text-danger-600 mt-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  库存低于下限，请及时补货
                </p>
              )}
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="存放位置" value={item.location} />
              <InfoRow icon={<Building2 className="w-4 h-4" />} label="供应商" value={item.supplier} />
              <InfoRow icon={<DollarSign className="w-4 h-4" />} label="单价" value={`¥${item.unitPrice}`} />
              <InfoRow icon={<Package className="w-4 h-4" />} label="分类" value={item.category} />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              补货申请记录
            </h3>
            {itemRequests.length === 0 ? (
              <EmptyState title="暂无申请记录" description="还没有提交过补货申请" />
            ) : (
              <div className="space-y-3">
                {itemRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 text-sm">{req.applicantName}</p>
                          <StatusBadge type="urgency" value={req.urgency} />
                        </div>
                        <p className="text-xs text-slate-500">
                          剩余 {req.currentRemaining} · {formatDateTime(req.createdAt)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge type="request" value={req.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-500" />
              采购记录
            </h3>
            {itemPurchases.length === 0 ? (
              <EmptyState title="暂无采购记录" description="还没有采购过此物品" />
            ) : (
              <div className="space-y-3">
                {itemPurchases.map((pur) => (
                  <div key={pur.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-medium text-slate-900 text-sm">
                        采购 x{pur.quantity} · ¥{pur.actualAmount}
                      </p>
                      <p className="text-xs text-slate-500">
                        下单 {formatDate(pur.createdAt)} · 预计到货 {pur.expectedArrivalDate}
                      </p>
                    </div>
                    <StatusBadge type="purchase" value={pur.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" />
              库存变动日志
            </h3>
            {itemLogs.length === 0 ? (
              <EmptyState title="暂无变动记录" description="库存尚未发生变动" />
            ) : (
              <div className="space-y-2">
                {itemLogs.map((log) => {
                  const typeConfig = getLogTypeLabel(log.type);
                  return (
                    <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <span className={`badge ${typeConfig.className}`}>{typeConfig.label}</span>
                        <div>
                          <p className="text-sm text-slate-700">{log.remark}</p>
                          <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${log.changeAmount > 0 ? 'text-brand-600' : 'text-slate-600'}`}>
                          {log.changeAmount > 0 ? '+' : ''}{log.changeAmount}
                        </p>
                        <p className="text-xs text-slate-500">结存 {log.balanceAfter}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-900 font-medium">{value}</p>
      </div>
    </div>
  );
}

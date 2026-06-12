import { useState } from 'react';
import {
  ShoppingCart,
  Package,
  Truck,
  CheckCircle,
  Calendar,
  DollarSign,
  Upload,
  User,
  Clock,
  Filter,
  Eye,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import StatusBadge from '@/components/StatusBadge';
import EmptyState from '@/components/EmptyState';
import { formatDate, formatDateTime, daysFromNow } from '@/utils/date';

export default function PurchaseList() {
  const requests = useStore((s) => s.requests);
  const items = useStore((s) => s.items);
  const purchases = useStore((s) => s.purchases);
  const addPurchase = useStore((s) => s.addPurchase);
  const confirmPurchaseArrival = useStore((s) => s.confirmPurchaseArrival);

  const [tab, setTab] = useState<'pending' | 'ordered' | 'history'>('pending');
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [purchaseForm, setPurchaseForm] = useState({
    quantity: '',
    expectedArrivalDate: '',
    actualAmount: '',
  });

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  const sortedPending = [...pendingRequests].sort(
    (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  );

  const orderedPurchases = purchases.filter((p) => p.status === 'ordered');
  const arrivedPurchases = purchases.filter((p) => p.status !== 'ordered');

  const openPurchaseModal = (requestId: string) => {
    setSelectedRequest(requestId);
    const req = requests.find((r) => r.id === requestId);
    const item = req ? items.find((i) => i.id === req.itemId) : null;
    const suggestedQty = item ? Math.max(item.minStock * 2 - item.currentStock, item.minStock) : 10;
    const today = new Date();
    const defaultArrival = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    setPurchaseForm({
      quantity: suggestedQty.toString(),
      expectedArrivalDate: defaultArrival.toISOString().split('T')[0],
      actualAmount: item ? (suggestedQty * item.unitPrice).toString() : '',
    });
    setShowPurchaseModal(true);
  };

  const handleSubmitPurchase = () => {
    if (!selectedRequest) return;
    const req = requests.find((r) => r.id === selectedRequest);
    if (!req) return;

    addPurchase({
      requestId: req.id,
      itemId: req.itemId,
      quantity: parseFloat(purchaseForm.quantity) || 0,
      expectedArrivalDate: purchaseForm.expectedArrivalDate,
      actualAmount: parseFloat(purchaseForm.actualAmount) || 0,
      receiptPhotoUrl: '',
    });
    setShowPurchaseModal(false);
    setSelectedRequest(null);
    setTab('ordered');
  };

  const handleConfirmArrival = (purchaseId: string) => {
    if (confirm('确认物品已到货并入库？')) {
      confirmPurchaseArrival(purchaseId);
    }
  };

  const renderPending = () => (
    sortedPending.length === 0 ? (
      <EmptyState
        icon={<ShoppingCart className="w-8 h-8" />}
        title="暂无待处理申请"
        description="所有补货申请都已处理完毕"
      />
    ) : (
      <div className="space-y-3">
        {sortedPending.map((req) => {
          const item = items.find((i) => i.id === req.itemId);
          return (
            <div key={req.id} className="card p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {item?.photoUrl ? (
                    <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-display text-xl">
                      {item?.name.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{item?.name || '未知物品'}</h4>
                    <StatusBadge type="urgency" value={req.urgency} />
                  </div>
                  <p className="text-sm text-slate-500 mb-2">{item?.specification}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {req.applicantName}
                    </span>
                    <span>剩余 {req.currentRemaining}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(req.createdAt)}
                    </span>
                  </div>
                  {req.remark && (
                    <p className="text-xs text-slate-600 mt-2 p-2 bg-slate-50 rounded-lg">
                      💬 {req.remark}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => openPurchaseModal(req.id)}
                  className="btn-primary flex-shrink-0"
                >
                  <ShoppingCart className="w-4 h-4" />
                  下单采购
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )
  );

  const renderOrdered = () => (
    orderedPurchases.length === 0 ? (
      <EmptyState
        icon={<Truck className="w-8 h-8" />}
        title="暂无在途订单"
        description="所有采购订单均已到货"
      />
    ) : (
      <div className="space-y-3">
        {orderedPurchases.map((pur) => {
          const item = items.find((i) => i.id === pur.itemId);
          const daysLeft = daysFromNow(pur.expectedArrivalDate);
          const isOverdue = daysLeft < 0;
          return (
            <div key={pur.id} className="card p-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                  {item?.photoUrl ? (
                    <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-display text-xl">
                      {item?.name.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-slate-900">{item?.name || '未知物品'}</h4>
                    <StatusBadge type="purchase" value={pur.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Package className="w-3.5 h-3.5" />
                      采购 x{pur.quantity}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" />
                      ¥{pur.actualAmount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      预计 {pur.expectedArrivalDate}
                    </span>
                    <span
                      className={`font-medium ${
                        isOverdue ? 'text-danger-600' : daysLeft === 0 ? 'text-warn-600' : 'text-slate-500'
                      }`}
                    >
                      {isOverdue
                        ? `已逾期 ${Math.abs(daysLeft)} 天`
                        : daysLeft === 0
                        ? '今日到货'
                        : `${daysLeft} 天后到`}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleConfirmArrival(pur.id)} className="btn-primary flex-shrink-0">
                  <CheckCircle className="w-4 h-4" />
                  确认入库
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )
  );

  const renderHistory = () => (
    arrivedPurchases.length === 0 ? (
      <EmptyState
        icon={<CheckCircle className="w-8 h-8" />}
        title="暂无历史记录"
        description="还没有完成的采购订单"
      />
    ) : (
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">物品</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">数量</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">金额</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">下单时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">入库时间</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">状态</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {arrivedPurchases.map((pur) => {
                const item = items.find((i) => i.id === pur.itemId);
                return (
                  <tr key={pur.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-slate-900 text-sm">{item?.name || '未知'}</p>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-600">x{pur.quantity}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">¥{pur.actualAmount}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">{formatDate(pur.createdAt)}</td>
                    <td className="px-6 py-3 text-sm text-slate-600">
                      {pur.confirmedAt ? formatDate(pur.confirmedAt) : '-'}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge type="purchase" value={pur.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="card p-2 flex gap-1 inline-flex w-auto">
        {([
          { key: 'pending', label: '待处理', count: sortedPending.length, icon: Clock },
          { key: 'ordered', label: '待到货', count: orderedPurchases.length, icon: Truck },
          { key: 'history', label: '已完成', count: arrivedPurchases.length, icon: CheckCircle },
        ] as const).map(({ key, label, count, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              tab === key ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                tab === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {tab === 'pending' && renderPending()}
      {tab === 'ordered' && renderOrdered()}
      {tab === 'history' && renderHistory()}

      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-hover w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="font-display text-xl text-slate-900">采购下单</h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">采购数量</label>
                <input
                  type="number"
                  min="1"
                  value={purchaseForm.quantity}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">预计到货日期</label>
                <input
                  type="date"
                  value={purchaseForm.expectedArrivalDate}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, expectedArrivalDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">实付金额 (元)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={purchaseForm.actualAmount}
                  onChange={(e) => setPurchaseForm({ ...purchaseForm, actualAmount: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex gap-3 p-5 border-t border-slate-100">
              <button onClick={handleSubmitPurchase} className="btn-primary flex-1">
                <ShoppingCart className="w-4 h-4" />
                确认下单
              </button>
              <button onClick={() => setShowPurchaseModal(false)} className="btn-secondary flex-1">
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

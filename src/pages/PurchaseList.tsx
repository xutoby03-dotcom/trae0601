import { useState, useMemo } from 'react';
import { Plus, Check, Truck, Package, Trash2, RefreshCw, ShoppingCart, Filter, DollarSign, ListTodo } from 'lucide-react';
import { usePurchaseStore } from '../store/usePurchaseStore';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { useSupplyStore } from '../store/useSupplyStore';
import { Modal } from '../components/ui/Modal';
import { StatusBadge, PurchaseStatusBadge } from '../components/ui/StatusBadge';
import { useToast } from '../components/ui/Toast';
import type { PurchaseItem, PurchaseStatus, PurchaseType } from '../types';
import { formatDate, formatDateTime, generateId } from '../utils/date';

const statusLabels: Record<PurchaseStatus, string> = {
  pending: '待采购',
  ordered: '已下单',
  received: '已入库',
  cancelled: '已取消',
};

const typeLabels: Record<PurchaseType, string> = {
  coffee: '咖啡胶囊',
  supply: '配套物品',
};

interface ManualAddForm {
  type: PurchaseType;
  itemId: string;
  quantity: number;
  unitPrice: number;
  supplier?: string;
  remark?: string;
}

const defaultForm: ManualAddForm = {
  type: 'coffee',
  itemId: '',
  quantity: 20,
  unitPrice: 0,
  supplier: '',
  remark: '',
};

export function PurchaseList() {
  const [activeTab, setActiveTab] = useState<'all' | PurchaseStatus>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<ManualAddForm>(defaultForm);
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [receiveExpiryDate, setReceiveExpiryDate] = useState('');

  const purchaseItems = usePurchaseStore((state) => state.purchaseItems);
  const autoGeneratePurchaseList = usePurchaseStore((state) => state.autoGeneratePurchaseList);
  const addPurchaseItem = usePurchaseStore((state) => state.addPurchaseItem);
  const updatePurchaseStatus = usePurchaseStore((state) => state.updatePurchaseStatus);
  const markAsReceived = usePurchaseStore((state) => state.markAsReceived);
  const deletePurchaseItem = usePurchaseStore((state) => state.deletePurchaseItem);

  const coffeeFlavors = useCoffeeStore((state) => state.flavors);
  const addInventoryBatch = useCoffeeStore((state) => state.addInventoryBatch);
  const supplies = useSupplyStore((state) => state.supplies);
  const restockSupply = useSupplyStore((state) => state.restockSupply);

  const { showToast } = useToast();

  const filteredItems = useMemo(() => {
    let items = [...purchaseItems];
    if (activeTab !== 'all') {
      items = items.filter((item) => item.status === activeTab);
    }
    return items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [purchaseItems, activeTab]);

  const summary = useMemo(() => {
    const pending = purchaseItems.filter((i) => i.status === 'pending');
    const ordered = purchaseItems.filter((i) => i.status === 'ordered');
    const totalPendingAmount = pending.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0
    );
    const totalOrderedAmount = ordered.reduce(
      (sum, i) => sum + i.quantity * i.unitPrice,
      0
    );
    return {
      pendingCount: pending.length,
      orderedCount: ordered.length,
      totalPendingAmount,
      totalOrderedAmount,
    };
  }, [purchaseItems]);

  const handleAutoGenerate = () => {
    const result = autoGeneratePurchaseList();
    if (result.addedCount > 0) {
      showToast('success', `已自动添加 ${result.addedCount} 项采购需求`);
    } else {
      showToast('info', result.message);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId) {
      showToast('error', '请选择物品');
      return;
    }

    const item =
      formData.type === 'coffee'
        ? coffeeFlavors.find((f) => f.id === formData.itemId)
        : supplies.find((s) => s.id === formData.itemId);

    if (!item) return;

    addPurchaseItem({
      type: formData.type,
      itemId: formData.itemId,
      itemName: item.name,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice || (formData.type === 'coffee' ? (item as any).unitPrice : (item as any).unitPrice),
      supplier: formData.supplier || undefined,
      remark: formData.remark || undefined,
    });

    showToast('success', '已添加到采购清单');
    setIsAddModalOpen(false);
    setFormData(defaultForm);
  };

  const handleStatusChange = (item: PurchaseItem, newStatus: PurchaseStatus) => {
    if (newStatus === 'received') {
      setSelectedPurchase(item);
      if (item.type === 'coffee') {
        const defaultExpiry = new Date();
        defaultExpiry.setMonth(defaultExpiry.getMonth() + 6);
        setReceiveExpiryDate(defaultExpiry.toISOString().split('T')[0]);
      } else {
        setReceiveExpiryDate('');
      }
      setIsReceiveModalOpen(true);
      return;
    }

    updatePurchaseStatus(item.id, newStatus);
    showToast('success', `已更新为「${statusLabels[newStatus]}」`);
  };

  const handleReceiveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchase) return;

    if (selectedPurchase.type === 'coffee' && !receiveExpiryDate) {
      showToast('error', '咖啡胶囊请填写过期日期');
      return;
    }

    if (selectedPurchase.type === 'coffee') {
      addInventoryBatch({
        id: generateId(),
        flavorId: selectedPurchase.itemId,
        quantity: selectedPurchase.quantity,
        expiryDate: receiveExpiryDate,
        status: 'normal',
        createdAt: new Date().toISOString(),
      });
    } else {
      restockSupply(selectedPurchase.itemId, selectedPurchase.quantity, receiveExpiryDate || undefined);
    }

    markAsReceived(selectedPurchase.id);
    showToast('success', `已入库 ${selectedPurchase.itemName} x ${selectedPurchase.quantity}`);
    setIsReceiveModalOpen(false);
    setSelectedPurchase(null);
    setReceiveExpiryDate('');
  };

  const handleDelete = (item: PurchaseItem) => {
    if (confirm(`确定要删除 ${item.itemName} 的采购项吗？`)) {
      deletePurchaseItem(item.id);
      showToast('success', '已删除');
    }
  };

  const tabs = [
    { key: 'all', label: '全部', count: purchaseItems.length },
    { key: 'pending', label: '待采购', count: summary.pendingCount },
    { key: 'ordered', label: '已下单', count: summary.orderedCount },
    { key: 'received', label: '已入库', count: purchaseItems.filter((i) => i.status === 'received').length },
  ];

  const availableItems = formData.type === 'coffee' ? coffeeFlavors : supplies;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-coffee-900 mb-2">采购清单</h1>
          <p className="text-coffee-500">管理咖啡胶囊和配套物品的采购需求</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleAutoGenerate} className="btn-secondary">
            <RefreshCw className="w-5 h-5" />
            自动生成
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn-accent">
            <Plus className="w-5 h-5" />
            手动添加
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-orange-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="w-5 h-5 text-accent-orange" />
            <p className="text-sm text-coffee-500">待采购</p>
          </div>
          <p className="font-display text-3xl font-bold text-coffee-900">{summary.pendingCount}</p>
          <p className="text-xs text-coffee-400">¥{summary.totalPendingAmount.toFixed(0)} 待付款</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="w-5 h-5 text-blue-500" />
            <p className="text-sm text-coffee-500">运输中</p>
          </div>
          <p className="font-display text-3xl font-bold text-coffee-900">{summary.orderedCount}</p>
          <p className="text-xs text-coffee-400">¥{summary.totalOrderedAmount.toFixed(0)} 在途</p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center gap-3 mb-2">
            <Check className="w-5 h-5 text-accent-green" />
            <p className="text-sm text-coffee-500">本月已入库</p>
          </div>
          <p className="font-display text-3xl font-bold text-coffee-900">
            {
              purchaseItems.filter((i) => {
                const received = i.receivedAt;
                if (!received) return false;
                const now = new Date();
                const r = new Date(received);
                return r.getMonth() === now.getMonth() && r.getFullYear() === now.getFullYear();
              }).length
            }
          </p>
          <p className="text-xs text-coffee-400">
            ¥
            {purchaseItems
              .filter((i) => {
                const received = i.receivedAt;
                if (!received) return false;
                const now = new Date();
                const r = new Date(received);
                return r.getMonth() === now.getMonth() && r.getFullYear() === now.getFullYear();
              })
              .reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)
              .toFixed(0)}{' '}
            本月支出
          </p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-cream-100 to-white">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-coffee-600" />
            <p className="text-sm text-coffee-500">总采购项</p>
          </div>
          <p className="font-display text-3xl font-bold text-coffee-900">{purchaseItems.length}</p>
          <p className="text-xs text-coffee-400">
            ¥{purchaseItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(0)} 累计
          </p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-coffee-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === tab.key
                ? 'border-coffee-800 text-coffee-800'
                : 'border-transparent text-coffee-500 hover:text-coffee-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  tab.key === 'pending'
                    ? 'bg-orange-100 text-accent-orange'
                    : tab.key === 'ordered'
                    ? 'bg-blue-100 text-blue-600'
                    : tab.key === 'received'
                    ? 'bg-green-100 text-accent-green'
                    : 'bg-coffee-100 text-coffee-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item, index) => {
            const itemDetail =
              item.type === 'coffee'
                ? coffeeFlavors.find((f) => f.id === item.itemId)
                : supplies.find((s) => s.id === item.itemId);
            return (
              <div
                key={item.id}
                className="card p-5 hover:shadow-md transition-all animate-fade-in-up"
                style={{ animationDelay: `${index * 0.03}s`, opacity: 0 }}
              >
                <div className="flex items-center gap-5">
                  {item.type === 'coffee' && itemDetail ? (
                    <img
                      src={(itemDetail as any).boxPhoto}
                      alt={item.itemName}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-cream-100 rounded-xl flex items-center justify-center">
                      <Package className="w-8 h-8 text-coffee-500" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-coffee-900 truncate">{item.itemName}</h3>
                      <span className="badge bg-cream-100 text-coffee-600 text-xs">
                        {typeLabels[item.type]}
                      </span>
                      <PurchaseStatusBadge status={item.status as 'pending' | 'ordered' | 'received'} />
                    </div>
                    <p className="text-sm text-coffee-500">
                      采购数量: <span className="font-medium text-coffee-700">{item.quantity}</span>
                      <span className="mx-2">·</span>
                      单价: <span className="font-medium text-coffee-700">¥{item.unitPrice.toFixed(2)}</span>
                      <span className="mx-2">·</span>
                      小计: <span className="font-bold text-accent-orange">¥{(item.quantity * item.unitPrice).toFixed(2)}</span>
                    </p>
                    {item.supplier && (
                      <p className="text-xs text-coffee-400 mt-1">供应商: {item.supplier}</p>
                    )}
                    {item.remark && (
                      <p className="text-xs text-coffee-400">备注: {item.remark}</p>
                    )}
                    <p className="text-xs text-coffee-400 mt-1">
                      创建于 {formatDateTime(item.createdAt)}
                      {item.receivedAt && ` · 入库于 ${formatDateTime(item.receivedAt)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(item, 'ordered')}
                          className="btn-secondary text-sm"
                        >
                          <Truck className="w-4 h-4" />
                          标记已下单
                        </button>
                        <button
                          onClick={() => handleStatusChange(item, 'cancelled')}
                          className="btn-ghost text-sm text-accent-red hover:bg-red-50"
                        >
                          取消
                        </button>
                      </>
                    )}
                    {item.status === 'ordered' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(item, 'received')}
                          className="btn-success text-sm"
                        >
                          <Check className="w-4 h-4" />
                          确认入库
                        </button>
                        <button
                          onClick={() => handleStatusChange(item, 'pending')}
                          className="btn-ghost text-sm"
                        >
                          撤回
                        </button>
                      </>
                    )}
                    {item.status !== 'received' && item.status !== 'cancelled' && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="btn-ghost p-2 text-accent-red hover:bg-red-50"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card p-16 text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-coffee-300" />
            <p className="text-coffee-500 mb-2">暂无采购项</p>
            <p className="text-sm text-coffee-400 mb-6">点击「自动生成」检查低库存物品，或手动添加采购需求</p>
            <div className="flex gap-3 justify-center">
              <button onClick={handleAutoGenerate} className="btn-secondary">
                <RefreshCw className="w-5 h-5" />
                自动生成
              </button>
              <button onClick={() => setIsAddModalOpen(true)} className="btn-accent">
                <Plus className="w-5 h-5" />
                手动添加
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setFormData(defaultForm);
        }}
        title="手动添加采购项"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">类型</label>
              <select
                value={formData.type}
                onChange={(e) => {
                  setFormData({ ...formData, type: e.target.value as PurchaseType, itemId: '' });
                }}
                className="select"
              >
                <option value="coffee">咖啡胶囊</option>
                <option value="supply">配套物品</option>
              </select>
            </div>
            <div>
              <label className="label">物品</label>
              <select
                value={formData.itemId}
                onChange={(e) => {
                  setFormData({ ...formData, itemId: e.target.value });
                  const selected = availableItems.find((i) => i.id === e.target.value);
                  if (selected) {
                    setFormData((prev) => ({ ...prev, unitPrice: (selected as any).unitPrice || 0 }));
                  }
                }}
                className="select"
                required
              >
                <option value="">请选择{formData.type === 'coffee' ? '咖啡口味' : '物品'}</option>
                {availableItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">采购数量</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">单价 (元)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">供应商 (可选)</label>
            <input
              type="text"
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="input"
              placeholder="如：雀巢官方旗舰店"
            />
          </div>

          <div>
            <label className="label">备注 (可选)</label>
            <textarea
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="input min-h-[80px]"
              placeholder="如：加急采购"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setFormData(defaultForm);
              }}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              添加
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isReceiveModalOpen}
        onClose={() => {
          setIsReceiveModalOpen(false);
          setSelectedPurchase(null);
          setReceiveExpiryDate('');
        }}
        title="确认入库"
        size="sm"
      >
        {selectedPurchase && (
          <form onSubmit={handleReceiveSubmit} className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl">
              {selectedPurchase.type === 'coffee' ? (
                <img
                  src={(coffeeFlavors.find((f) => f.id === selectedPurchase.itemId) as any)?.boxPhoto}
                  alt={selectedPurchase.itemName}
                  className="w-14 h-14 object-cover rounded-lg"
                />
              ) : (
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
                  <Package className="w-7 h-7 text-coffee-600" />
                </div>
              )}
              <div>
                <p className="font-bold text-coffee-900">{selectedPurchase.itemName}</p>
                <p className="text-sm text-coffee-500">
                  入库数量: <span className="font-medium">{selectedPurchase.quantity}</span>
                </p>
              </div>
            </div>

            {selectedPurchase.type === 'coffee' && (
              <div>
                <label className="label">过期日期</label>
                <input
                  type="date"
                  value={receiveExpiryDate}
                  onChange={(e) => setReceiveExpiryDate(e.target.value)}
                  className="input"
                  required
                />
                <p className="text-xs text-coffee-400 mt-1">咖啡胶囊一般保质期为6-12个月</p>
              </div>
            )}

            {selectedPurchase.type === 'supply' && (
              <div>
                <label className="label">过期日期 (可选)</label>
                <input
                  type="date"
                  value={receiveExpiryDate}
                  onChange={(e) => setReceiveExpiryDate(e.target.value)}
                  className="input"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setIsReceiveModalOpen(false);
                  setSelectedPurchase(null);
                  setReceiveExpiryDate('');
                }}
                className="btn-secondary flex-1"
              >
                取消
              </button>
              <button type="submit" className="btn-success flex-1">
                确认入库
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

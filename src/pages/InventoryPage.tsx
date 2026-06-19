import { useEffect, useState } from 'react';
import {
  Package,
  PackagePlus,
  PackageMinus,
  AlertTriangle,
  TrendingDown,
  ArrowDownCircle,
  ArrowUpCircle,
  History,
  ListTodo,
  X,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle2,
  Inbox,
  FileText,
  Tag,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { StockStatusBadge } from '@/components/StatusBadge';
import { api } from '@/lib/api';
import { InventoryItem, StockLog } from '@shared/types';
import { formatDateTime, getStockProgressColor, getStockTextColor, formatDate } from '@/lib/format';

const NURSES = ['李护士', '王护士', '张护士', '刘护士', '管理员'];

interface StockModalProps {
  type: 'in' | 'out';
  item: InventoryItem | null;
  onClose: () => void;
  onSubmit: (itemId: string, quantity: number, operator: string) => Promise<void>;
}

function StockModal({ type, item, onClose, onSubmit }: StockModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [operator, setOperator] = useState('');
  const [loading, setLoading] = useState(false);

  if (!item) return null;

  const handleSubmit = async () => {
    if (quantity <= 0) {
      alert('请输入有效的数量');
      return;
    }
    if (!operator) {
      alert('请选择操作人');
      return;
    }
    if (type === 'out' && quantity > item.currentStock) {
      alert(`库存不足！当前库存：${item.currentStock}${item.unit}`);
      return;
    }
    setLoading(true);
    try {
      await onSubmit(item.id, quantity, operator);
      onClose();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${
                type === 'in' ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {type === 'in' ? (
                  <ArrowDownCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <ArrowUpCircle className="w-6 h-6 text-orange-600" />
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {type === 'in' ? '入库登记' : '出库登记'}
                </h3>
                <p className="text-sm text-slate-500">{item.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="btn-ghost !p-2">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">当前库存</span>
              <span className="text-lg font-bold text-slate-900">
                {item.currentStock} {item.unit}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">安全库存</span>
              <span className="text-sm text-slate-700">{item.safetyStock} {item.unit}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">{type === 'in' ? '入库' : '出库'}数量 <span className="text-red-500">*</span></label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold text-lg"
                >
                  -
                </button>
                <input
                  type="number"
                  className="input text-center !py-2 flex-1"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-slate-300 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold text-lg"
                >
                  +
                </button>
                <span className="text-sm text-slate-500 w-8">{item.unit}</span>
              </div>
            </div>

            <div>
              <label className="label"><UserCheck className="w-3.5 h-3.5 inline mr-1" />操作人 <span className="text-red-500">*</span></label>
              <select
                className="select"
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
              >
                <option value="">请选择操作人</option>
                {NURSES.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-5 border-t border-slate-100">
            <button onClick={onClose} className="btn-secondary flex-1">
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 ${type === 'in' ? 'btn-success' : 'btn-danger'}`}
            >
              {loading ? '提交中...' : `确认${type === 'in' ? '入库' : '出库'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryPage() {
  const { inventory, fetchInventory } = useAppStore();
  const [activeTab, setActiveTab] = useState<'items' | 'logs'>('items');
  const [loading, setLoading] = useState(false);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);
  const [modalType, setModalType] = useState<'in' | 'out' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchInventory();
      const logs = await api.getStockLogs();
      setStockLogs(logs);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: 'in' | 'out', item: InventoryItem) => {
    setModalType(type);
    setSelectedItem(item);
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
  };

  const handleStockIn = async (itemId: string, quantity: number, operator: string) => {
    await api.stockIn(itemId, { quantity, operator });
    await loadData();
  };

  const handleStockOut = async (itemId: string, quantity: number, operator: string) => {
    await api.stockOut(itemId, { quantity, operator });
    await loadData();
  };

  const overview = {
    total: inventory.length,
    warning: inventory.filter((i) => i.currentStock <= i.safetyStock && i.currentStock > 0).length,
    shortage: inventory.filter((i) => i.currentStock <= i.safetyStock * 0.3 || i.currentStock === 0).length,
  };

  const getLogItemName = (itemId: string) => {
    const item = inventory.find((i) => i.id === itemId);
    return item?.name || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">库存管理</h1>
            <p className="text-sm text-slate-500">管理配件、耗材的出入库</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: '库存品种总数', value: overview.total, icon: Package, bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
          { label: '库存预警', value: overview.warning, icon: AlertTriangle, bg: 'bg-orange-50', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
          { label: '库存不足', value: overview.shortage, icon: TrendingDown, bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`card !p-5 ${item.bg} border-0`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{item.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{item.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${item.iconBg}`}>
                  <Icon className={`w-7 h-7 ${item.iconColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="card !p-0">
        <div className="flex border-b border-slate-200 px-6">
          <button
            onClick={() => setActiveTab('items')}
            className={activeTab === 'items' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <ListTodo className="w-4 h-4 inline mr-1.5" />
            配件列表
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={activeTab === 'logs' ? 'tab-btn-active' : 'tab-btn-inactive'}
          >
            <History className="w-4 h-4 inline mr-1.5" />
            出入库流水
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'items' && (
            loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full mr-3" />
                <span className="text-slate-400">加载中...</span>
              </div>
            ) : inventory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">配件名称</th>
                      <th className="table-th">规格</th>
                      <th className="table-th">分类</th>
                      <th className="table-th">库存状态</th>
                      <th className="table-th">最后入库</th>
                      <th className="table-th text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item) => {
                      const percent = Math.min(100, (item.currentStock / item.safetyStock) * 100);
                      return (
                        <tr key={item.id} className="table-row-hover">
                          <td className="table-td">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-slate-100">
                                <Tag className="w-4 h-4 text-slate-500" />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{item.name}</p>
                                <p className="text-xs text-slate-500">单位: {item.unit}</p>
                              </div>
                            </div>
                          </td>
                          <td className="table-td text-slate-600">{item.spec}</td>
                          <td className="table-td">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                              {item.category}
                            </span>
                          </td>
                          <td className="table-td min-w-[200px]">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <StockStatusBadge item={item} />
                                <span className={`text-xs font-semibold ${getStockTextColor(percent)}`}>
                                  {item.currentStock} / {item.safetyStock} {item.unit}
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${getStockProgressColor(percent)}`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="table-td">
                            {item.lastStockInDate ? (
                              <span className="text-sm text-slate-600 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                {formatDate(item.lastStockInDate)}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="table-td">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openModal('in', item)}
                                className="btn-ghost !px-3 text-green-600 hover:bg-green-50"
                              >
                                <PackagePlus className="w-4 h-4 mr-1" />
                                入库
                              </button>
                              <button
                                onClick={() => openModal('out', item)}
                                className="btn-ghost !px-3 text-orange-600 hover:bg-orange-50"
                              >
                                <PackageMinus className="w-4 h-4 mr-1" />
                                出库
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Inbox className="w-16 h-16 mb-4 text-slate-300" />
                <p className="font-medium text-lg">暂无库存数据</p>
              </div>
            )
          )}

          {activeTab === 'logs' && (
            stockLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">时间</th>
                      <th className="table-th">类型</th>
                      <th className="table-th">配件名称</th>
                      <th className="table-th">数量</th>
                      <th className="table-th">操作人</th>
                      <th className="table-th">关联单号</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockLogs.map((log) => (
                      <tr key={log.id} className="table-row-hover">
                        <td className="table-td">
                          <span className="inline-flex items-center gap-1.5 text-slate-600 text-sm">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {formatDateTime(log.createdAt)}
                          </span>
                        </td>
                        <td className="table-td">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            log.type === 'in'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {log.type === 'in' ? (
                              <ArrowDownCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowUpCircle className="w-3 h-3 mr-1" />
                            )}
                            {log.type === 'in' ? '入库' : '出库'}
                          </span>
                        </td>
                        <td className="table-td font-medium text-slate-800">
                          {getLogItemName(log.itemId)}
                        </td>
                        <td className="table-td">
                          <span className={`font-bold ${
                            log.type === 'in' ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {log.type === 'in' ? '+' : '-'}{log.quantity}
                          </span>
                        </td>
                        <td className="table-td">
                          <span className="inline-flex items-center gap-1 text-slate-600 text-sm">
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            {log.operator}
                          </span>
                        </td>
                        <td className="table-td">
                          {log.relatedId ? (
                            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              {log.relatedId}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <FileText className="w-16 h-16 mb-4 text-slate-300" />
                <p className="font-medium text-lg">暂无出入库记录</p>
              </div>
            )
          )}
        </div>
      </div>

      {modalType && selectedItem && (
        <StockModal
          type={modalType}
          item={selectedItem}
          onClose={closeModal}
          onSubmit={modalType === 'in' ? handleStockIn : handleStockOut}
        />
      )}
    </div>
  );
}

export default InventoryPage;

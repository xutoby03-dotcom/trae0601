import { useState, useMemo, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, ClipboardList, User, Phone, Hash, Clock, ShoppingBag, Megaphone, CheckCircle2, X } from 'lucide-react';
import { useAppStore } from '@/store';
import type { Order, PickupSlot } from '@/types';
import { PICKUP_SLOT_LABELS } from '@/types';
import { OrderStatusBadge } from '@/components/Badges';
import Modal from '@/components/Modal';
import {
  classNames,
  formatDateTime,
  getPickupSlotLabel,
  timeRemaining,
  buildPickupReminderMessage,
  copyToClipboard,
} from '@/utils/helpers';

type ReminderNotice =
  | { type: 'none' }
  | { type: 'success'; customerName: string; content: string }
  | { type: 'error'; message: string; content: string };

const emptyForm: Omit<Order, 'id' | 'createdAt' | 'status'> = {
  productId: '',
  customerName: '',
  phoneLast4: '',
  quantity: 1,
  pickupSlot: 'afternoon',
  hasIceBag: false,
};

export default function Orders() {
  const { products, orders, addOrder, updateOrder, deleteOrder } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProduct, setFilterProduct] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [reminderNotice, setReminderNotice] = useState<ReminderNotice>({ type: 'none' });

  const dismissReminder = useCallback(() => setReminderNotice({ type: 'none' }), []);

  const handleSendReminder = useCallback(
    async (order: Order) => {
      if (order.status === 'picked') return;
      const product = products.find((p) => p.id === order.productId);
      if (!product) return;

      const content = buildPickupReminderMessage({
        customerName: order.customerName,
        phoneLast4: order.phoneLast4,
        productName: product.name,
        quantity: order.quantity,
        pickupSlot: order.pickupSlot,
        arrivalTime: product.arrivalTime,
      });

      const result = await copyToClipboard(content);
      if (result.ok) {
        setReminderNotice({
          type: 'success',
          customerName: order.customerName,
          content,
        });
      } else {
        setReminderNotice({
          type: 'error',
          message: result.error || '复制到剪贴板失败，请手动复制',
          content,
        });
      }
    },
    [products]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        !searchQuery ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phoneLast4.includes(searchQuery);
      const matchProduct = !filterProduct || o.productId === filterProduct;
      const matchStatus = !filterStatus || o.status === filterStatus;
      return matchSearch && matchProduct && matchStatus;
    });
  }, [orders, searchQuery, filterProduct, filterStatus]);

  const groupedOrders = useMemo(() => {
    const grouped: Record<string, Order[]> = {};
    filteredOrders.forEach((order) => {
      if (!grouped[order.productId]) {
        grouped[order.productId] = [];
      }
      grouped[order.productId].push(order);
    });
    return grouped;
  }, [filteredOrders]);

  const openAddModal = () => {
    setEditingOrder(null);
    setFormData({ ...emptyForm, productId: products[0]?.id || '' });
    setModalOpen(true);
  };

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setFormData({
      productId: order.productId,
      customerName: order.customerName,
      phoneLast4: order.phoneLast4,
      quantity: order.quantity,
      pickupSlot: order.pickupSlot,
      hasIceBag: order.hasIceBag,
    });
    setModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.customerName.trim() || !formData.phoneLast4 || !formData.productId) return;

    if (editingOrder) {
      updateOrder(editingOrder.id, formData);
    } else {
      addOrder(formData);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这个订单吗？')) {
      deleteOrder(id);
    }
  };

  const getProduct = (productId: string) => products.find((p) => p.id === productId);

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">居民订单</h1>
          <p className="text-sm text-slate-400 mt-1">管理所有居民取货订单</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-5 h-5" />
          新增订单
        </button>
      </div>

      {/* 催取通知条 */}
      {reminderNotice.type !== 'none' && (
        <div
          className={classNames(
            'flex items-center gap-4 p-4 rounded-2xl border',
            reminderNotice.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-red-500/10 border-red-500/30'
          )}
        >
          <div
            className={classNames(
              'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
              reminderNotice.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'
            )}
          >
            {reminderNotice.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Megaphone className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className={classNames(
                'font-medium',
                reminderNotice.type === 'success' ? 'text-emerald-300' : 'text-red-300'
              )}
            >
              {reminderNotice.type === 'success'
                ? `${reminderNotice.customerName} 催取文案已复制，可直接粘贴到群里`
                : `复制失败：${reminderNotice.message}`}
            </p>
            <details className="mt-2">
              <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                查看催取文案
              </summary>
              <pre className="mt-2 p-3 rounded-xl bg-slate-900/70 border border-slate-700/60 text-xs text-slate-300 whitespace-pre-wrap font-mono overflow-auto max-h-48">
                {reminderNotice.content}
              </pre>
            </details>
          </div>
          <button
            onClick={dismissReminder}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/50 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="搜索姓名或手机号后四位..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
          />
        </div>
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all min-w-[180px]"
        >
          <option value="">全部团品</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all min-w-[150px]"
        >
          <option value="">全部状态</option>
          <option value="pending">待取货</option>
          <option value="picked">已取货</option>
          <option value="timeout">已超时</option>
        </select>
      </div>

      {/* 订单列表 */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>暂无订单数据</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedOrders).map(([productId, productOrders]) => {
            const product = getProduct(productId);
            if (!product) return null;
            return (
              <div
                key={productId}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm overflow-hidden"
              >
                {/* 团品标题栏 */}
                <div className="px-5 py-4 bg-slate-800/40 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{product.name}</h3>
                      <p className="text-xs text-slate-400">
                        {product.spec} · {product.boxNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      共 <span className="text-white font-medium">{productOrders.length}</span> 单
                    </span>
                    <span className="text-slate-400">
                      待取 <span className="text-amber-400 font-medium">
                        {productOrders.filter((o) => o.status === 'pending').length}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 订单表格 */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-800/60">
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">居民</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">手机</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">数量</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">取货时段</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">冰袋</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">剩余时间</th>
                        <th className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                        <th className="text-right px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {productOrders.map((order) => {
                        const remaining = timeRemaining(order.pickupSlot, product.arrivalTime);
                        const isTimeout = order.status === 'timeout' || remaining === '已超时';
                        const showReminder =
                          order.status === 'timeout' ||
                          (order.status === 'pending' && remaining === '已超时');
                        return (
                          <tr
                            key={order.id}
                            className={classNames(
                              'hover:bg-slate-800/30 transition-colors',
                              isTimeout && order.status !== 'picked' && 'bg-red-500/5'
                            )}
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" />
                                <span className="font-medium text-white">{order.customerName}</span>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Phone className="w-4 h-4 text-slate-500" />
                                ****{order.phoneLast4}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Hash className="w-4 h-4 text-slate-500" />
                                x{order.quantity}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2 text-slate-300">
                                <Clock className="w-4 h-4 text-slate-500" />
                                {getPickupSlotLabel(order.pickupSlot)}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={classNames(
                                  'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
                                  order.hasIceBag
                                    ? 'bg-sky-500/15 text-sky-400'
                                    : 'bg-slate-700/50 text-slate-400'
                                )}
                              >
                                {order.hasIceBag ? '自带' : '未带'}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={classNames(
                                  'text-sm font-medium',
                                  isTimeout ? 'text-red-400' : 'text-slate-300'
                                )}
                              >
                                {order.status === 'picked' ? '—' : remaining}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <OrderStatusBadge status={order.status} />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {showReminder && (
                                  <button
                                    onClick={() => handleSendReminder(order)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                                    title="生成催取消息并复制到剪贴板"
                                  >
                                    <Megaphone className="w-3.5 h-3.5" />
                                    催取
                                  </button>
                                )}
                                <button
                                  onClick={() => openEditModal(order)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
                                  title="编辑订单"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(order.id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                  title="删除订单"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 新增/编辑弹窗 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingOrder ? '编辑订单' : '新增订单'}
        size="md"
        footer={
          <>
            <button
              onClick={() => setModalOpen(false)}
              className="px-5 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-medium shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
            >
              {editingOrder ? '保存修改' : '确认添加'}
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">团品 *</label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} - {p.spec}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">居民姓名 *</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="例如：张阿姨"
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">手机号后四位 *</label>
              <input
                type="text"
                value={formData.phoneLast4}
                onChange={(e) => setFormData({ ...formData, phoneLast4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="1234"
                maxLength={4}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">数量</label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">取货时段</label>
              <select
                value={formData.pickupSlot}
                onChange={(e) => setFormData({ ...formData, pickupSlot: e.target.value as PickupSlot })}
                className="w-full px-4 py-2.5 bg-slate-800/60 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all"
              >
                {Object.entries(PICKUP_SLOT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.hasIceBag}
                onChange={(e) => setFormData({ ...formData, hasIceBag: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
            <span className="text-sm text-slate-300">居民自带冰袋</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}

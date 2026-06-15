import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Package,
  DollarSign,
  Truck,
  FileText,
  Users,
  RefreshCw,
  Save,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderStore } from '@/store/useOrderStore';
import { formatCurrency, formatDate, PLATFORMS } from '@/types';
import type { AllocationMethod, Order } from '@/types';
import { calculateOrderTotal } from '@/utils/calculator';
import Header from '@/components/layout/Header';
import ItemList from '@/components/item/ItemList';
import AdjustmentList from '@/components/order/AdjustmentList';
import AllocationSettings from '@/components/order/AllocationSettings';
import SettlementPanel from '@/components/settlement/SettlementPanel';

const statusConfig = {
  draft: { label: '草稿', className: 'bg-yellow-100 text-yellow-700' },
  active: { label: '进行中', className: 'bg-blue-100 text-blue-700' },
  completed: { label: '已完成', className: 'bg-green-100 text-green-700' },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    getOrder,
    updateOrder,
    deleteOrder,
    addItem,
    updateItem,
    deleteItem,
    addAdjustment,
    updateAdjustment,
    deleteAdjustment,
    setAllocationMethod,
    setPayment,
    setPickupStatus,
  } = useOrderStore();

  const order = getOrder(id || '');
  const payments = useOrderStore((state) => state.payments[id || ''] || {});
  const pickupStatus = useOrderStore((state) => state.pickupStatus[id || ''] || {});

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    platform: '',
    exchangeRate: '',
    trackingNumber: '',
    totalShipping: '',
    totalTax: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (order) {
      setEditForm({
        platform: order.platform,
        exchangeRate: order.exchangeRate.toString(),
        trackingNumber: order.trackingNumber,
        totalShipping: order.totalShipping.toString(),
        totalTax: order.totalTax.toString(),
      });
    }
  }, [order]);

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <Package className="w-20 h-20 text-neutral-300 mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-bold text-neutral-700 mb-2">订单不存在</h2>
          <p className="text-neutral-500 mb-6">找不到该订单，请检查链接是否正确</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            返回订单列表
          </button>
        </div>
      </div>
    );
  }

  const { itemsTotal, grandTotal } = calculateOrderTotal(
    order.items,
    order.totalShipping,
    order.totalTax,
    order.adjustments,
    order.exchangeRate
  );

  const status = statusConfig[order.status];

  const handleSaveEdit = () => {
    updateOrder(order.id, {
      platform: editForm.platform,
      exchangeRate: parseFloat(editForm.exchangeRate) || 7,
      trackingNumber: editForm.trackingNumber.trim(),
      totalShipping: parseFloat(editForm.totalShipping) || 0,
      totalTax: parseFloat(editForm.totalTax) || 0,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteOrder(order.id);
    navigate('/');
  };

  const handleMethodChange = (method: AllocationMethod) => {
    setAllocationMethod(order.id, method);
  };

  const handleStatusChange = (newStatus: Order['status']) => {
    updateOrder(order.id, { status: newStatus });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-neutral-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回订单列表
          </button>

          <div className="flex items-center gap-3">
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
              className="input-field !w-auto !py-2 text-sm"
            >
              <option value="draft">草稿</option>
              <option value="active">进行中</option>
              <option value="completed">已完成</option>
            </select>
            <button
              onClick={() => setIsEditing(true)}
              className="btn-secondary flex items-center gap-2 !py-2"
            >
              <Edit2 className="w-4 h-4" />
              编辑
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-danger flex items-center gap-2 !py-2"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                <Package className="w-8 h-8 text-primary-700" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="font-serif text-2xl font-bold text-neutral-800">
                    {order.platform}
                  </h1>
                  <span className={`badge ${status.className}`}>{status.label}</span>
                </div>
                <p className="text-neutral-500">
                  转运单号：{order.trackingNumber} · 创建于 {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-500 mb-1">订单总金额</p>
              <p className="font-serif text-3xl font-bold text-primary-800">
                {formatCurrency(grandTotal)}
              </p>
            </div>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-primary-50 rounded-xl mb-4">
              <div>
                <label className="label">平台</label>
                <select
                  value={editForm.platform}
                  onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}
                  className="input-field !py-2 text-sm"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">汇率</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.exchangeRate}
                  onChange={(e) => setEditForm({ ...editForm, exchangeRate: e.target.value })}
                  className="input-field !py-2 text-sm"
                />
              </div>
              <div>
                <label className="label">转运单号</label>
                <input
                  type="text"
                  value={editForm.trackingNumber}
                  onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })}
                  className="input-field !py-2 text-sm"
                />
              </div>
              <div>
                <label className="label">总运费 (¥)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.totalShipping}
                  onChange={(e) => setEditForm({ ...editForm, totalShipping: e.target.value })}
                  className="input-field !py-2 text-sm"
                />
              </div>
              <div>
                <label className="label">总税费 (¥)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.totalTax}
                  onChange={(e) => setEditForm({ ...editForm, totalTax: e.target.value })}
                  className="input-field !py-2 text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <DollarSign className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">汇率</p>
                  <p className="font-semibold text-neutral-800">{order.exchangeRate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <Truck className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">运费</p>
                  <p className="font-semibold text-neutral-800">
                    {formatCurrency(order.totalShipping)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <FileText className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">税费</p>
                  <p className="font-semibold text-neutral-800">
                    {formatCurrency(order.totalTax)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <Package className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">商品</p>
                  <p className="font-semibold text-neutral-800">{order.items.length} 件</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                <Users className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">参与人</p>
                  <p className="font-semibold text-neutral-800">
                    {order.participants.length} 人
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                <RefreshCw className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-xs text-neutral-500">商品总额</p>
                  <p className="font-semibold text-primary-800">
                    {formatCurrency(itemsTotal)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="btn-secondary">
                <X className="w-4 h-4 mr-2" />
                取消
              </button>
              <button onClick={handleSaveEdit} className="btn-primary">
                <Save className="w-4 h-4 mr-2" />
                保存修改
              </button>
            </div>
          )}
        </motion.div>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ItemList
              order={order}
              onAddItem={(item) => addItem(order.id, item)}
              onUpdateItem={(itemId, updates) => updateItem(order.id, itemId, updates)}
              onDeleteItem={(itemId) => deleteItem(order.id, itemId)}
            />
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AllocationSettings
                order={order}
                method={order.allocationMethod}
                onMethodChange={handleMethodChange}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <AdjustmentList
                adjustments={order.adjustments}
                participants={order.participants}
                onAdd={(adj) => addAdjustment(order.id, adj)}
                onUpdate={(adjId, updates) => updateAdjustment(order.id, adjId, updates)}
                onDelete={(adjId) => deleteAdjustment(order.id, adjId)}
              />
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <SettlementPanel
              order={order}
              payments={payments}
              pickupStatus={pickupStatus}
              onSetPayment={(pid, amount) => setPayment(order.id, pid, amount)}
              onSetPickup={(pid, picked) => setPickupStatus(order.id, pid, picked)}
            />
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 shadow-2xl z-50 w-full max-w-sm mx-4"
            >
              <h3 className="font-serif text-xl font-bold text-neutral-800 mb-2">确认删除</h3>
              <p className="text-neutral-600 mb-6">
                确定要删除这个订单吗？此操作无法撤销，所有相关数据将被永久删除。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  取消
                </button>
                <button onClick={handleDelete} className="btn-danger flex-1">
                  确认删除
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

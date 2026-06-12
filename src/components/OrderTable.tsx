import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2,
  QrCode,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Snowflake,
  ArrowLeft,
  Phone,
  Hash,
} from 'lucide-react';
import type { CustomerOrder, QueueStatus } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cn } from '@/lib/utils';

const queueStatusConfig: Record<QueueStatus, { label: string; color: string; icon: typeof Clock }> = {
  not_queued: { label: '未排号', color: 'bg-slate-100 text-slate-600', icon: Clock },
  waiting: { label: '等待中', color: 'bg-amber-100 text-amber-700', icon: Clock },
  called: { label: '已叫号', color: 'bg-cyan-100 text-cyan-700', icon: QrCode },
  picked: { label: '已取货', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle },
  timeout: { label: '已超时', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export function OrderTable() {
  const navigate = useNavigate();
  const { batchId } = useParams();
  const { getOrdersByBatchId, getBatchById, deleteOrder, enqueue } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<QueueStatus | 'all'>('all');

  const batch = getBatchById(batchId || '');
  const orders = getOrdersByBatchId(batchId || '');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.customerName.includes(searchTerm) ||
      order.phone.includes(searchTerm) ||
      order.pickupCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.queueStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!batch) {
    return <div className="text-center text-slate-500">批次不存在</div>;
  }

  const handleEnqueue = (orderId: string) => {
    if (confirm('确认将此订单加入排队队列吗？')) {
      enqueue(orderId);
    }
  };

  const handleDelete = (orderId: string) => {
    if (confirm('确认删除此订单吗？此操作不可撤销。')) {
      deleteOrder(orderId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/batches')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回批次列表
        </button>
        <Link
          to={`/batches/${batchId}/orders/new`}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加订单
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          {batch.productImage && (
            <img
              src={batch.productImage}
              alt={batch.productName}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}
          <div>
            <h2 className="text-xl font-bold text-slate-900">{batch.productName}</h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {new Date(batch.arrivalTime).toLocaleString('zh-CN')}
              </span>
              <span className="flex items-center gap-1">
                <Hash className="w-4 h-4" />
                共 {orders.length} 份订单
              </span>
              {batch.needRefrigeration && (
                <span className="flex items-center gap-1 text-cyan-600">
                  <Snowflake className="w-4 h-4" />
                  冷藏商品
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索姓名、电话或取货码"
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QueueStatus | 'all')}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          >
            <option value="all">全部状态</option>
            {Object.entries(queueStatusConfig).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">排号</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">顾客姓名</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">联系电话</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">数量</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">取货码</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">付款状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">排队状态</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">叫号次数</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    暂无订单数据
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const status = queueStatusConfig[order.queueStatus];
                  const StatusIcon = status.icon;
                  return (
                    <tr
                      key={order.id}
                      className={cn(
                        'border-b border-slate-100 hover:bg-slate-50 transition-colors',
                        order.isPriority && 'bg-cyan-50/30'
                      )}
                    >
                      <td className="py-3 px-4">
                        {order.queueNumber ? (
                          <span className="font-mono font-bold text-lg text-slate-900">
                            {order.queueNumber.toString().padStart(3, '0')}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                        {order.isPriority && (
                          <Snowflake className="w-3 h-3 text-cyan-500 inline ml-1" />
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {order.customerName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {order.phone}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{order.quantity} 份</td>
                      <td className="py-3 px-4">
                        <span className="font-mono bg-slate-100 px-2 py-1 rounded text-sm">
                          {order.pickupCode}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'px-2 py-1 rounded-full text-xs font-medium',
                            order.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : order.paymentStatus === 'unpaid'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-slate-100 text-slate-700'
                          )}
                        >
                          {order.paymentStatus === 'paid'
                            ? '已付款'
                            : order.paymentStatus === 'unpaid'
                            ? '未付款'
                            : '已退款'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                            status.color
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {order.callCount > 0 ? (
                          <span
                            className={cn(
                              'flex items-center gap-1',
                              order.callCount > 1 ? 'text-red-600' : 'text-slate-600'
                            )}
                          >
                            {order.callCount > 1 && <AlertTriangle className="w-3 h-3" />}
                            {order.callCount} 次
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {order.queueStatus === 'not_queued' && batch.status === 'arrived' && (
                            <button
                              onClick={() => handleEnqueue(order.id)}
                              className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                              title="加入排队"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                            title="删除订单"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

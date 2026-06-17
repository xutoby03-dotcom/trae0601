import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStarterStore } from '@/store/useStarterStore';
import { StatusBadge } from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import { 
  Plus, Calendar, Cookie, Clock, CheckCircle, XCircle, 
  AlertTriangle, ChevronDown, ChevronUp, TrendingDown
} from 'lucide-react';
import { StarterStatus } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

const orderSchema = z.object({
  orderNo: z.string().min(2, '请输入订单号'),
  productName: z.string().min(2, '请输入产品名称'),
  plannedDate: z.string().min(1, '请选择计划日期'),
  plannedQuantity: z.coerce.number().min(1, '数量至少1个'),
  starterId: z.string().optional(),
  starterAmount: z.coerce.number().min(1, '酸种用量至少1g').optional(),
  notes: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function ProductionPage() {
  const { 
    productionOrders, starters, getHealthyStarters, 
    addProductionOrder, assignStarterToOrder, completeProduction 
  } = useStarterStore();
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const healthyStarters = useMemo(() => getHealthyStarters(), [getHealthyStarters]);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      plannedDate: new Date().toISOString().split('T')[0],
      plannedQuantity: 20,
    }
  });

  const sortedOrders = useMemo(() => {
    return [...productionOrders].sort((a, b) => 
      new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime()
    );
  }, [productionOrders]);

  const onSubmit = (data: OrderFormData) => {
    addProductionOrder({
      orderNo: data.orderNo,
      productName: data.productName,
      plannedDate: data.plannedDate,
      plannedQuantity: data.plannedQuantity,
      notes: data.notes,
    });
    setShowNewOrderModal(false);
    reset();
  };

  const handleAssign = (starterId: string, amount: number) => {
    if (!selectedOrder) return;
    try {
      assignStarterToOrder(selectedOrder, starterId, amount);
      setShowAssignModal(false);
      setSelectedOrder(null);
      setErrorMessage(null);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : '分配失败');
    }
  };

  const getOrderStatusLabel = (status: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      pending: { text: '待分配', color: 'bg-yellow-100 text-yellow-700' },
      in_progress: { text: '生产中', color: 'bg-blue-100 text-blue-700' },
      completed: { text: '已完成', color: 'bg-green-100 text-green-700' },
      cancelled: { text: '已取消', color: 'bg-red-100 text-red-700' },
    };
    return labels[status] || labels.pending;
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-bread-800">配方排产</h1>
          <p className="text-bread-500 mt-1">管理生产订单，分配合格酸种</p>
        </div>
        <button
          onClick={() => setShowNewOrderModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建订单
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '0ms', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bread-800 font-display">
                {productionOrders.filter(o => o.status === 'pending').length}
              </p>
              <p className="text-sm text-bread-500">待分配</p>
            </div>
          </div>
        </div>
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '100ms', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bread-800 font-display">
                {productionOrders.filter(o => o.status === 'in_progress').length}
              </p>
              <p className="text-sm text-bread-500">生产中</p>
            </div>
          </div>
        </div>
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bread-800 font-display">
                {productionOrders.filter(o => o.status === 'completed').length}
              </p>
              <p className="text-sm text-bread-500">已完成</p>
            </div>
          </div>
        </div>
        <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '300ms', opacity: 0 }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-100/50 flex items-center justify-center">
              <Cookie className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-bread-800 font-display">
                {healthyStarters.length}
              </p>
              <p className="text-sm text-bread-500">可用酸种</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 animate-fade-in-up" style={{ animationDelay: '400ms', opacity: 0 }}>
        <h2 className="text-xl font-display font-bold text-bread-800 mb-6">生产订单</h2>
        
        {sortedOrders.length === 0 ? (
          <div className="text-center py-12 text-bread-400">
            <Calendar className="w-12 h-12 mx-auto mb-3" />
            <p>暂无生产订单</p>
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="btn-primary mt-4"
            >
              创建第一个订单
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedOrders.map((order, index) => {
              const starter = starters.find(s => s.id === order.starterId);
              const isExpanded = expandedOrder === order.id;
              const status = getOrderStatusLabel(order.status);

              return (
                <div
                  key={order.id}
                  className="border border-bread-100 rounded-xl overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${index * 50 + 500}ms`, opacity: 0 }}
                >
                  <div
                    className="p-4 bg-white hover:bg-bread-50 cursor-pointer transition-colors"
                    onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-bread-100 flex items-center justify-center">
                          <Cookie className="w-6 h-6 text-bread-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium text-bread-800">{order.productName}</h3>
                            <span className={`badge ${status.color}`}>{status.text}</span>
                          </div>
                          <p className="text-sm text-bread-500">
                            {order.orderNo} · {order.plannedQuantity}个 · {order.plannedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {starter && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-bread-700">{starter.name}</p>
                            <p className="text-xs text-bread-500">{order.starterAmount}g</p>
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-bread-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-bread-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 bg-bread-50 border-t border-bread-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-bread-500">订单号</p>
                          <p className="font-mono text-bread-800">{order.orderNo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-bread-500">产品名称</p>
                          <p className="font-medium text-bread-800">{order.productName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-bread-500">计划日期</p>
                          <p className="font-medium text-bread-800">{order.plannedDate}</p>
                        </div>
                        <div>
                          <p className="text-sm text-bread-500">计划数量</p>
                          <p className="font-medium text-bread-800">{order.plannedQuantity}个</p>
                        </div>
                        {order.starterId && (
                          <>
                            <div>
                              <p className="text-sm text-bread-500">使用酸种</p>
                              <div className="flex items-center gap-2 mt-1">
                                {starter && <StatusBadge status={starter.status} size="sm" />}
                                <span className="font-medium text-bread-800">{starter?.name}</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-sm text-bread-500">酸种用量</p>
                              <p className="font-medium text-bread-800">{order.starterAmount}g</p>
                            </div>
                          </>
                        )}
                        {order.notes && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-bread-500">备注</p>
                            <p className="text-bread-700">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (healthyStarters.length === 0) {
                                setErrorMessage('没有可用的合格酸种，请先处理异常酸种');
                              } else {
                                setSelectedOrder(order.id);
                                setShowAssignModal(true);
                              }
                            }}
                            className="btn-primary flex-1"
                          >
                            分配酸种
                          </button>
                        )}
                        {order.status === 'in_progress' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              completeProduction(order.id);
                            }}
                            className="btn-success flex-1"
                          >
                            完成生产
                          </button>
                        )}
                        {order.status === 'cancelled' && (
                          <div className="flex-1 flex items-center justify-center gap-2 text-red-500">
                            <XCircle className="w-4 h-4" />
                            <span>酸种异常，订单已取消</span>
                          </div>
                        )}
                        {order.status === 'completed' && (
                          <div className="flex-1 flex items-center justify-center gap-2 text-green-500">
                            <CheckCircle className="w-4 h-4" />
                            <span>生产已完成</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={showNewOrderModal}
        onClose={() => setShowNewOrderModal(false)}
        title="新建生产订单"
        width="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">订单号 *</label>
              <input
                {...register('orderNo')}
                placeholder="如：PO-2026-0617-001"
                className="input"
              />
              {errors.orderNo && <p className="text-red-500 text-sm mt-1">{errors.orderNo.message}</p>}
            </div>
            <div>
              <label className="label">产品名称 *</label>
              <input
                {...register('productName')}
                placeholder="如：乡村硬欧包"
                className="input"
              />
              {errors.productName && <p className="text-red-500 text-sm mt-1">{errors.productName.message}</p>}
            </div>
            <div>
              <label className="label">计划日期 *</label>
              <input
                type="date"
                {...register('plannedDate')}
                className="input"
              />
              {errors.plannedDate && <p className="text-red-500 text-sm mt-1">{errors.plannedDate.message}</p>}
            </div>
            <div>
              <label className="label">计划数量（个）*</label>
              <input
                type="number"
                {...register('plannedQuantity')}
                className="input"
              />
              {errors.plannedQuantity && <p className="text-red-500 text-sm mt-1">{errors.plannedQuantity.message}</p>}
            </div>
          </div>
          <div>
            <label className="label">备注</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="特殊要求、注意事项等..."
              className="input resize-none"
            />
          </div>
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errorMessage}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowNewOrderModal(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
            >
              创建订单
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedOrder(null);
          setErrorMessage(null);
        }}
        title="分配酸种"
        width="lg"
      >
        <div className="space-y-4">
          <p className="text-bread-600">选择一个合格的酸种分配给该订单</p>
          
          {healthyStarters.length === 0 ? (
            <div className="text-center py-8 text-bread-400">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
              <p>没有可用的合格酸种</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {healthyStarters.map(starter => (
                <div
                  key={starter.id}
                  className="p-4 border border-bread-200 rounded-xl hover:border-bread-400 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={starter.photoUrl}
                        alt={starter.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium text-bread-800">{starter.name}</p>
                        <p className="text-sm text-bread-500">{starter.flourType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-bread-800">{starter.currentWeight}g</p>
                      <p className="text-xs text-bread-500">可用</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="酸种用量(g)"
                      defaultValue={100}
                      id={`amount-${starter.id}`}
                      className="input flex-1"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`amount-${starter.id}`) as HTMLInputElement;
                        const amount = parseFloat(input.value);
                        if (amount > 0 && amount <= starter.currentWeight) {
                          handleAssign(starter.id, amount);
                        } else {
                          setErrorMessage(`用量必须在 1g - ${starter.currentWeight}g 之间`);
                        }
                      }}
                      className="btn-primary"
                    >
                      分配
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errorMessage}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  User,
  MapPin,
  Package,
  X,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useTastingStore } from '@/store/tastingStore';
import { useProductStore } from '@/store/productStore';
import { useOrderStore } from '@/store/orderStore';
import { formatTime, formatDateTime, getMinutesUntil, formatDuration } from '@/utils/date';
import type { TastingRecord } from '@/types';

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

function getStatusInfo(status: string, minutesLeft: number) {
  if (status !== 'active') {
    return {
      label: status === 'completed' ? '已完成' : '已过期',
      color: status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
      bgColor: status === 'completed' ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50',
      progressColor: status === 'completed' ? 'bg-emerald-500' : 'bg-rose-500',
    };
  }

  if (minutesLeft <= 0) {
    return {
      label: '已过期',
      color: 'bg-rose-100 text-rose-700',
      bgColor: 'border-rose-300 bg-rose-50',
      progressColor: 'bg-rose-500',
    };
  }
  if (minutesLeft <= 30) {
    return {
      label: '即将过期',
      color: 'bg-amber-100 text-amber-700',
      bgColor: 'border-amber-300 bg-amber-50',
      progressColor: 'bg-amber-500',
    };
  }
  return {
    label: '进行中',
    color: 'bg-emerald-100 text-emerald-700',
    bgColor: 'border-stone-200 bg-white',
    progressColor: 'bg-emerald-500',
  };
}

export default function TastingMonitor() {
  const navigate = useNavigate();
  const records = useTastingStore((state) => state.records);
  const endTasting = useTastingStore((state) => state.endTasting);
  const getProductById = useProductStore((state) => state.getProductById);
  const getBatchById = useProductStore((state) => state.getBatchById);
  const addOrder = useOrderStore((state) => state.addOrder);

  const [, setTick] = useState(0);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [showEndModal, setShowEndModal] = useState<TastingRecord | null>(null);
  const [remainingPortion, setRemainingPortion] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState<TastingRecord | null>(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderAmount, setOrderAmount] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000 * 60);
    return () => clearInterval(timer);
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const filteredRecords = records.filter((r) => {
    if (filter === 'active') return r.status === 'active';
    if (filter === 'completed') return r.status !== 'active';
    return true;
  }).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  const activeCount = records.filter((r) => r.status === 'active').length;
  const completedCount = records.filter((r) => r.status !== 'active').length;

  const handleEndTasting = (record: TastingRecord) => {
    setShowEndModal(record);
    setRemainingPortion(record.remainingPortion);
  };

  const confirmEndTasting = (status: 'completed' | 'expired') => {
    if (!showEndModal) return;
    try {
      endTasting(showEndModal.id, remainingPortion, status);
      setShowEndModal(null);
      showToast('success', '撤台登记成功');
    } catch {
      showToast('error', '撤台登记失败，请重试');
    }
  };

  const handleOpenOrderModal = (record: TastingRecord) => {
    setShowOrderModal(record);
    setOrderQuantity(1);
    setOrderAmount('');
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showOrderModal) return;

    const batch = getBatchById(showOrderModal.batchId);
    const product = batch ? getProductById(batch.productId) : null;
    const amountNum = parseFloat(orderAmount);

    if (orderQuantity <= 0) {
      showToast('error', '请填写有效的数量');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('error', '请填写有效的金额');
      return;
    }
    if (!product) {
      showToast('error', '关联商品信息缺失');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      addOrder({
        tastingId: showOrderModal.id,
        productId: product.id,
        productName: product.name,
        quantity: orderQuantity,
        amount: amountNum,
      });

      showToast('success', `订单记录成功：${product.name} × ${orderQuantity}`);
      setShowOrderModal(null);
      setIsSubmittingOrder(false);
    } catch {
      showToast('error', '订单记录失败，请重试');
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">试吃台监控</h1>
          <p className="text-stone-500 mt-1">实时监控所有试吃台状态，点击卡片记订单</p>
        </div>
        <button
          onClick={() => navigate('/tasting/new')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-550 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          新建试吃
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          全部 ({records.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'active'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          进行中 ({activeCount})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            filter === 'completed'
              ? 'bg-orange-500 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          已结束 ({completedCount})
        </button>
      </div>

      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-16 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-stone-300" />
          </div>
          <p className="text-stone-500 text-lg">暂无试吃记录</p>
          <p className="text-stone-400 text-sm mt-1">点击右上角按钮新建试吃</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords.map((record) => {
            const batch = getBatchById(record.batchId);
            const product = batch ? getProductById(batch.productId) : null;
            const minutesLeft = getMinutesUntil(record.expectedEndTime);
            const statusInfo = getStatusInfo(record.status, minutesLeft);

            const totalMinutes =
              (new Date(record.expectedEndTime).getTime() -
                new Date(record.startTime).getTime()) /
              60000;
            const progress =
              record.status === 'active'
                ? Math.max(0, Math.min(100, (1 - minutesLeft / totalMinutes) * 100))
                : 100;

            const wasteRate = record.portion > 0
              ? Math.round((record.remainingPortion / record.portion) * 100)
              : 0;

            return (
              <div
                key={record.id}
                className={`rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${statusInfo.bgColor}`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-stone-100 rounded-xl overflow-hidden">
                        {product?.photo ? (
                          <img
                            src={product.photo}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-7 h-7 text-stone-400 m-auto" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">
                          {product?.name || '未知商品'}
                        </h3>
                        <p className="text-sm text-stone-500">
                          批次: {batch?.batchNumber || '未知'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600">{record.stationLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600">领用人: {record.operatorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-stone-400" />
                      <span className="text-stone-600">
                        {formatTime(record.startTime)} - {formatTime(record.expectedEndTime)}
                      </span>
                    </div>
                  </div>

                  {record.status === 'active' ? (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-stone-500">
                          {minutesLeft <= 0 ? '已过期' : '剩余时间'}
                        </span>
                        <span
                          className={`font-bold ${
                            minutesLeft <= 0
                              ? 'text-rose-600'
                              : minutesLeft <= 30
                              ? 'text-amber-600'
                              : 'text-stone-700'
                          }`}
                        >
                          {minutesLeft <= 0
                            ? formatDuration(minutesLeft)
                            : formatDuration(minutesLeft)}
                        </span>
                      </div>
                      <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${statusInfo.progressColor}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 p-3 bg-stone-50 rounded-xl">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-500">实际结束</span>
                        <span className="text-stone-700">
                          {record.actualEndTime
                            ? formatDateTime(record.actualEndTime)
                            : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="text-stone-500">浪费率</span>
                        <span
                          className={`font-medium ${
                            wasteRate > 50 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {wasteRate}%
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm text-stone-600">
                        已转化 <strong className="text-stone-800 text-base">{record.convertedOrders}</strong> 单
                      </span>
                    </div>
                    <span className="text-sm text-stone-500">
                      {record.portion - record.remainingPortion}/{record.portion}份
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenOrderModal(record)}
                      className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      记订单
                    </button>
                    {record.status === 'active' && (
                      <button
                        onClick={() => handleEndTasting(record)}
                        className="flex-1 py-2.5 bg-stone-800 text-white rounded-xl font-medium hover:bg-stone-900 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        撤台
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-800">确认撤台</h3>
              <button
                onClick={() => setShowEndModal(null)}
                className="p-1 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const batch = getBatchById(showEndModal.batchId);
              const product = batch ? getProductById(batch.productId) : null;
              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                    <div className="w-12 h-12 bg-stone-200 rounded-lg overflow-hidden">
                      {product?.photo ? (
                        <img src={product.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6 text-stone-400 m-auto" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-stone-800">{product?.name}</p>
                      <p className="text-sm text-stone-500">{showEndModal.stationLocation}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      剩余份量（份）
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max={showEndModal.portion}
                        step="0.1"
                        value={remainingPortion}
                        onChange={(e) => setRemainingPortion(parseFloat(e.target.value))}
                        className="flex-1 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                      <div className="w-16 text-center">
                        <span className="text-xl font-bold text-stone-800">
                          {remainingPortion.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 mt-2">
                      浪费率: {showEndModal.portion > 0
                        ? Math.round((remainingPortion / showEndModal.portion) * 100)
                        : 0}%
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => confirmEndTasting('completed')}
                      className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      正常撤台
                    </button>
                    <button
                      onClick={() => confirmEndTasting('expired')}
                      className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      过期撤台
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                记录转化订单
              </h3>
              <button
                onClick={() => !isSubmittingOrder && setShowOrderModal(null)}
                disabled={isSubmittingOrder}
                className="p-1 text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {(() => {
              const batch = getBatchById(showOrderModal.batchId);
              const product = batch ? getProductById(batch.productId) : null;
              return (
                <form onSubmit={handleSubmitOrder} className="space-y-5">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200">
                    <div className="w-14 h-14 bg-white rounded-xl overflow-hidden shadow-sm">
                      {product?.photo ? (
                        <img src={product.photo} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-7 h-7 text-stone-400 m-auto" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 truncate">{product?.name || '未知商品'}</p>
                      <p className="text-sm text-stone-500 mt-0.5">
                        {showOrderModal.stationLocation} · {showOrderModal.operatorName}
                      </p>
                      <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        试吃ID关联后将计入转化统计
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        数量（件）<span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOrderQuantity((q) => Math.max(1, q - 1))}
                          className="absolute left-0 top-0 bottom-0 w-10 flex items-center justify-center text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-l-xl transition-colors"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={orderQuantity}
                          onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-center text-stone-800 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => setOrderQuantity((q) => q + 1)}
                          className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-r-xl transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        金额（元）<span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500 font-medium">¥</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={orderAmount}
                          onChange={(e) => setOrderAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-medium text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {orderQuantity > 0 && orderAmount && !isNaN(parseFloat(orderAmount)) && (
                    <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between">
                      <span className="text-sm text-stone-500">预估单价</span>
                      <span className="text-sm font-semibold text-stone-700">
                        ¥ {(parseFloat(orderAmount) / orderQuantity).toFixed(2)} / 件
                      </span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => !isSubmittingOrder && setShowOrderModal(null)}
                      disabled={isSubmittingOrder}
                      className="flex-1 py-3 border border-stone-200 text-stone-600 rounded-xl font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingOrder}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isSubmittingOrder ? (
                        <span className="animate-pulse">保存中...</span>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          确认记录
                        </>
                      )}
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      <div className="fixed top-6 right-6 z-[100] space-y-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl pointer-events-auto animate-[slideIn_0.3s_ease-out] ${
              toast.type === 'success'
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                : 'bg-gradient-to-r from-rose-500 to-rose-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

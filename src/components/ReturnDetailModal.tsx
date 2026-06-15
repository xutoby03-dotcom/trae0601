import { useState, useMemo, useEffect } from 'react';
import {
  X,
  Edit2,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Package,
  Calendar,
  User,
  Tag,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  DollarSign,
} from 'lucide-react';
import { ReturnOrder } from '@/types/return';
import { useReturnStore } from '@/store/useReturnStore';
import { formatDate, formatRelativeDate, getRefundProgress } from '@/utils/dateUtils';
import {
  getStatusLabel,
  getNextStatus,
  getPrevStatus,
  hasUrgentReminder,
  hasWarningReminder,
} from '@/utils/statusUtils';

interface ReturnDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onEdit: (order: ReturnOrder) => void;
  onSwitchOrder?: (order: ReturnOrder) => void;
}

export function ReturnDetailModal({ isOpen, onClose, orderId, onEdit, onSwitchOrder }: ReturnDetailModalProps) {
  const { orders, updateStatus, deleteOrder } = useReturnStore();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const order = useMemo<ReturnOrder | null>(() => {
    if (!orderId) return null;
    return orders.find((o) => o.id === orderId) ?? null;
  }, [orders, orderId]);

  const isUrgent = order ? hasUrgentReminder(order) : false;
  const isWarning = order ? hasWarningReminder(order) : false;
  const nextStatus = order ? getNextStatus(order.status) : null;
  const prevStatus = order ? getPrevStatus(order.status) : null;

  const packageSiblings = useMemo(() => {
    if (!order?.packageId) return [];
    return orders.filter((o) => o.packageId === order.packageId && o.id !== order.id);
  }, [orders, order?.packageId, order?.id]);

  const siblingStatusColor: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    shipment_pending: 'bg-blue-100 text-blue-700',
    refund_pending: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
  };

  useEffect(() => {
    if (isOpen && orderId && !order) {
      onClose();
    }
  }, [isOpen, orderId, order, onClose]);

  if (!isOpen || !order) return null;

  const handleDelete = () => {
    if (confirm('确定要删除这条退货记录吗？')) {
      deleteOrder(order.id);
      onClose();
    }
  };

  const handleStatusNext = () => {
    if (nextStatus) {
      updateStatus(order.id, nextStatus);
    }
  };

  const handleStatusPrev = () => {
    if (prevStatus) {
      updateStatus(order.id, prevStatus);
    }
  };

  const statusColorMap = {
    pending: 'bg-yellow-100 text-yellow-700',
    shipment_pending: 'bg-blue-100 text-blue-700',
    refund_pending: 'bg-purple-100 text-purple-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {selectedPhoto && (
          <div
            className="absolute inset-0 z-10 bg-black/90 flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <img
              src={selectedPhoto}
              alt="放大图片"
              className="max-w-full max-h-full object-contain p-4"
            />
          </div>
        )}

        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                statusColorMap[order.status]
              }`}
            >
              {getStatusLabel(order.status)}
            </span>
            {isUrgent && (
              <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                <AlertTriangle size={14} />
                紧急
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => order && onEdit(order)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Edit2 size={18} className="text-gray-500" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 size={18} className="text-red-400" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <h2 className="text-xl font-bold text-gray-800 mb-4">{order.productName}</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Tag size={18} className="text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">平台</p>
                <p className="text-sm font-medium text-gray-700">{order.platform}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">下单人</p>
                <p className="text-sm font-medium text-gray-700">{order.buyer}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">退货原因</p>
                <p className="text-sm font-medium text-gray-700">{order.returnReason}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar size={18} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">申请截止</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(order.applicationDeadline)}
                  </p>
                  <p
                    className={`text-xs ${
                      isUrgent ? 'text-red-500' : isWarning ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                  >
                    {formatRelativeDate(order.applicationDeadline)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Truck size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">寄出截止</p>
                  <p className="text-sm font-medium text-gray-700">
                    {formatDate(order.shipDeadline)}
                  </p>
                  <p
                    className={`text-xs ${
                      isUrgent ? 'text-red-500' : isWarning ? 'text-yellow-600' : 'text-gray-400'
                    }`}
                  >
                    {formatRelativeDate(order.shipDeadline)}
                  </p>
                </div>
              </div>
            </div>

            {order.pickupCode && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">取件码</p>
                <p className="text-lg font-mono font-bold text-gray-800">{order.pickupCode}</p>
              </div>
            )}

            {order.trackingNumber && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">快递单号</p>
                <p className="text-base font-mono font-medium text-gray-800 break-all">
                  {order.trackingNumber}
                </p>
              </div>
            )}

            {order.refundApplyDate && order.status !== 'completed' && (() => {
              const progress = getRefundProgress(order.refundApplyDate, order.refundPromiseDays);
              const isOverdue = progress?.isOverdue ?? false;
              const isNearDue = progress?.isNearDue ?? false;
              const barColor = isOverdue
                ? 'bg-red-500'
                : isNearDue
                ? 'bg-yellow-400'
                : 'bg-teal-500';
              const titleColor = isOverdue
                ? 'text-red-700'
                : isNearDue
                ? 'text-yellow-700'
                : 'text-teal-700';
              const bgColor = isOverdue
                ? 'bg-red-50 border-red-100'
                : isNearDue
                ? 'bg-yellow-50 border-yellow-100'
                : 'bg-teal-50 border-teal-100';
              return (
                <div className={`rounded-xl p-4 border ${bgColor}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isOverdue ? 'bg-red-100' : isNearDue ? 'bg-yellow-100' : 'bg-teal-100'}`}>
                        <DollarSign size={18} className={titleColor} />
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${titleColor}`}>
                          {progress?.isOverdue
                            ? `已超期 ${progress.overdueDays} 天`
                            : progress?.remainingDays === 0
                            ? '今天到期'
                            : progress?.remainingDays === 1
                            ? '还差 1 天到账'
                            : `还差 ${progress?.remainingDays} 天到账`}
                        </p>
                        <p className="text-xs text-gray-500">
                          申请日 {formatDate(order.refundApplyDate)} · 承诺 {order.refundPromiseDays} 天
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${titleColor}`}>
                        {progress?.percent}%
                      </p>
                      <p className="text-xs text-gray-500">
                        已等 {progress?.elapsedDays} 天
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${progress?.percent ?? 0}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>已申请 {progress?.elapsedDays} 天</span>
                    <span>承诺 {progress?.promisedDays} 天</span>
                    <span>
                      {progress?.isOverdue
                        ? `超 ${progress.overdueDays} 天`
                        : `剩 ${progress?.remainingDays} 天`}
                    </span>
                  </div>
                </div>
              );
            })()}

            {order.packageId && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-blue-500" />
                    <p className="text-sm font-semibold text-blue-800">
                      同包裹商品 · 共 {packageSiblings.length + 1} 件
                    </p>
                  </div>
                  <span className="text-xs text-blue-400">ID: {order.packageId}</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-blue-200 border-dashed">
                  <div className="w-1 h-8 w-px bg-blue-500 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {order.productName}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full ${statusColorMap[order.status]}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-xs text-gray-400">当前</span>
                    </div>
                  </div>
                </div>

                {packageSiblings.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {packageSiblings.map((sibling) => (
                      <button
                        key={sibling.id}
                        type="button"
                        onClick={() => onSwitchOrder?.(sibling)}
                        className="w-full flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg border border-blue-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all group"
                      >
                        <div className="w-1 h-8 w-px bg-blue-200 rounded-full flex-shrink-0" />
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700">
                            {sibling.productName}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded-full ${siblingStatusColor[sibling.status]}`}
                            >
                              {getStatusLabel(sibling.status)}
                            </span>
                            {sibling.trackingNumber && (
                              <span className="text-xs text-gray-400 font-mono truncate max-w-[140px]">
                                单号 {sibling.trackingNumber.substring(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {order.photos.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">商品照片</p>
                <div className="grid grid-cols-3 gap-2">
                  {order.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      <img
                        src={photo}
                        alt={`商品图片 ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          {prevStatus && (
            <button
              onClick={handleStatusPrev}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={18} />
              上一步
            </button>
          )}
          {nextStatus ? (
            <button
              onClick={handleStatusNext}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all shadow-lg ${
                nextStatus === 'completed'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-green-200'
                  : 'bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-orange-200'
              }`}
            >
              {nextStatus === 'completed' ? (
                <>
                  <CheckCircle size={18} />
                  确认已到账
                </>
              ) : (
                <>
                  标记为{getStatusLabel(nextStatus)}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-100 text-green-700 font-medium">
              <CheckCircle size={18} />
              已完成
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

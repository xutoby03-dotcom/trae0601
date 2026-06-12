import { useState } from 'react';
import { Reservation } from '@/types';
import { useReservationStore } from '@/store/reservationStore';
import StatusBadge from './StatusBadge';
import { formatDateShort, formatPrice } from '@/utils/date';
import { 
  Phone, 
  Calendar, 
  CreditCard, 
  MessageSquare, 
  Gift, 
  Clock,
  CheckCircle,
  XCircle,
  Clock3
} from 'lucide-react';
import Modal from '@/components/common/Modal';

interface ReservationCardProps {
  reservation: Reservation;
}

export default function ReservationCard({ reservation }: ReservationCardProps) {
  const { completeReservation, cancelReservation, rescheduleReservation } = useReservationStore();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [newPickupTime, setNewPickupTime] = useState('');
  const [showDetails, setShowDetails] = useState(false);

  const canComplete = reservation.status === 'pending' || reservation.status === 'to_confirm';
  const canCancel = reservation.status === 'pending' || reservation.status === 'to_confirm';
  const canReschedule = reservation.status === 'pending' || reservation.status === 'to_confirm';

  const handleComplete = () => {
    completeReservation(reservation.id, '店员');
  };

  const handleCancel = () => {
    cancelReservation(reservation.id, '店员', cancelReason || '顾客取消');
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleReschedule = () => {
    if (!newPickupTime) return;
    rescheduleReservation(reservation.id, new Date(newPickupTime).toISOString(), '店员');
    setShowRescheduleModal(false);
    setNewPickupTime('');
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-hover transition-all duration-300">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <img
                src={reservation.bouquetPhoto}
                alt={reservation.bouquetName}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <h4 className="font-semibold text-forest-700 font-serif">{reservation.bouquetName}</h4>
                <p className="text-sm text-forest-400">x{reservation.quantity}束</p>
              </div>
            </div>
            <StatusBadge status={reservation.status} />
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-forest-600">
              <span className="w-5 h-5 flex items-center justify-center text-forest-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <span>{reservation.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <Phone className="w-5 h-5 text-forest-400" />
              <span>{reservation.customerPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <Calendar className="w-5 h-5 text-forest-400" />
              <span>取花时间：{formatDateShort(reservation.pickupTime)}</span>
            </div>
            <div className="flex items-center gap-2 text-forest-600">
              <CreditCard className="w-5 h-5 text-forest-400" />
              <span>定金：{formatPrice(reservation.deposit)}</span>
            </div>
          </div>

          {(reservation.cardMessage || reservation.specialPackaging) && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="mt-3 text-sm text-rose-500 hover:text-rose-600 font-medium"
            >
              {showDetails ? '收起详情' : '查看更多详情'}
            </button>
          )}

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-cream-200 space-y-2">
              {reservation.cardMessage && (
                <div className="flex items-start gap-2 text-sm">
                  <MessageSquare className="w-4 h-4 text-forest-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-forest-400">贺卡：</span>
                    <span className="text-forest-600">{reservation.cardMessage}</span>
                  </div>
                </div>
              )}
              {reservation.specialPackaging && (
                <div className="flex items-start gap-2 text-sm">
                  <Gift className="w-4 h-4 text-forest-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-forest-400">包装要求：</span>
                    <span className="text-forest-600">{reservation.specialPackaging}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-cream-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-forest-400">订单金额</span>
              <span className="text-xl font-bold text-rose-500 font-serif">{formatPrice(reservation.deposit * 2 || 0)}</span>
            </div>
            
            {canComplete || canCancel || canReschedule ? (
              <div className="flex gap-2">
                {canComplete && (
                  <button
                    onClick={handleComplete}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md shadow-emerald-200/50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    确认取花
                  </button>
                )}
                {canReschedule && (
                  <button
                    onClick={() => setShowRescheduleModal(true)}
                    className="flex items-center justify-center px-4 py-2.5 bg-forest-50 text-forest-600 text-sm font-medium rounded-xl hover:bg-forest-100 transition-colors border border-forest-200"
                  >
                    <Clock3 className="w-4 h-4" />
                  </button>
                )}
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex items-center justify-center px-4 py-2.5 bg-rose-50 text-rose-500 text-sm font-medium rounded-xl hover:bg-rose-100 transition-colors border border-rose-200"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-forest-400">
                <Clock className="w-4 h-4" />
                <span>创建于 {formatDateShort(reservation.createdAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="取消预留"
        footer={
          <>
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-5 py-2.5 text-forest-600 hover:bg-cream-100 rounded-xl transition-colors"
            >
              再想想
            </button>
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 bg-rose-500 text-white font-medium rounded-xl hover:bg-rose-600 transition-colors"
            >
              确认取消
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-forest-600">确定要取消这个预留订单吗？</p>
          <div className="p-4 bg-cream-50 rounded-xl">
            <p className="text-sm text-forest-500">
              <strong>{reservation.customerName}</strong> - {reservation.bouquetName} x{reservation.quantity}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-600 mb-2 block">取消原因</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="请输入取消原因（选填）"
              rows={3}
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all resize-none"
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="改期"
        footer={
          <>
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="px-5 py-2.5 text-forest-600 hover:bg-cream-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleReschedule}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all"
            >
              确认改期
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-forest-600">请选择新的取花时间</p>
          <div className="p-4 bg-cream-50 rounded-xl">
            <p className="text-sm text-forest-500">
              当前取花时间：{formatDateShort(reservation.pickupTime)}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-forest-600 mb-2 block">新取花时间</label>
            <input
              type="datetime-local"
              value={newPickupTime}
              onChange={(e) => setNewPickupTime(e.target.value)}
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all"
            />
          </div>
        </div>
      </Modal>
    </>
  );
}

import { useState } from 'react';
import { Bouquet } from '@/types';
import { useReservationStore } from '@/store/reservationStore';
import Modal from '@/components/common/Modal';
import { formatPrice } from '@/utils/date';
import { Phone, User, Calendar, CreditCard, MessageSquare, Gift } from 'lucide-react';

interface ReserveModalProps {
  isOpen: boolean;
  onClose: () => void;
  bouquet: Bouquet;
}

export default function ReserveModal({ isOpen, onClose, bouquet }: ReserveModalProps) {
  const { createReservation } = useReservationStore();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    pickupTime: '',
    deposit: '',
    cardMessage: '',
    specialPackaging: '',
    quantity: 1,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availableStock = bouquet.stock - bouquet.reservedCount;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = '请输入顾客姓名';
    }
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = '请输入联系电话';
    }
    if (!formData.pickupTime) {
      newErrors.pickupTime = '请选择取花时间';
    }
    if (formData.quantity > availableStock) {
      newErrors.quantity = `库存不足，仅剩${availableStock}束`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    createReservation({
      bouquetId: bouquet.id,
      bouquetName: bouquet.name,
      bouquetPhoto: bouquet.photo,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      pickupTime: new Date(formData.pickupTime).toISOString(),
      deposit: Number(formData.deposit) || 0,
      cardMessage: formData.cardMessage,
      specialPackaging: formData.specialPackaging,
      quantity: formData.quantity,
    });

    setFormData({
      customerName: '',
      customerPhone: '',
      pickupTime: '',
      deposit: '',
      cardMessage: '',
      specialPackaging: '',
      quantity: 1,
    });
    onClose();
  };

  const totalPrice = bouquet.price * formData.quantity;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="创建预留订单"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-forest-600 hover:bg-cream-100 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-400 to-rose-500 text-white font-medium rounded-xl hover:from-rose-500 hover:to-rose-600 transition-all shadow-md shadow-rose-200/50"
          >
            确认预留
          </button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-4 p-4 bg-cream-50 rounded-xl">
          <img
            src={bouquet.photo}
            alt={bouquet.name}
            className="w-20 h-20 rounded-lg object-cover"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-forest-700 font-serif">{bouquet.name}</h4>
            <p className="text-sm text-forest-500 mt-1">{bouquet.color} · {bouquet.category}</p>
            <p className="text-lg font-bold text-rose-500 mt-2">{formatPrice(bouquet.price)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-forest-600 mb-2">
                <User className="w-4 h-4" />
                顾客姓名
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="请输入姓名"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all ${
                  errors.customerName ? 'border-rose-400' : 'border-cream-300'
                }`}
              />
              {errors.customerName && (
                <p className="text-xs text-rose-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-forest-600 mb-2">
                <Phone className="w-4 h-4" />
                联系电话
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="请输入电话"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all ${
                  errors.customerPhone ? 'border-rose-400' : 'border-cream-300'
                }`}
              />
              {errors.customerPhone && (
                <p className="text-xs text-rose-500 mt-1">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-forest-600 mb-2">
                <Calendar className="w-4 h-4" />
                取花时间
              </label>
              <input
                type="datetime-local"
                value={formData.pickupTime}
                onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all ${
                  errors.pickupTime ? 'border-rose-400' : 'border-cream-300'
                }`}
              />
              {errors.pickupTime && (
                <p className="text-xs text-rose-500 mt-1">{errors.pickupTime}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-forest-600 mb-2">
                <CreditCard className="w-4 h-4" />
                定金 (元)
              </label>
              <input
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-forest-600 mb-2">
              数量
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFormData({ ...formData, quantity: Math.max(1, formData.quantity - 1) })}
                className="w-10 h-10 rounded-xl bg-cream-100 text-forest-600 hover:bg-cream-200 transition-colors font-medium"
              >
                -
              </button>
              <span className="w-12 text-center font-medium text-forest-700">{formData.quantity}</span>
              <button
                onClick={() => setFormData({ ...formData, quantity: Math.min(availableStock, formData.quantity + 1) })}
                className="w-10 h-10 rounded-xl bg-cream-100 text-forest-600 hover:bg-cream-200 transition-colors font-medium"
              >
                +
              </button>
              <span className="text-sm text-forest-400">库存 {availableStock} 束</span>
            </div>
            {errors.quantity && (
              <p className="text-xs text-rose-500 mt-1">{errors.quantity}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-forest-600 mb-2">
              <MessageSquare className="w-4 h-4" />
              贺卡内容
            </label>
            <textarea
              value={formData.cardMessage}
              onChange={(e) => setFormData({ ...formData, cardMessage: e.target.value })}
              placeholder="请输入贺卡上的祝福语（选填）"
              rows={2}
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all resize-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-forest-600 mb-2">
              <Gift className="w-4 h-4" />
              特殊包装要求
            </label>
            <input
              type="text"
              value={formData.specialPackaging}
              onChange={(e) => setFormData({ ...formData, specialPackaging: e.target.value })}
              placeholder="如：礼盒装、加丝带、加贺卡等（选填）"
              className="w-full px-4 py-2.5 border border-cream-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition-all"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-cream-200">
          <div className="flex items-center justify-between">
            <span className="text-forest-500">总计金额</span>
            <span className="text-2xl font-bold text-rose-500 font-serif">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

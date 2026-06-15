import { useState, useEffect } from 'react';
import { X, Upload, Package } from 'lucide-react';
import { ReturnOrder, PLATFORMS, RETURN_REASONS, ReturnStatus } from '@/types/return';
import { useReturnStore } from '@/store/useReturnStore';
import { addDaysFromNow } from '@/utils/dateUtils';

interface ReturnFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editOrder?: ReturnOrder | null;
}

export function ReturnFormModal({ isOpen, onClose, editOrder }: ReturnFormModalProps) {
  const { addOrder, updateOrder } = useReturnStore();
  const [formData, setFormData] = useState({
    platform: '淘宝',
    productName: '',
    buyer: '',
    returnReason: '七天无理由',
    applicationDeadline: addDaysFromNow(7),
    shipDeadline: addDaysFromNow(10),
    pickupCode: '',
    trackingNumber: '',
    status: 'pending' as ReturnStatus,
    refundPromiseDays: 7,
    refundApplyDate: '',
    packageId: '',
    photos: [] as string[],
  });

  useEffect(() => {
    if (editOrder) {
      setFormData({
        platform: editOrder.platform,
        productName: editOrder.productName,
        buyer: editOrder.buyer,
        returnReason: editOrder.returnReason,
        applicationDeadline: editOrder.applicationDeadline,
        shipDeadline: editOrder.shipDeadline,
        pickupCode: editOrder.pickupCode,
        trackingNumber: editOrder.trackingNumber,
        status: editOrder.status,
        refundPromiseDays: editOrder.refundPromiseDays,
        refundApplyDate: editOrder.refundApplyDate || '',
        packageId: editOrder.packageId || '',
        photos: editOrder.photos,
      });
    } else {
      setFormData({
        platform: '淘宝',
        productName: '',
        buyer: '',
        returnReason: '七天无理由',
        applicationDeadline: addDaysFromNow(7),
        shipDeadline: addDaysFromNow(10),
        pickupCode: '',
        trackingNumber: '',
        status: 'pending',
        refundPromiseDays: 7,
        refundApplyDate: '',
        packageId: '',
        photos: [],
      });
    }
  }, [editOrder, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editOrder) {
      updateOrder(editOrder.id, formData);
    } else {
      addOrder(formData);
    }
    onClose();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setFormData((prev) => ({
              ...prev,
              photos: [...prev.photos, event.target!.result as string],
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {editOrder ? '编辑退货' : '添加退货'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-[90vh] max-h-[90vh]">
          <div className="p-6 overflow-y-auto flex-1">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  平台
                </label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品名称
                </label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="请输入商品名称"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    下单人
                  </label>
                  <input
                    type="text"
                    value={formData.buyer}
                    onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                    placeholder="姓名"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    退货原因
                  </label>
                  <select
                    value={formData.returnReason}
                    onChange={(e) => setFormData({ ...formData, returnReason: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50"
                  >
                    {RETURN_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    申请截止日
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDeadline}
                    onChange={(e) => setFormData({ ...formData, applicationDeadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    寄出截止日
                  </label>
                  <input
                    type="date"
                    value={formData.shipDeadline}
                    onChange={(e) => setFormData({ ...formData, shipDeadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  状态
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ReturnStatus })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50"
                >
                  <option value="pending">待申请</option>
                  <option value="shipment_pending">待寄出</option>
                  <option value="refund_pending">退款中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    取件码
                  </label>
                  <input
                    type="text"
                    value={formData.pickupCode}
                    onChange={(e) => setFormData({ ...formData, pickupCode: e.target.value })}
                    placeholder="如有"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    快递单号
                  </label>
                  <input
                    type="text"
                    value={formData.trackingNumber}
                    onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                    placeholder="如有"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    退款承诺天数
                  </label>
                  <input
                    type="number"
                    value={formData.refundPromiseDays}
                    onChange={(e) => setFormData({ ...formData, refundPromiseDays: parseInt(e.target.value) || 7 })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    退款申请日期
                  </label>
                  <input
                    type="date"
                    value={formData.refundApplyDate}
                    onChange={(e) => setFormData({ ...formData, refundApplyDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  包裹ID（同包裹多件商品填相同ID）
                </label>
                <input
                  type="text"
                  value={formData.packageId}
                  onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
                  placeholder="如：pkg-001，可选"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品照片
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`商品图片 ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all">
                    <Upload size={24} className="text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">上传</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 flex gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-medium hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg shadow-orange-200"
            >
              {editOrder ? '保存修改' : '添加退货'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import type { Medicine } from '@/types';
import { useRecordStore } from '@/store/useRecordStore';
import { useMedicineStore } from '@/store/useMedicineStore';
import { Check } from 'lucide-react';

interface UsageModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  cabinetId: string;
}

export const UsageModal: React.FC<UsageModalProps> = ({ isOpen, onClose, medicine, cabinetId }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    studentName: '',
    quantity: 1,
    needParentFollowUp: false,
    operator: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  
  const addUsageRecord = useRecordStore(state => state.addUsageRecord);
  const updateQuantity = useMedicineStore(state => state.updateQuantity);
  
  if (!medicine) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purpose.trim() || !formData.operator.trim()) {
      return;
    }
    
    addUsageRecord({
      cabinetId,
      medicineId: medicine.id,
      purpose: formData.purpose,
      studentName: formData.studentName || undefined,
      quantity: formData.quantity,
      needParentFollowUp: formData.needParentFollowUp,
      operator: formData.operator,
    });
    
    updateQuantity(medicine.id, -formData.quantity, formData.operator);
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        purpose: '',
        studentName: '',
        quantity: 1,
        needParentFollowUp: false,
        operator: '',
      });
      onClose();
    }, 1500);
  };
  
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="领用成功">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-medium text-gray-900">领用登记成功</p>
          <p className="text-gray-500 text-sm mt-1">库存已更新</p>
        </div>
      </Modal>
    );
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`领用 - ${medicine.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-medium">当前库存：</span> {medicine.currentQuantity} {medicine.specification.split('/')[1] || '单位'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            用途 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.purpose}
            onChange={e => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={2}
            placeholder="例如：运动擦伤、感冒发烧等"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            学生姓名 <span className="text-gray-400 text-xs">(可选)</span>
          </label>
          <input
            type="text"
            value={formData.studentName}
            onChange={e => setFormData(prev => ({ ...prev, studentName: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="请输入学生姓名"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            数量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            max={medicine.currentQuantity}
            value={formData.quantity}
            onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="needFollowUp"
            checked={formData.needParentFollowUp}
            onChange={e => setFormData(prev => ({ ...prev, needParentFollowUp: e.target.checked }))}
            className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
          />
          <label htmlFor="needFollowUp" className="text-sm text-gray-700">
            需要家长回访
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            操作人 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.operator}
            onChange={e => setFormData(prev => ({ ...prev, operator: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="请输入您的姓名"
            required
          />
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            确认领用
          </button>
        </div>
      </form>
    </Modal>
  );
};

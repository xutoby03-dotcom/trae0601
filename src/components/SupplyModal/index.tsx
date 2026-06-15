import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import type { Medicine } from '@/types';
import { useRecordStore } from '@/store/useRecordStore';
import { useMedicineStore } from '@/store/useMedicineStore';
import { Check } from 'lucide-react';

interface SupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicine: Medicine | null;
  cabinetId: string;
}

export const SupplyModal: React.FC<SupplyModalProps> = ({ isOpen, onClose, medicine, cabinetId }) => {
  const [formData, setFormData] = useState({
    source: '医务室统一采购',
    quantity: 10,
    supplier: '',
  });
  const [showSuccess, setShowSuccess] = useState(false);
  
  const addSupplyRecord = useRecordStore(state => state.addSupplyRecord);
  const updateQuantity = useMedicineStore(state => state.updateQuantity);
  
  if (!medicine) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.source.trim() || !formData.supplier.trim()) {
      return;
    }
    
    addSupplyRecord({
      cabinetId,
      medicineId: medicine.id,
      source: formData.source,
      quantity: formData.quantity,
      supplier: formData.supplier,
    });
    
    updateQuantity(medicine.id, formData.quantity, formData.supplier);
    
    setShowSuccess(true);
    
    setTimeout(() => {
      setShowSuccess(false);
      setFormData({
        source: '医务室统一采购',
        quantity: 10,
        supplier: '',
      });
      onClose();
    }, 1500);
  };
  
  if (showSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="补给成功">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-medium text-gray-900">补给登记成功</p>
          <p className="text-gray-500 text-sm mt-1">库存已更新 +{formData.quantity}</p>
        </div>
      </Modal>
    );
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`补给 - ${medicine.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-green-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            <span className="font-medium">当前库存：</span> {medicine.currentQuantity} {medicine.specification.split('/')[1] || '单位'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            补给来源 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.source}
            onChange={e => setFormData(prev => ({ ...prev, source: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          >
            <option value="医务室统一采购">医务室统一采购</option>
            <option value="上级部门配发">上级部门配发</option>
            <option value="社会捐赠">社会捐赠</option>
            <option value="其他">其他</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            入箱数量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={formData.quantity}
            onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            补给人 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.supplier}
            onChange={e => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="请输入补给人姓名"
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
            className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            确认补给
          </button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState } from 'react';
import { ClothesRecord, CollectFormData } from '../types';
import { useStore } from '../store/useStore';
import { X, Check, MessageSquare } from 'lucide-react';

interface CollectModalProps {
  record: ClothesRecord;
  isOpen: boolean;
  onClose: () => void;
}

export const CollectModal: React.FC<CollectModalProps> = ({ record, isOpen, onClose }) => {
  const { collectRecord } = useStore();
  const [formData, setFormData] = useState<CollectFormData>({
    isDry: true,
    isDamp: false,
    needsRedry: false,
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = () => {
    collectRecord(record.id, formData);
    onClose();
  };

  const statusOptions = [
    {
      value: 'dry',
      label: '已干完美',
      icon: '☀️',
      color: 'border-green-400 bg-green-50 hover:bg-green-100',
      activeColor: 'border-green-500 bg-green-100 ring-2 ring-green-500/30',
      onClick: () => setFormData({ ...formData, isDry: true, isDamp: false, needsRedry: false })
    },
    {
      value: 'slight-damp',
      label: '轻微返潮',
      icon: '💧',
      color: 'border-blue-400 bg-blue-50 hover:bg-blue-100',
      activeColor: 'border-blue-500 bg-blue-100 ring-2 ring-blue-500/30',
      onClick: () => setFormData({ ...formData, isDry: false, isDamp: true, needsRedry: false })
    },
    {
      value: 'heavy-damp',
      label: '严重返潮需二次晾晒',
      icon: '🌊',
      color: 'border-red-400 bg-red-50 hover:bg-red-100',
      activeColor: 'border-red-500 bg-red-100 ring-2 ring-red-500/30',
      onClick: () => setFormData({ ...formData, isDry: false, isDamp: true, needsRedry: true })
    }
  ];

  const getActiveStatus = () => {
    if (formData.needsRedry) return 'heavy-damp';
    if (formData.isDamp) return 'slight-damp';
    if (formData.isDry) return 'dry';
    return null;
  };

  const activeStatus = getActiveStatus();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-sky-500 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{record.clothingTypeIcon}</span>
              <div>
                <h3 className="text-xl font-bold font-display">收衣确认</h3>
                <p className="text-sm opacity-90">
                  {record.clothingTypeLabel} × {record.quantity} | {record.location}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              衣物状态
            </label>
            <div className="space-y-2">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={option.onClick}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    activeStatus === option.value ? option.activeColor : option.color
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-medium">{option.label}</span>
                    {activeStatus === option.value && (
                      <Check size={20} className="ml-auto text-green-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MessageSquare size={16} />
              备注（可选）
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="记录特殊情况，如污渍未洗净等..."
              className="input-field min-h-[80px] resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 btn-primary flex items-center justify-center gap-2"
            >
              <Check size={18} />
              确认收衣
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

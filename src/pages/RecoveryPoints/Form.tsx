import React, { useState, useEffect } from 'react';
import { MapPin, User, Phone, Package, Calendar, Image, X } from 'lucide-react';
import type { RecoveryPoint } from '../../types';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';

interface RecoveryPointFormProps {
  isOpen: boolean;
  onClose: () => void;
  editPoint?: RecoveryPoint | null;
}

export const RecoveryPointForm: React.FC<RecoveryPointFormProps> = ({
  isOpen,
  onClose,
  editPoint,
}) => {
  const { addRecoveryPoint, updateRecoveryPoint } = useRecoveryPointsStore();
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    phone: '',
    capacityKg: 500,
    currentKg: 0,
    collectionSchedule: '',
    photoUrl: '',
  });

  useEffect(() => {
    if (editPoint) {
      setFormData({
        name: editPoint.name,
        location: editPoint.location,
        manager: editPoint.manager,
        phone: editPoint.phone,
        capacityKg: editPoint.capacityKg,
        currentKg: editPoint.currentKg,
        collectionSchedule: editPoint.collectionSchedule,
        photoUrl: editPoint.photoUrl,
      });
    } else {
      setFormData({
        name: '',
        location: '',
        manager: '',
        phone: '',
        capacityKg: 500,
        currentKg: 0,
        collectionSchedule: '',
        photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=green%20clothing%20recycling%20bin&image_size=square',
      });
    }
  }, [editPoint, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editPoint) {
      updateRecoveryPoint(editPoint.id, formData);
    } else {
      addRecoveryPoint(formData);
    }
    
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacityKg' || name === 'currentKg' ? Number(value) : value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-fade-in-up">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">
              {editPoint ? '编辑回收点' : '新增回收点'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    回收点名称
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="请输入回收点名称"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 text-primary-500" />
                    详细位置
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="请输入详细位置"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 text-primary-500" />
                    负责人
                  </label>
                  <input
                    type="text"
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="请输入负责人姓名"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 text-primary-500" />
                    联系电话
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="请输入联系电话"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 text-primary-500" />
                    设计容量 (kg)
                  </label>
                  <input
                    type="number"
                    name="capacityKg"
                    value={formData.capacityKg}
                    onChange={handleChange}
                    min="100"
                    step="50"
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4 text-primary-500" />
                    当前存量 (kg)
                  </label>
                  <input
                    type="number"
                    name="currentKg"
                    value={formData.currentKg}
                    onChange={handleChange}
                    min="0"
                    step="1"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 text-primary-500" />
                  清运时间
                </label>
                <input
                  type="text"
                  name="collectionSchedule"
                  value={formData.collectionSchedule}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="例如：每周二、五上午"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Image className="w-4 h-4 text-primary-500" />
                  照片链接
                </label>
                <input
                  type="url"
                  name="photoUrl"
                  value={formData.photoUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="请输入照片URL"
                />
                {formData.photoUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.photoUrl}
                      alt="预览"
                      className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl transition-all shadow-lg shadow-primary-200"
              >
                {editPoint ? '保存修改' : '创建回收点'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

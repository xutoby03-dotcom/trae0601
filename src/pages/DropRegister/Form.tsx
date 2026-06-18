import React, { useState } from 'react';
import { MapPin, Package, Shirt, Check, User, X, Plus, Minus } from 'lucide-react';
import { useDropRecordsStore } from '../../store/dropRecords';
import { useRecoveryPointsStore } from '../../store/recoveryPoints';
import { estimateBagWeight } from '../../utils/calculations';

interface DropRegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const clothingTypeOptions = ['上衣', '裤子', '外套', '其他'];

export const DropRegisterForm: React.FC<DropRegisterFormProps> = ({
  isOpen,
  onClose,
}) => {
  const { addDropRecord } = useDropRecordsStore();
  const { recoveryPoints } = useRecoveryPointsStore();

  const [formData, setFormData] = useState({
    recoveryPointId: '',
    bagCount: 1,
    clothingTypes: [] as string[],
    isCleaned: false,
    hasShoesBagsToys: false,
    contributor: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDropRecord(formData);
    onClose();
    setFormData({
      recoveryPointId: '',
      bagCount: 1,
      clothingTypes: [],
      isCleaned: false,
      hasShoesBagsToys: false,
      contributor: '',
    });
  };

  const handleClothingTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      clothingTypes: prev.clothingTypes.includes(type)
        ? prev.clothingTypes.filter(t => t !== type)
        : [...prev.clothingTypes, type],
    }));
  };

  const estimatedWeight = estimateBagWeight(formData.bagCount);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl animate-fade-in-up">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900">投放登记</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/* 选择回收点 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  选择回收点
                </label>
                <select
                  name="recoveryPointId"
                  value={formData.recoveryPointId}
                  onChange={(e) => setFormData(prev => ({ ...prev, recoveryPointId: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">请选择回收点</option>
                  {recoveryPoints.map(point => (
                    <option key={point.id} value={point.id}>
                      {point.name} - {point.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* 袋数 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Package className="w-4 h-4 text-primary-500" />
                  投放袋数
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bagCount: Math.max(1, prev.bagCount - 1) }))}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-2xl font-bold text-gray-900 font-mono">
                      {formData.bagCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, bagCount: prev.bagCount + 1 }))}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="flex-1 p-3 bg-primary-50 rounded-xl">
                    <p className="text-sm text-primary-600">
                      预估重量：<span className="font-semibold">{estimatedWeight} kg</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 衣物类型 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Shirt className="w-4 h-4 text-primary-500" />
                  衣物类型
                </label>
                <div className="flex flex-wrap gap-2">
                  {clothingTypeOptions.map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleClothingTypeToggle(type)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.clothingTypes.includes(type)
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type}
                      {formData.clothingTypes.includes(type) && (
                        <Check className="w-4 h-4 inline ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 是否清洗 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
                  <Check className="w-4 h-4 text-primary-500" />
                  清洗状态
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isCleaned: true }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      formData.isCleaned
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Check className={`w-6 h-6 mx-auto mb-2 ${formData.isCleaned ? 'text-primary-500' : 'text-gray-300'}`} />
                    <p className={`text-sm font-medium ${formData.isCleaned ? 'text-primary-700' : 'text-gray-600'}`}>
                      已清洗
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, isCleaned: false }))}
                    className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                      !formData.isCleaned
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <X className={`w-6 h-6 mx-auto mb-2 ${!formData.isCleaned ? 'text-orange-500' : 'text-gray-300'}`} />
                    <p className={`text-sm font-medium ${!formData.isCleaned ? 'text-orange-700' : 'text-gray-600'}`}>
                      未清洗
                    </p>
                  </button>
                </div>
              </div>

              {/* 是否含鞋包玩具 */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">含鞋包玩具</p>
                    <p className="text-sm text-gray-500">投放物中是否包含鞋子、包包或玩具</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hasShoesBagsToys: !prev.hasShoesBagsToys }))}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    formData.hasShoesBagsToys ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      formData.hasShoesBagsToys ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* 捐赠人 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 text-primary-500" />
                  捐赠人（选填）
                </label>
                <input
                  type="text"
                  value={formData.contributor}
                  onChange={(e) => setFormData(prev => ({ ...prev, contributor: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="请输入捐赠人姓名"
                />
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
                disabled={!formData.recoveryPointId || formData.clothingTypes.length === 0}
                className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认登记
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

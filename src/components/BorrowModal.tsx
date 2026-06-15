import { useState } from 'react';
import { X, User, Home, FileText, MapPin, Calendar, Check } from 'lucide-react';
import useTableStore from '@/store/useTableStore';
import type { BorrowFormData } from '@/types';
import { cn } from '@/utils/helpers';

export default function BorrowModal() {
  const { isBorrowModalOpen, selectedTableId, tables, closeBorrowModal, borrowTable } =
    useTableStore();

  const table = tables.find((t) => t.id === selectedTableId);

  const [formData, setFormData] = useState<BorrowFormData>({
    residentName: '',
    residentRoom: '',
    purpose: '',
    moveTo: '',
    expectedReturn: '',
    withTablecloth: false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BorrowFormData, string>>>({});

  const handleChange = (field: keyof BorrowFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof BorrowFormData, string>> = {};
    if (!formData.residentName.trim()) newErrors.residentName = '请填写住户姓名';
    if (!formData.residentRoom.trim()) newErrors.residentRoom = '请填写门牌号';
    if (!formData.purpose.trim()) newErrors.purpose = '请填写用途';
    if (!formData.moveTo.trim()) newErrors.moveTo = '请填写搬去哪里';
    if (!formData.expectedReturn) newErrors.expectedReturn = '请选择预计归还时间';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate() || !selectedTableId) return;
    borrowTable(selectedTableId, formData);
    setFormData({
      residentName: '',
      residentRoom: '',
      purpose: '',
      moveTo: '',
      expectedReturn: '',
      withTablecloth: false,
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeBorrowModal();
    }
  };

  if (!isBorrowModalOpen || !table) return null;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateTime = tomorrow.toISOString().slice(0, 16);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-slideUp overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-teal-500 to-teal-600 p-5">
          <button
            onClick={closeBorrowModal}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-white/80 text-sm font-medium">借出登记</p>
          <h2 className="text-white text-xl font-bold mt-1">{table.id} · {table.size}</h2>
          <p className="text-white/70 text-sm mt-1">{table.storageCabinet}</p>
        </div>

        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <User className="w-4 h-4 text-gray-400" />
                住户姓名
              </label>
              <input
                type="text"
                value={formData.residentName}
                onChange={(e) => handleChange('residentName', e.target.value)}
                placeholder="请输入姓名"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.residentName
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-teal-200 focus:border-teal-400'
                )}
              />
              {errors.residentName && (
                <p className="mt-1 text-xs text-red-500">{errors.residentName}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Home className="w-4 h-4 text-gray-400" />
                门牌号
              </label>
              <input
                type="text"
                value={formData.residentRoom}
                onChange={(e) => handleChange('residentRoom', e.target.value)}
                placeholder="例如：3栋502"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.residentRoom
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-teal-200 focus:border-teal-400'
                )}
              />
              {errors.residentRoom && (
                <p className="mt-1 text-xs text-red-500">{errors.residentRoom}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <FileText className="w-4 h-4 text-gray-400" />
                用途
              </label>
              <input
                type="text"
                value={formData.purpose}
                onChange={(e) => handleChange('purpose', e.target.value)}
                placeholder="例如：生日会、读书会、讲座"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.purpose
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-teal-200 focus:border-teal-400'
                )}
              />
              {errors.purpose && <p className="mt-1 text-xs text-red-500">{errors.purpose}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 text-gray-400" />
                搬去哪里
              </label>
              <input
                type="text"
                value={formData.moveTo}
                onChange={(e) => handleChange('moveTo', e.target.value)}
                placeholder="例如：活动室大厅、2号厅"
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.moveTo
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-teal-200 focus:border-teal-400'
                )}
              />
              {errors.moveTo && <p className="mt-1 text-xs text-red-500">{errors.moveTo}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                预计归还时间
              </label>
              <input
                type="datetime-local"
                value={formData.expectedReturn}
                onChange={(e) => handleChange('expectedReturn', e.target.value)}
                min={minDateTime}
                className={cn(
                  'w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-all',
                  errors.expectedReturn
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-teal-200 focus:border-teal-400'
                )}
              />
              {errors.expectedReturn && (
                <p className="mt-1 text-xs text-red-500">{errors.expectedReturn}</p>
              )}
            </div>

            {table.hasTablecloth && (
              <div
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleChange('withTablecloth', !formData.withTablecloth)}
              >
                <div>
                  <p className="text-sm font-medium text-gray-700">是否带桌布</p>
                  <p className="text-xs text-gray-500 mt-0.5">该桌子配有桌布</p>
                </div>
                <div
                  className={cn(
                    'w-12 h-7 rounded-full relative transition-colors duration-200',
                    formData.withTablecloth ? 'bg-teal-500' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200',
                      formData.withTablecloth ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  >
                    {formData.withTablecloth && (
                      <Check className="w-3 h-3 text-teal-500 absolute top-1.5 left-1.5" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <div className="flex gap-3">
            <button
              onClick={closeBorrowModal}
              className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              确认借出
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
